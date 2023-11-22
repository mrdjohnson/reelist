import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import Auth from '@reelist/models/Auth'
import Video, { TvSeason } from '@reelist/models/Video'
import VideoList from '@reelist/models/VideoList'
import { callTmdb } from '@reelist/apis/api'
import User from '@reelist/models/User'
import { inject, injectable } from 'inversify'
import { SupabaseClient } from '@supabase/supabase-js'
import VideoApi from '@reelist/apis/VideoApi'
import { VideoTableType } from 'libs/interfaces/src/lib/tables/VideoTable'
import {
  TmdbVideoByIdResponse,
  TmdbVideoByIdType,
} from '@reelist/interfaces/tmdb/TmdbVideoByIdType'
import { TmdbVideoByIdFormatter } from '@reelist/utils/tmdbHelpers/TmdbVideoByIdFormatter'
import UserStore from '@reelist/models/UserStore'
import UserVideo, { UserVideoType } from '@reelist/models/UserVideo'
import { UserTableType } from '@reelist/interfaces/tables/UserTable'

@injectable()
class VideoStore {
  // TODO: do we want separate caches for partials and fulls? do we always need the full when we call for it?
  // for partial video modals, do we have enough information?
  tmdbJsonByVideoId: Record<string, TmdbVideoByIdType | null> = {}
  videoSeasonMapByVideoId: Record<string, Record<number, TvSeason | null>> = {}
  userVideoById: Record<string, Record<string, UserVideoType>> = {}

  private videoApi: VideoApi

  constructor(
    @inject(Auth) private storeAuth: Auth,
    @inject(SupabaseClient) supabase: SupabaseClient,
    @inject(UserStore) private userStore: UserStore,
  ) {
    this.videoApi = new VideoApi('videos', supabase)

    makeAutoObservable(this)
  }

  getCachedUserVideo(userId: string, videoId: string): UserVideoType | null {
    return this.userVideoById[userId]?.[videoId]
  }

  getUserVideo = async (videoId: string, user: User, userVideoData?: VideoTableType) => {
    const userId = user.id

    const cachedUserVideo = this.getCachedUserVideo(userId, videoId)

    if (cachedUserVideo) {
      return cachedUserVideo
    }

    const tmdbVideo = await this.getVideo(videoId)

    if (!tmdbVideo) return null

    return UserVideo.create(tmdbVideo, user, userVideoData)
  }

  // makeUiVideo = (
  //   json: TmdbVideoResponseType,
  //   videoId: string,
  //   videoTableData?: VideoTableType | null,
  // ) => {
  //   return new Video(json, videoTableData, videoId)
  // }

  getVideoPath = (videoId: string, seasonNumber?: number) => {
    const videoIdMatch = videoId.match(/(..)(.*)/)

    if (!videoIdMatch) return null

    const [_videoId, type, id] = videoIdMatch

    const videoType = type === 'mv' ? 'movie' : type

    let path = `/${videoType}/${id}`

    if (seasonNumber) {
      path += '/season/' + seasonNumber
    }

    return path
  }

  getVideos = async (videoIds: string[] | undefined) => {
    if (!videoIds) return []

    const videos: Array<TmdbVideoByIdType | null> = await Promise.all(
      videoIds.map(videoId => this.getVideo(videoId)),
    )

    return _.compact(videos)
  }

  getVideo = async (videoId: string) => {
    const path = this.getVideoPath(videoId)

    if (!path) return null

    const video = this.tmdbJsonByVideoId[videoId]
    let videoResponse: TmdbVideoByIdResponse | null

    if (_.isUndefined(video)) {
      videoResponse = await callTmdb<TmdbVideoByIdResponse>(path, {
        // TODO: images is never used; remove?
        append_to_response: 'images,similar,aggregate_credits,credits,watch/providers',
      }).then(item => _.get(item, 'data.data') || null)

      this.tmdbJsonByVideoId[videoId] = TmdbVideoByIdFormatter.fromTmdbBaseVideo(
        videoResponse,
        videoId,
      )
    }

    return video || this.tmdbJsonByVideoId[videoId]

    // const uiVideo = video && this.makeUiVideo(video, videoId, videoTableData)
    //
    // return uiVideo
  }

