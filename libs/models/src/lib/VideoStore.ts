import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import Auth from '@reelist/models/Auth'
import VideoList from '@reelist/models/VideoList'
import User from '@reelist/models/User'
import { inject, injectable } from 'inversify'
import { SupabaseClient } from '@supabase/supabase-js'
import VideoApi from '@reelist/apis/VideoApi'
import { VideoTableType } from 'libs/interfaces/src/lib/tables/VideoTable'
import UserStore from '@reelist/models/UserStore'
import UserVideo, { UserVideoType } from '@reelist/models/UserVideo'
import { settleAll } from '@reelist/utils/settleAll'
import { TmdbTvSeason } from '@reelist/interfaces/tmdb/TmdbShowResponse'
import { AnyVideoType, TmdbVideoType } from '@reelist/models/Video'
import { TmdbClient } from '@reelist/utils/tmdbHelpers/TmdbClient'

@injectable()
class VideoStore {
  // TODO: do we want separate caches for partials and fulls? do we always need the full when we call for it?
  // for partial video modals, do we have enough information?
  tmdbJsonByVideoId: Record<string, TmdbVideoType | null> = {}
  videoSeasonMapByVideoId: Record<string, Record<number, TmdbTvSeason | null>> = {}
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

    const tmdbVideo = await this.getVideo(videoId, userVideoData?.last_watched_season_number)

    if (!tmdbVideo) return null

    if (tmdbVideo.isTv) console.log('making user show')

    const userVideo = UserVideo.create(tmdbVideo, user, userVideoData)

    this.userVideoById[userId] ||= {}

    this.userVideoById[userId][videoId] = userVideo

    return userVideo
  }

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

    const videos = await settleAll(videoIds.map(videoId => this.getVideo(videoId)))

    return _.compact(videos)
  }

  getVideo = async (videoId: string, seasonNumber?: number | null) => {
    if (this.tmdbJsonByVideoId[videoId]) {
      const video = this.tmdbJsonByVideoId[videoId]
      const number = seasonNumber ?? 1

      if (video?.isTv && !video.hasSeason(number)) {
        await video.fetchSeason(number)
      }

      return video
    }

    let seasonsStringToRequest = ',season/1'

    if (seasonNumber) {
      seasonsStringToRequest += `,season/${seasonNumber},season/${seasonNumber + 1}`
    }

    const video = await TmdbClient.getVideoById(videoId, seasonsStringToRequest)

    this.tmdbJsonByVideoId[videoId] = video

    return video
  }

  getVideosForVideoList = async (videoList: VideoList) => {
    return this.getVideos(videoList.videoIds)
  }

  // getTrackedVideos({userId?: string | null, baseOnly: false}) => Promise<UserVideo[]>;
  getTrackedVideos(args?: {
    userId?: string | null
    baseOnly?: false | undefined
  }): Promise<UserVideoType[]>
  getTrackedVideos(args?: { userId?: string | null; baseOnly: true }): Promise<TmdbVideoType[]>
  async getTrackedVideos({
    userId = null,
    baseOnly = false,
  }: {
    userId?: string | null
    baseOnly?: boolean
  } = {}): Promise<AnyVideoType[]> {
    if (!this.storeAuth.loggedIn) return []

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

      await settleAll(
        userVideos.map(async video => {
          if (video.isTv) {
            await video.fetchSeasons()
          }
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
  } = {}): Promise<TmdbVideoType[]> => {
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

  getVideoOrUserVideo = async (videoId: string, userId?: string): Promise<AnyVideoType | null> => {
    let video: AnyVideoType | null
    const user = userId ? await this.userStore.getUser(userId) : null

    if (user) {
      video = await this.getVideoProgressForUser(videoId, user)
    } else {
      video = await this.getVideo(videoId)
    }

    return video
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
    }

    return this.getUserVideo(videoId, user, videoJson || undefined)
  }
}

export default VideoStore
