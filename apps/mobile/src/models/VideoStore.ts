import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import Auth from './Auth'
import Video, { TvSeason, VideoInfoType, VideoTableType } from './Video'
import VideoList from './VideoList'
import { callTmdb } from '~/api/api'
import supabase from '~/supabase'
import humps from 'humps'
import { findLastValidBreakpoint } from 'native-base/lib/typescript/theme/v33x-theme/tools'
import User from '~/models/User'

type TrackedVideoJson = {
  video_id: string
  video_info: VideoInfoType
  current_season: number
  current_episode: number
}
class VideoStore {
  storeAuth: Auth
  currentVideoId: string | null = null
  videoCache: Record<string, Video> = {}

  constructor(auth: Auth) {
    makeAutoObservable(this, {
      storeAuth: false,
    })

    this.storeAuth = auth
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

  getVideo = async (
    videoId: string,
    videoTableData: VideoTableType | null = null,
    useCache = true,
  ) => {
    // if (useCache && this.videoCache[videoId]) return this.videoCache[videoId]

    const path = this.getVideoPath(videoId)

    if (!path) return null

    const video = await callTmdb(path, null, '&append_to_response=images').then(
      item => _.get(item, 'data.data') as Video | null,
    )

    // const video = await supabase.functions
    //   .invoke('tmdb', {
    //     body: JSON.stringify({
    //       path,
    //     }),
    //   })
    //   .then(item => _.get(item, 'data.data') as VideoJsonType | null)

    const uiVideo = video && new Video(video, this.storeAuth, videoTableData, videoId)

    // if (uiVideo) {
    //   this.videoCache[videoId] = uiVideo
    // }

    return uiVideo
  }

  getVideosForVideoList = async (videoList: VideoList) => {
    const videos: Array<Video | null> = await Promise.all(
      videoList.videoIds.map(videoId => this.getVideo(videoId)),
    )

    return _.compact(videos)
  }

  _getTrackedVideo = (videoTableData: VideoTableType) => {
    return this.getVideo(videoTableData.video_id, videoTableData)
  }

  getTrackedVideos = async (userId: string | null = null): Promise<Video[]> => {
    console.log('getTrackedVideos for user: ', this.storeAuth.user.id)
    let videos: Video[] = []
    const { data: videoJsons, error } = await supabase
      .from<VideoTableType>('videos')
      .select('*')
      .match({ user_id: userId || this.storeAuth.user.id, tracked: true })

    if (error) {
      console.error('failed to lazy load tracked videos', error.message)
      throw new Error('failed to lazy load tracked videos: ' + error.message)
    } else if (videoJsons) {
      const videoPromises = await Promise.allSettled(videoJsons.map(this._getTrackedVideo))

      videos = _.chain(videoPromises).map('value').compact().value()

      await Promise.allSettled(videos.map(video => video.fetchSeasons()))
    }

    return videos
  }

  getVideoProgressesForUser = async (user: User | null, videoIds: string[] | undefined) => {
    if (!videoIds || _.isEmpty(videoIds) || !user) return []

    let videos: Video[] = []

    const { data: videoJsons, error } = await supabase
      .from<VideoTableType>('videos')
      .select('*')
      .match({ user_id: user.id })
      .in('video_id', videoIds)

    if (error) {
      console.error('failed to lazy load tracked videos', error.message)
      throw new Error('failed to lazy load tracked videos: ' + error.message)
    } else if (videoJsons) {
      const videoJsonMap = _.keyBy(videoJsons, 'video_id')

      const videoPromises = await Promise.allSettled(
        videoIds.map(videoId => {
          const videoJson = videoJsonMap[videoId]

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