  getVideosForVideoList = async (videoList: VideoList) => {
    return this.getVideos(videoList.videoIds)
  }

  // getTrackedVideos({userId?: string | null, baseOnly: false}) => Promise<UserVideo[]>;
  getTrackedVideos(args?: {
    userId?: string | null
    baseOnly?: false | undefined
  }): Promise<UserVideoType[]>
  getTrackedVideos(args?: { userId?: string | null; baseOnly: true }): Promise<TmdbVideoByIdType[]>
  async getTrackedVideos({
    userId = null,
    baseOnly = false,
  }: {
    userId?: string | null
    baseOnly?: boolean
  } = {}): Promise<UserVideoType[] | TmdbVideoByIdType[]> {
    console.log('getTrackedVideos for user: ', this.storeAuth.user.id)
    const user = await this.userStore.getUser(userId || this.storeAuth.user.id)

    if (!user) return []

    let userVideos: UserVideoType[] = []
    const { data: videoJsons, error } = await this.videoApi.match({
      user_id: userId || this.storeAuth.user.id,
      tracked: true,
    })

    if (error) {
      console.error('failed to lazy load tracked videos', error.message)
      throw new Error('failed to lazy load tracked videos: ' + error.message)
    } else if (videoJsons) {
      userVideos = await settleAll(
        videoJsons.map(videoTableData => {
          return this.getUserVideo(videoTableData.video_id, user, videoTableData)
        }),
      )
    }

    if (baseOnly) {
      return _.map(userVideos, 'tmdbVideo')
    }

    return userVideos
  }

  getHistoricVideos = async ({
    userId = null,
  }: {
    userId?: string | null
  } = {}): Promise<TmdbVideoByIdType[]> => {
    console.log('getHistoricVideos for user: ', this.storeAuth.user.id)

    const serverUserId = userId || this.storeAuth.user.id

    const match: Partial<VideoTableType> = {
      user_id: serverUserId,
    }

    // only show history items that the user allows to be seen by others
    // for "self" show all history items
    if (userId !== this.storeAuth.user.id) {
      match.allow_in_history = true
    }

    const { data: videoJsons, error } = await this.videoApi
      .match(match)
      .order('updated_at', { ascending: false })
      .limit(25)

    if (error) {
      console.error('failed to lazy load history videos', error.message)
      throw new Error('failed to lazy load history videos: ' + error.message)
    } else if (videoJsons) {
      return await settleAll(
        videoJsons.map(videoTableData => this.getVideo(videoTableData.video_id)),
      )
    }

    return []
  }

  getVideoProgressesForUser = async (user: User | null, videoIds: string[] | undefined) => {
    if (!videoIds || _.isEmpty(videoIds) || !user) return []

    const { data: videoJsons, error } = await this.videoApi
      .match({ user_id: user.id })
      .in('video_id', videoIds)

    if (error) {
      console.error('failed to lazy load tracked userVideos', error.message)
      throw new Error('failed to lazy load tracked userVideos: ' + error.message)
    } else if (videoJsons) {
      const videoJsonMap = _.keyBy(videoJsons, 'video_id')

      return await settleAll(
        videoIds.map(videoId => {
          const videoJson = videoJsonMap[videoId] || {}

          return this.getUserVideo(videoId, user, videoJson)
        }),
      )
    }

    return []
  }

  getVideoProgressForUser = async (videoId: string, userToFind?: User) => {
    const user = userToFind || this.storeAuth.user
    const userId = user.id

    const cachedUserVideo = this.getCachedUserVideo(userId, videoId)

    // check cache first before doing another db call
    if (cachedUserVideo) {
      return cachedUserVideo
    }

    const { data: videoJson, error } = await this.videoApi
      .match({ user_id: user.id, video_id: videoId })
      .maybeSingle()

    if (error) {
      console.error('failed to lazy load tracked userVideos', error.message)
      throw new Error('failed to lazy load tracked userVideos: ' + error.message)
    } else if (videoJson) {
      return this.getUserVideo(videoId, user, videoJson)
    }

    return null
  }
}

const settleAll = async <T>(promises: Promise<T>[]) => {
  const videoPromises: Array<{
    status: string
    value?: T | null
  }> = await Promise.allSettled(promises)

  return _.chain(videoPromises).map('value').compact().value()
}

export default VideoStore
