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
import humps, { Camelized } from 'humps'
import VideoListStore from './VideoListStore'
import Video from './Video'
import { callTmdb } from '~/api/api'
import ShortUniqueId from 'short-unique-id'
import User from '~/models/User'
import { createViewModel, IViewModel } from 'mobx-utils'

export type VideoListTableType = {
  id: string
  admin_ids: string[]
  is_joinable: boolean
  name: string
  video_ids: string[]
  is_public: boolean
  unique_id: string
}

type VideoListType = Camelized<VideoListTableType>
class VideoList implements VideoListType {
  id!: string
  adminIds!: string[]
  isJoinable!: boolean
  name!: string
  videoIds!: string[]
  isPublic!: boolean
  uniqueId!: string

  admins: User[] = []
  videos: Video[] = []
  videosRetrieved = false

  videoListStore: VideoListStore
  storeAuth: Auth

  constructor(json: VideoListTableType | null, auth: Auth, videoListStore: VideoListStore) {
    if (json) {
      this._assignValuesFromJson(json)
    } else {
      this.adminIds = []
      this.isJoinable = true
      this.name = ''
      this.videoIds = []
      this.isPublic = true
      this.uniqueId = ''
    }

    this.storeAuth = auth
    this.videoListStore = videoListStore

    makeAutoObservable(this, {
      id: false,
      storeAuth: false,
      videoListStore: false,
      // this is needed because mobx is confused about something that should not exist for blank items
      createdAt: false,
    })
  }

  _assignValuesFromJson = (json: VideoListTableType) => {
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
    this.viewModel.adminIds = this.adminIds.concat(this.storeAuth.user.id)

    VideoList.save(this.viewModel)
  }

  leave = async () => {
    this.viewModel.adminIds = _.without(this.adminIds, this.storeAuth.user.id)

    VideoList.save(this.viewModel)
  }

  static save = async (videoListViewModel: VideoList & IViewModel<VideoList>) => {
    const name = videoListViewModel.changedValues.get('name') as string
    if (name && name.length <= 3) {
      throw new Error('Name must be 3 characters or longer')
    }

    // Map{'exampleField' -> 'exampleValue'} -> {example_field: 'exampleValue'}
    const changedFields = humps.decamelizeKeys(Object.fromEntries(videoListViewModel.changedValues))

    const { data: videoList, error } = await supabase
      .from('videoLists')
      .update(changedFields)
      .match({ id: videoListViewModel.id })
      .single()

    if (error) {
      console.error('failed to edit videolist', error.message)
      throw error
    } else if (videoList) {
      videoListViewModel.submit()
    }
  }

  destroy = async () => {
    const { error } = await supabase
      .from<VideoListTableType>('videoLists')
      .delete()
      .match({ id: this.id })

    if (error) {
      console.error('failed to leave videolist', error.message)
    }
  }

  includes = (video: Video) => {
    return this.videoIds.includes(video.videoId)
  }

  addOrRemoveVideo = async (video: Video) => {
    const videoId = video.videoId

    const nextVideoIds = _.without(this.videoIds, videoId)
    const nextVideos = _.filter(this.videos, listVideo => listVideo.videoId === videoId)

    // if nothing changed when we tried to remove, add instead
    if (this.videoIds.length === nextVideoIds.length) {
      nextVideoIds.push(videoId)
      nextVideos.push(video)
    }

    this.viewModel.videoIds = nextVideoIds

    VideoList.save(this.viewModel).then(() => {
      this.videos = nextVideos
    })
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

  static createUniqueShareId = () => {
    const generateUniqueId = new ShortUniqueId({ length: 10 })
    const uniqueId = generateUniqueId()

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

  get viewModel() {
    return createViewModel<VideoList>(this)
  }
}

export default VideoList
