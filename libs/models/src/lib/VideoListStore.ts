import Video from '@reelist/models/Video'
import _ from 'lodash'
import { flow, makeAutoObservable } from 'mobx'
import Auth from '@reelist/models/Auth'
import VideoList from '@reelist/models/VideoList'
import { VideoListTableType } from 'libs/interfaces/src/lib/tables/VideoListTable'
import { IViewModel } from 'mobx-utils'
import { inject, injectable } from 'inversify'
import { SupabaseClient } from '@supabase/supabase-js'
import TableApi from '@reelist/apis/TableApi'

@injectable()
class VideoListStore {
  adminVideoLists: VideoList[] = []
  publicVideoLists: VideoList[] = []
  followedVideoLists: VideoList[] = []
  currentVideo: Video | null = null
  currentVideoList: VideoList | null = null

  private videoListApi: TableApi<VideoListTableType>

  constructor(
    @inject(Auth) private storeAuth: Auth,
    @inject(SupabaseClient) protected supabase: SupabaseClient,
  ) {
    this.videoListApi = new TableApi<VideoListTableType>('videoLists', supabase)

    makeAutoObservable(this, {
      getPublicVideoLists: flow,
      setCurrentVideoListFromShareId: flow,
    })
  }

  makeUiVideoList = (videoList: VideoListTableType) => {
    return new VideoList(videoList)
  }

  addToAdminVideoList = (videoList: VideoList) => {
    this.adminVideoLists = this.adminVideoLists.concat(videoList)
    this.publicVideoLists = _.without(this.publicVideoLists, videoList)
  }

  removeFromAdminVideoList = (videoList: VideoList) => {
    this.adminVideoLists = _.without(this.adminVideoLists, videoList)

    if (videoList.isPublic) {
      this.publicVideoLists = this.publicVideoLists.concat(videoList)
    }
  }

  // TODO: create a getter for these lists that auto sort them based on the user
  addToFollowedVideoList = (videoList: VideoList) => {
    this.followedVideoLists = this.followedVideoLists.concat(videoList)
    this.publicVideoLists = _.without(this.publicVideoLists, videoList)
  }

  removeFromFollowedVideoList = (videoList: VideoList) => {
    this.followedVideoLists = _.without(this.followedVideoLists, videoList)

    if (videoList.isPublic) {
      this.publicVideoLists = this.publicVideoLists.concat(videoList)
    }
  }

  removeFromAllLists = (videoList: VideoList) => {
    if (this.adminVideoLists.includes(videoList)) {
      this.adminVideoLists = _.without(this.adminVideoLists, videoList)
    } else if (this.publicVideoLists.includes(videoList)) {
      this.publicVideoLists = _.without(this.publicVideoLists, videoList)
    } else if (this.followedVideoLists.includes(videoList)) {
      this.followedVideoLists = _.without(this.followedVideoLists, videoList)
    }
  }

  getAdminVideoLists = async () => {
    if (!_.isEmpty(this.adminVideoLists)) return this.adminVideoLists

    const { data: videoLists, error } = await this.videoListApi.selectAll
      .contains('admin_ids', [this.storeAuth.user?.id])
      .order('id', { ascending: false })

    if (error) {
      console.log('getAdminVideoLists error', error)
    }

    this.adminVideoLists = videoLists?.map(this.makeUiVideoList) || []

    return this.adminVideoLists
  }

  setCurrentVideoListFromShareId = flow(function* (
    this: VideoListStore,
    videoListShareId: string | null,
  ) {
    if (!videoListShareId) return

    const localVideoLists = [...this.adminVideoLists, ...this.publicVideoLists]
    const localVideoList = _.find(localVideoLists, { uniqueId: videoListShareId })

    if (localVideoList) {
      this.currentVideoList = localVideoList
      return
    }

    const { data: videoList } = yield this.videoListApi
      .match({ unique_id: videoListShareId })
      .single()

    if (videoList) {
      this.currentVideoList = this.makeUiVideoList(videoList)
    } else {
      throw new Error('unable to find list')
    }
  })

  refreshCurrentVideoList = flow(function* (this: VideoListStore) {
    if (!this.currentVideoList) return

    const { data: videoListJson } = yield this.videoListApi
      .match({ id: this.currentVideoList.id })
      .single()

    if (!videoListJson) {
      throw new Error('unable to find list')
    }

    this.removeFromAllLists(this.currentVideoList)

    const videoList = this.makeUiVideoList(videoListJson)

    const addToList = (list: VideoList[]) => _.filter(list, { id: videoList.id }).concat(videoList)

    if (this.storeAuth.user.isAdminOfList(videoList)) {
      this.adminVideoLists = addToList(this.adminVideoLists)
    } else if (this.storeAuth.user.isFollowingVideoList(videoList)) {
      this.followedVideoLists = addToList(this.followedVideoLists)
    } else if (videoList.isPublic) {
      this.publicVideoLists = addToList(this.publicVideoLists)
    }

    this.currentVideoList = videoList
  })

  getPublicVideoLists = flow(function* (this: VideoListStore) {
    if (!_.isEmpty(this.publicVideoLists)) return this.publicVideoLists

    const followedListIds = this.storeAuth.user.followedListIds

    const { data: videoLists, error } = yield this.videoListApi
      .match({ is_public: true })
      .not('admin_ids', 'cs', '{"' + this.storeAuth.user?.id + '"}')
      .not('id', 'in', '(' + followedListIds + ')')
      .order('id', { ascending: false })

    if (error) {
      console.log('getPublicVideoLists error', error)
    }

    this.publicVideoLists = videoLists?.map(this.makeUiVideoList) || []

    return this.publicVideoLists
  })

  getfollowedVideoLists = flow(function* (this: VideoListStore) {
    if (!_.isEmpty(this.followedVideoLists)) return this.followedVideoLists

    const followedListIds = this.storeAuth.user.followedListIds

    const { data: videoLists, error } = yield this.videoListApi.selectAll.in('id', followedListIds)

    if (error) {
      console.log('getfollowedVideoLists error', error)
    }

    this.followedVideoLists = videoLists?.map(this.makeUiVideoList) || []

    return this.followedVideoLists
  })

  createVideoList = async (videoListViewModel: VideoList & IViewModel<VideoList>) => {
    const { name, isPublic, isJoinable } = videoListViewModel
    const uniqueShareId = VideoList.createUniqueShareId()

    const { data: videoListJson, error } = await this.videoListApi.fromTable
      .insert({
        name: name,
        is_public: isPublic,
        admin_ids: [this.storeAuth.user.id],
        is_joinable: isJoinable,
        unique_id: uniqueShareId,
      })
      .single()

    // todo: this might error if the unique_id is not unique
    if (error) {
      console.error('failed to create videolist', error.message)
    } else {
      const videoList = this.makeUiVideoList(videoListJson!)
      this.addToAdminVideoList(videoList)
    }
  }

  getAdminVideoListsForVideo = async (video: Video) => {
    await this.getAdminVideoLists()

    const videoId = video.videoId

    return _.filter(this.adminVideoLists, videoList => videoList.videoIds.includes(videoId))
  }

  setCurrentVideo = (video: Video | null) => {
    this.currentVideo = video
  }

  setCurrentVideoList = (videoList: VideoList | null) => {
    this.currentVideoList = videoList
  }

  clearVideoLists = () => {
    this.adminVideoLists = []
    this.publicVideoLists = []
    this.followedVideoLists = []
  }
}

export default VideoListStore
