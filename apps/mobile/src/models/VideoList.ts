import supabase from '~/supabase'
import _, { flow } from 'lodash'
import {
  extendObservable,
  isObservableArray,
  makeAutoObservable,
  makeObservable,
  runInAction,
} from 'mobx'
import Auth from './Auth'
import humps from 'humps'
import VideoListStore from './VideoListStore'
import Video from './Video'
import { callTmdb } from '~/api/api'
import ShortUniqueId from 'short-unique-id'
import User from '~/models/User'

class VideoList {
  id!: string
  adminIds!: string[]
  name!: string
  videoIds!: string[]
  isPublic!: boolean
  uniqueId!: string

  admins: User[] = []
  videos: Video[] = []
  videosRetrieved = false

  videoListStore: VideoListStore
  storeAuth: Auth

  constructor(json: VideoListJsonType, auth: Auth, videoListStore: VideoListStore) {
    this._assignValuesFromJson(json)

    this.storeAuth = auth
    this.videoListStore = videoListStore

    makeAutoObservable(this, {
      id: false,
      storeAuth: false,
    })
  }

  _assignValuesFromJson = (json: VideoListJsonType) => {
    Object.assign(this, humps.camelizeKeys(json))
  }

  getVideoPath = (videoId: string, seasonNumber?: string) => {
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

  getVideo = async (videoId: string) => {
    const path = this.getVideoPath(videoId)

    if (!path) return null

    try {
      const video = await callTmdb(path).then(item => _.get(item, 'data.data') as Video | null)

      return video && new Video(video, this.storeAuth, null, videoId)
    } catch (e) {
      console.error('unable to get video:', videoId)
    }

    return null
  }

  getVideos = async () => {
    if (this.videosRetrieved) return this.videos

    const videos: Array<Video | null> = await Promise.all(this.videoIds.map(this.getVideo))

    this.videos = _.compact(videos)
    this.videosRetrieved = true
  }

  join = async () => {
    const { data: nextVideoList, error } = await supabase
      .from<VideoListJsonType>('videoLists')
      .update({ admin_ids: this.adminIds.concat(this.storeAuth.user.id) })
      .match({ id: this.id })
      .single()

    if (error) {
      console.error('failed to join videolist', error.message)
    } else if (nextVideoList) {
      this._assignValuesFromJson(nextVideoList)
      this.videoListStore.addToAdminVideoList(this)
    } else {
      console.log('nothing happened?')
    }
  }

  leave = async () => {
    const { data: nextVideoList, error } = await supabase
      .from<VideoListJsonType>('videoLists')
      .update({ admin_ids: _.without(this.adminIds, this.storeAuth.user.id) })
      .match({ id: this.id })
      .single()

    if (error) {
      console.error('failed to leave videolist', error.message)
    } else if (nextVideoList) {
      this._assignValuesFromJson(nextVideoList)
      this.videoListStore.removeFromAdminVideoList(this)
    } else {
      console.log('nothing happened?')
    }
  }

  update = async (name: string, isPublic: boolean) => {
    if (name.length <= 3) {
      throw new Error('Name must be 3 characters or longer')
    }
    const { data: videoLists, error } = await supabase
      .from('videoLists')
      .update({ name, is_public: isPublic })
      .match({ id: this.id })

    if (error) {
      console.error('failed to edit videolist', error.message)
      throw error
    }
  }

  includes = (video: Video) => {
    return this.videoIds.includes(video.videoId)
  }

  addOrRemoveVideo = async (video: Video) => {
    const videoId = video.videoId
    let addingVideo = false

    const nextList = _.without(this.videoIds, videoId)
    if (this.videoIds.length === nextList.length) {
      nextList.push(videoId)
      addingVideo = true
    }

    const { data: _videoListResponse, error } = await supabase
      .from('videoLists')
      .update({ video_ids: nextList })
      .match({ id: this.id })

    if (error) {
      console.error(
        'failed to',
        addingVideo ? 'add' : 'remove',
        video.videoName,
        'to/from',
        this.name,
        'error: ',
        error.message,
      )
    } else if (addingVideo) {
      this.videos.push(video)
      this.videoIds.push(videoId)
    } else {
      _.remove(this.videos, video => video.videoId === videoId)
      _.pull(this.videoIds, videoId)
    }
  }

  getByUniqueId = async (uniqueId: string) => {
    const { data: videoListResponse, error } = await supabase
      .from('videoLists')
      .select('*')
      .match({ unique_id: uniqueId })
      .single()

    if (error) {
      throw error.message
    }

    return new VideoList(videoListResponse, this.storeAuth, this.videoListStore)
  }

  updateUniqueId = async (uniqueId: string) => {
    const { data: videoListResponse, error } = await supabase
      .from('videoLists')
      .update({ unique_id: uniqueId })
      .match({ id: this.id })
      .single()

    if (error) {
      throw error.message
    }

    return new VideoList(videoListResponse, this.storeAuth, this.videoListStore)
  }

  getShareUniqId = async () => {
    if (this.uniqueId) return this.uniqueId

    let generateUniqueIdCount = 1
    let uniqueId = null

    while (generateUniqueIdCount < 2 && uniqueId === null) {
      const generateUniqueId = new ShortUniqueId({ length: 10 })
      const idAttempt = generateUniqueId()

      try {
        await this.getByUniqueId(idAttempt)
      } catch (e) {
        uniqueId = idAttempt
      }

      generateUniqueIdCount += 1
    }

    if (uniqueId) {
      await this.updateUniqueId(uniqueId)
    }

    return uniqueId
  }

  fetchAdmins = async () => {
    if (!this.adminIds) return

    const adminPromises = this.adminIds?.map(adminId =>
      User.fromAuthId(adminId, { loggedIn: false }),
    )

    const admins: (User | undefined)[] = await Promise.allSettled(adminPromises).then(values =>
      _.map(values, 'value'),
    )

    this.admins = _.compact(admins)
  }
}

export type VideoListJsonType = humps.Decamelized<VideoList>

export default VideoList
