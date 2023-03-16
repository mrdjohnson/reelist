import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import Auth from './Auth'
import humps, { Camelized } from 'humps'
import VideoListStore from './VideoListStore'
import Video from './Video'
import ShortUniqueId from 'short-unique-id'
import User from '@reelist/models/User'
import { createViewModel, IViewModel } from 'mobx-utils'
import { humanizedDuration } from '@reelist/utils/humanizedDuration'
import VideoStore from './VideoStore'
import UserStore from './UserStore'
import { SupabaseClient } from '@supabase/supabase-js'

export enum AutoSortType {
  NONE,
  NAME,
  FIRST_AIRED,
  LAST_AIRED,
  TOTAL_TIME,
}

export type VideoListTableType = {
  id: string
  admin_ids: string[]
  is_joinable: boolean
  name: string
  video_ids: string[]
  is_public: boolean
  unique_id: string
  auto_sort_type: AutoSortType
  auto_sort_is_ascending: boolean
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
  autoSortType!: AutoSortType
  autoSortIsAscending!: boolean

  admins: User[] = []
  videos: Video[] = []
  videosRetrieved = false

  videoListStore: VideoListStore
  storeAuth: Auth
  videoStore: VideoStore
  userStore: UserStore
  _viewModel?: VideoList & IViewModel<VideoList> = undefined

  static supabase: SupabaseClient

  constructor(
    json: VideoListTableType | null,
    auth: Auth,
    videoListStore: VideoListStore,
    videoStore: VideoStore,
    userStore: UserStore,
    private supabase: SupabaseClient,
  ) {
    if (json) {
      this._assignValuesFromJson(json)
    } else {
      this.adminIds = []
      this.isJoinable = true
      this.name = ''
      this.videoIds = []
      this.isPublic = true
      this.uniqueId = ''
      this.autoSortType = AutoSortType.NONE
      this.autoSortIsAscending = true
    }

    this.storeAuth = auth
    this.videoListStore = videoListStore
    this.videoStore = videoStore
    this.userStore = userStore

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

  getVideos = async () => {
    if (this.videosRetrieved) return this.videos

    const videos: Array<Video | null> = await Promise.all(
      this.videoIds.map(videoId => this.videoStore.getVideo(videoId)),
    )

    this.videos = _.compact(videos)
    this.videosRetrieved = true
  }

  join = async () => {
    this.viewModel.adminIds = this.adminIds.concat(this.storeAuth.user.id)

    this.save()
  }

  leave = async () => {
    this.viewModel.adminIds = _.without(this.adminIds, this.storeAuth.user.id)

    this.save()
  }

  save = async () => {
    const videoListViewModel = this.viewModel

    if (!videoListViewModel.isDirty) return

    const name = videoListViewModel.changedValues.get('name') as string
    if (name && name.length <= 3) {
      throw new Error('Name must be 3 characters or longer')
    }

    const autoSortIsAscendingChanged = _.isBoolean(
      videoListViewModel.changedValues.get('autoSortIsAscending'),
    )
    const autoSortTypeChanged = videoListViewModel.changedValues.get('autoSortType')
    let videos = videoListViewModel.changedValues.get('videos') as Video[]

    if (autoSortIsAscendingChanged || autoSortTypeChanged || videos) {
      // if videos werent changed, grab the originals; sort videos
      videos = sortVideos(videoListViewModel, videos || videoListViewModel.model.videos)

      videoListViewModel.videoIds = videos.map(video => video.videoId)
      videoListViewModel.resetProperty('videos')
    }

    // Map{'exampleField' -> 'exampleValue'} -> {example_field: 'exampleValue'}
    const changedFields = humps.decamelizeKeys(Object.fromEntries(videoListViewModel.changedValues))

    const { data: videoList, error } = await this.supabase
      .from('videoLists')
      .update(changedFields)
      .match({ id: videoListViewModel.id })
      .single()

    if (error) {
      console.error('failed to edit videolist', error.message)
      throw error
    } else if (videoList) {
      if (videos) {
        // replace the videos
        videoListViewModel.videos = videos
      }

      videoListViewModel.submit()
    }
  }

  destroy = async () => {
    const { error } = await this.supabase
      .from<VideoListTableType>('videoLists')
      .delete()
      .match({ id: this.id })

    this.videoListStore.removeFromAllLists(this)

    if (error) {
      console.error('failed to leave videolist', error.message)
    }
  }

  includes = (video: Video) => {
    return this.videoIds.includes(video.videoId)
  }

  addOrRemoveVideo = async (video: Video) => {
    const videoId = video.videoId

    // make sure al lthe videos are loaded so we can compare them when sorting
    await this.getVideos()

    let nextVideos
    if (this.includes(video)) {
      nextVideos = _.reject(this.videos, listVideo => listVideo.videoId === videoId)
    } else {
      nextVideos = [...this.videos, video]
    }

    this.viewModel.videos = nextVideos

    return this.save()
  }

  static createUniqueShareId = () => {
    const generateUniqueId = new ShortUniqueId({ length: 10 })
    const uniqueId = generateUniqueId()

    return uniqueId
  }

  fetchAdmins = async () => {
    if (!this.adminIds) return

    this.admins = await this.userStore.getUsers(this.adminIds)
  }

  clearVideos = () => {
    this.videos = []
  }

  get viewModel() {
    if (!this._viewModel) {
      this._viewModel = createViewModel<VideoList>(this)
    }

    return this._viewModel
  }

  get totalDurationMinutes() {
    return _.chain(this.videos).map('totalDurationMinutes').sum().value()
  }

  get totalDuration() {
    console.log('getting total duration')
    const totalMinutes = _.chain(this.videos).map('totalDurationMinutes').sum().value()

    return humanizedDuration(totalMinutes)
  }
}

const sortVideos = (videoListViewModel: IViewModel<VideoList> & VideoList, videos: Video[]) => {
  const sortDirection = videoListViewModel.autoSortIsAscending ? 'asc' : 'desc'

  switch (videoListViewModel.autoSortType) {
    case AutoSortType.NONE:
      return videos

    case AutoSortType.NAME:
      return _.orderBy(videos, 'videoName', sortDirection)

    case AutoSortType.FIRST_AIRED:
      return _.orderBy(videos, 'videoReleaseDate', sortDirection)

    case AutoSortType.LAST_AIRED:
      return _.orderBy(videos, 'lastVideoReleaseDate', sortDirection)

    case AutoSortType.TOTAL_TIME:
      return _.orderBy(videos, 'totalDurationMinutes', sortDirection)
  }
}

export default VideoList
