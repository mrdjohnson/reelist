import supabase from '~/supabase'
import Video from '~/models/Video'
import _ from 'lodash'
import { flow, flowResult, makeAutoObservable, runInAction } from 'mobx'
// import { camelizeKeys } from '@utils/camelizeKeys'
import Auth from './Auth'
import VideoList, { VideoListTableType } from './VideoList'
import { IViewModel } from 'mobx-utils'
import VideoStore from './VideoStore'

class VideoListStore {
  adminVideoLists: VideoList[] = []
  publicVideoLists: VideoList[] = []
  followedVideoLists: VideoList[] = []
  currentVideo: Video | null = null
  currentVideoList: VideoList | null = null

  storeAuth: Auth
  videoStore: VideoStore

  constructor(auth: Auth, videoStore: VideoStore) {
    makeAutoObservable(this, {
      getPublicVideoLists: flow,
      setCurrentVideoListFromShareId: flow,
    })

    this.storeAuth = auth
    this.videoStore = videoStore
  }

  makeUiVideoList = (videoList: VideoListTableType) => {
    return new VideoList(videoList, this.storeAuth, this, this.videoStore)
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

    const { data: videoLists, error } = await supabase
      .from<VideoListTableType>('videoLists')
      .select('*')
      .contains('admin_ids', [this.storeAuth.user?.id])
      .order('id', { ascending: false })

    if (error) {
      console.log('getAdminVideoLists error', error)
    }

    this.adminVideoLists = videoLists?.map(this.makeUiVideoList) || []
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

    const { data: videoList } = yield supabase
      .from<VideoListTableType>('videoLists')
      .select('*')
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

    const { data: videoListJson } = yield supabase
      .from<VideoListTableType>('videoLists')
      .select('*')
      .match({ id: this.currentVideoList.id })
      .single()

    if (!videoListJson) {
      throw new Error('unable to find list')
    }

    this.removeFromAllLists(this.currentVideoList)

    const videoList = this.makeUiVideoList(videoListJson)

    const addToList = (list: VideoList[]) => {
      const nextList = _.filter(list, { id: videoList.id })
      return [...nextList, videoList]
    }

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

    const { data: videoLists, error } = yield supabase
      .from<VideoListTableType>('videoLists')
      .select('*')
      .match({ is_public: true })
      .not('admin_ids', 'cs', '{"' + this.storeAuth.user?.id + '"}')
      .not('id', 'in', '(' + followedListIds + ')')
      .order('id', { ascending: false })

    if (error) {
      console.log('getPublicVideoLists error', error)
    }

    this.publicVideoLists = videoLists?.map(this.makeUiVideoList) || []
  })

  getfollowedVideoLists = flow(function* (this: VideoListStore) {
    if (!_.isEmpty(this.followedVideoLists)) return this.followedVideoLists

    const followedListIds = this.storeAuth.user.followedListIds

    const { data: videoLists, error } = yield supabase
      .from<VideoListTableType>('videoLists')
      .select('*')
      .in('id', followedListIds)

    if (error) {
      console.log('getfollowedVideoLists error', error)
    }

    this.followedVideoLists = videoLists?.map(this.makeUiVideoList) || []
  })

  createBlankVideoList = () => {
    const videoList = new VideoList(null, this.storeAuth, this, this.videoStore)

    return videoList
  }

  createVideoList = async (videoListViewModel: VideoList & IViewModel<VideoList>) => {
    const { name, isPublic, isJoinable } = videoListViewModel
    const uniqueShareId = VideoList.createUniqueShareId()

    const { data: videoListJson, error } = await supabase
      .from<VideoListTableType>('videoLists')
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
    if (videoList === null) {
      this.currentVideoList = null
      return
    }

    this.currentVideoList = videoList
  }

  clearVideoLists = () => {
    this.adminVideoLists = []
    this.publicVideoLists = []
    this.followedVideoLists = []
  }
}

export default VideoListStore
