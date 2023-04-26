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
import { VideoTableType } from '@reelist/utils/interfaces/tables/VideoTable'
import TableApi from '@reelist/apis/TableApi'

@injectable()
class VideoStore {
  currentVideoId: string | null = null
  tmdbJsonByVideoId: Record<string, Video | null> = {}
  videoSeasonMapByVideoId: Record<string, Record<number, TvSeason | null>> = {}

  private videoApi: VideoApi

  constructor(
    @inject(Auth) private storeAuth: Auth,
    @inject(SupabaseClient) protected supabase: SupabaseClient,
  ) {
    this.videoApi = new VideoApi('videos', supabase)

    makeAutoObservable(this)
  }

  makeUiVideo = (json: Video, videoId?: string, videoTableData?: VideoTableType | null) => {
    return new Video(json, videoTableData, videoId, this, this.videoApi)
  }

  setCurrentVideoId = (videoId: string | null) => {
    this.currentVideoId = videoId
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

    const videos: Array<Video | null> = await Promise.all(
      videoIds.map(videoId => this.getVideo(videoId)),
    )

    return _.compact(videos)
  }

  getVideo = async (videoId: string, videoTableData: VideoTableType | null = null) => {
    const path = this.getVideoPath(videoId)

    if (!path) return null

    let video: Video | null = this.tmdbJsonByVideoId[videoId]

    if (_.isUndefined(video)) {
      video = await callTmdb(path, { append_to_response: 'images' }).then(
        item => _.get(item, 'data.data') || null,
      )

      this.tmdbJsonByVideoId[videoId] = video || null
    }

    const uiVideo = video && this.makeUiVideo(video, videoId, videoTableData)

    return uiVideo
  }

  getVideosForVideoList = async (videoList: VideoList) => {
    return this.getVideos(videoList.videoIds)
  }

  _getTrackedVideo = (videoTableData: VideoTableType) => {
    return this.getVideo(videoTableData.video_id, videoTableData)
  }

  getTrackedVideos = async ({
    userId = null,
    includeSeasons = true,
  }: {
    userId?: string | null
    includeSeasons?: boolean
  } = {}): Promise<Video[]> => {
    console.log('getTrackedVideos for user: ', this.storeAuth.user.id)
    let videos: Video[] = []
    const { data: videoJsons, error } = await this.videoApi.match({
      user_id: userId || this.storeAuth.user.id,
      tracked: true,
    })

    if (error) {
      console.error('failed to lazy load tracked videos', error.message)
      throw new Error('failed to lazy load tracked videos: ' + error.message)
    } else if (videoJsons) {
      const videoPromises = await Promise.allSettled(videoJsons.map(this._getTrackedVideo))

      videos = _.chain(videoPromises).map('value').compact().value()

      if (includeSeasons) {
        await Promise.allSettled(videos.map(video => video.fetchSeasons()))
      }
    }

    return videos
  }

  getHistoricVideos = async ({
    userId = null,
    includeSeasons = true,
  }: {
    userId?: string | null
    includeSeasons?: boolean
  } = {}): Promise<Video[]> => {
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

    let videos: Video[] = []
    const { data: videoJsons, error } = await this.videoApi
      .match(match)
      .order('updated_at', { ascending: false })
      .limit(25)

    if (error) {
      console.error('failed to lazy load history videos', error.message)
      throw new Error('failed to lazy load history videos: ' + error.message)
    } else if (videoJsons) {
      const videoPromises = await Promise.allSettled(videoJsons.map(this._getTrackedVideo))

      videos = _.chain(videoPromises).map('value').compact().value()

      if (includeSeasons) {
        await Promise.allSettled(videos.map(video => video.fetchSeasons()))
      }
    }

    return videos
  }

  getVideoProgressesForUser = async (user: User | null, videoIds: string[] | undefined) => {
    if (!videoIds || _.isEmpty(videoIds) || !user) return []

    let videos: Video[] = []

    const { data: videoJsons, error } = await this.videoApi
      .match({ user_id: user.id })
      .in('video_id', videoIds)

    if (error) {
      console.error('failed to lazy load tracked videos', error.message)
      throw new Error('failed to lazy load tracked videos: ' + error.message)
    } else if (videoJsons) {
      const videoJsonMap = _.keyBy(videoJsons, 'video_id')

      const videoPromises = await Promise.allSettled(
        videoIds.map(videoId => {
          const videoJson = videoJsonMap[videoId] || {}

          return this.getVideo(videoId, videoJson)
        }),
      )

      videos = _.chain(videoPromises).map('value').compact().value()

      await Promise.allSettled(videos.map(video => video.fetchSeasons()))
    }

    return videos
  }
}

export default VideoStore
