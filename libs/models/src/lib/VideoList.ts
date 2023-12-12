import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import Auth from '@reelist/models/Auth'
import humps, { Camelized } from 'humps'
// import VideoListStore from '@reelist/models/VideoListStore'
import ShortUniqueId from 'short-unique-id'
import User from '@reelist/models/User'
import { createViewModel, IViewModel } from 'mobx-utils'
import { humanizedDuration } from '@reelist/utils/humanizedDuration'
import VideoStore from '@reelist/models/VideoStore'
import UserStore from '@reelist/models/UserStore'
import { AutoSortType, VideoListTableType } from 'libs/interfaces/src/lib/tables/VideoListTable'
import TableApi from '@reelist/apis/TableApi'
import { injectable } from 'inversify'
import { SupabaseClient } from '@supabase/supabase-js'
import inversionContainer from '@reelist/models/inversionContainer'
import { TmdbVideoPartialType } from '@reelist/interfaces/tmdb/TmdbVideoPartialType'
import { settleAll } from '@reelist/utils/settleAll'
import { TmdbVideoByIdType } from '@reelist/interfaces/tmdb/TmdbVideoByIdType'
import videoStore from '@reelist/models/VideoStore'
import { TmdbVideoType } from '@reelist/models/Video'

type VideoListType = Camelized<VideoListTableType>
@injectable()
class VideoList implements VideoListType {
  id: string = 'temp_'
  adminIds: string[] = []
  isJoinable: boolean = true
  name: string = ''
  videoIds: string[] = []
  isPublic: boolean = true
  uniqueId: string = ''
  autoSortType: AutoSortType = AutoSortType.NONE
  autoSortIsAscending: boolean = true

  admins: User[] = []
  videos: TmdbVideoByIdType[] = []
  videosRetrieved = false

  _viewModel?: VideoList & IViewModel<VideoList> = undefined

  private videoListApi: TableApi<VideoListType>
  private storeAuth: Auth = inversionContainer.get<Auth>(Auth)
  // private videoListStore: VideoListStore = inversionContainer.get<VideoListStore>(VideoListStore)
  private videoStore: VideoStore = inversionContainer.get<VideoStore>(VideoStore)
  private userStore: UserStore = inversionContainer.get<UserStore>(UserStore)
  private supabaseClient: SupabaseClient = inversionContainer.get<SupabaseClient>(SupabaseClient)

  constructor(json?: VideoListTableType) {
    if (json) {
      this._assignValuesFromJson(json)
    }

    this.videoListApi = new TableApi<VideoListType>('videoLists', this.supabaseClient)

    makeAutoObservable(this, {
      id: false,
      // this is needed because mobx is confused about something that should not exist for blank items
      // @ts-ignore
      createdAt: false,
    })
  }

  _assignValuesFromJson = (json: VideoListTableType) => {
    Object.assign(this, humps.camelizeKeys(json))
  }

  getVideos = async () => {
    if (this.videosRetrieved) return this.videos

    this.videos = await this.videoStore.getVideos(this.videoIds)

    this.videosRetrieved = true

    return this.videos
  }

  join = () => {
    this.viewModel.adminIds = this.adminIds.concat(this.storeAuth.user.id)

    return this.save()
  }

  leave = () => {
    this.viewModel.adminIds = _.without(this.adminIds, this.storeAuth.user.id)

    return this.save()
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
    const videoIdsChanged = videoListViewModel.changedValues.get('videoIds')

    if (autoSortIsAscendingChanged || autoSortTypeChanged || videoIdsChanged) {
      let videos = await this.videoStore.getVideos(videoListViewModel.videoIds)
      videos = sortVideos(videoListViewModel, videos)

      videoListViewModel.videoIds = _.map(videos, 'videoId')

      videoListViewModel.videosRetrieved = false
    }

    // Map{'exampleField' -> 'exampleValue'} -> {example_field: 'exampleValue'}
    const changedFields = humps.decamelizeKeys(Object.fromEntries(videoListViewModel.changedValues))

    const { data: videoList, error } = await this.videoListApi
      .update(changedFields)
      .match({ id: videoListViewModel.id })
      .single()

    if (error) {
      console.error('failed to edit videolist', error.message)
      throw error
    } else if (videoList) {
      videoListViewModel.submit()

      if (autoSortIsAscendingChanged || autoSortTypeChanged || videoIdsChanged) {
        await this.getVideos()
      }
    }
  }

  destroy = async () => {
    const { error } = await this.videoListApi.delete.match({ id: this.id })

    // this.videoListStore.removeFromAllLists(this)

    if (error) {
      console.error('failed to leave videolist', error.message)
    }
  }

  includes = (video: TmdbVideoPartialType) => {
    return this.videoIds.includes(video.videoId)
  }

  addOrRemoveVideo = async (video: TmdbVideoPartialType) => {
    this.viewModel.videoIds = _.xor(this.videoIds, [video.videoId])

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

    return humanizedDuration(this.totalDurationMinutes)
  }
}

const sortVideos = (
  videoListViewModel: IViewModel<VideoList> & VideoList,
  videos: TmdbVideoType[],
) => {
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
