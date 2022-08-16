import supabase from '~/supabase'
import Video from '~/models/Video'
import _ from 'lodash'
import { flow, flowResult, makeAutoObservable, runInAction } from 'mobx'
// import { camelizeKeys } from '@utils/camelizeKeys'
import Auth from './Auth'
import VideoList, { VideoListJsonType } from './VideoList'

class VideoListStore {
  adminVideoLists: VideoList[] = []
  publicVideoLists: VideoList[] = []
  currentVideo: Video | null = null
  currentVideoList: VideoList | null = null
  storeAuth: Auth

  constructor(auth: Auth) {
    makeAutoObservable(this, {
      getPublicVideoLists: flow,
      setCurrentVideoListFromShareId: flow,
    })

    this.storeAuth = auth
  }

  makeUiVideoList = (videoList: VideoListJsonType) => {
    return new VideoList(videoList, this.storeAuth, this)
  }

  addToAdminVideoList = (videoList: VideoList) => {
    this.adminVideoLists.push(videoList)
    _.remove(this.publicVideoLists, publicVideoList => publicVideoList.id === videoList.id)
  }

  removeFromAdminVideoList = (videoList: VideoList) => {
    _.remove(this.adminVideoLists, adminVideoList => adminVideoList.id === videoList.id)
    this.publicVideoLists.push(videoList)
  }

  getAdminVideoLists = async () => {
    if (!_.isEmpty(this.adminVideoLists)) return this.adminVideoLists

    const { data: videoLists, error } = await supabase
      .from<VideoListJsonType>('videoLists')
      .select('*')
      .contains('admin_ids', [this.storeAuth.user?.id])
      .order('id', { ascending: false })

    if (error) {
      console.log('getAdminVideoLists error', error)
    }

    this.adminVideoLists = videoLists?.map(this.makeUiVideoList) || []
  }

  setCurrentVideoListFromShareId = flow(function* (this: VideoListStore, videoListShareId: string) {
    if (!videoListShareId) return

    const localVideoLists = [...this.adminVideoLists, ...this.publicVideoLists]
    const localVideoList = _.find(localVideoLists, { uniqueId: videoListShareId })

    if (localVideoList) {
      this.currentVideoList = localVideoList
      return
    }

    const { data: videoList } = yield supabase
      .from<VideoListJsonType>('videoLists')
      .select('*')
      .match({ unique_id: videoListShareId })
      .single()

    if (videoList) {
      this.currentVideoList = this.makeUiVideoList(videoList)
    } else {
      throw new Error('unable to find list')
    }
  })

  getPublicVideoLists = flow(function* (this: VideoListStore) {
    if (!_.isEmpty(this.publicVideoLists)) return this.publicVideoLists

    const { data: videoLists, error } = yield supabase
      .from<VideoListJsonType>('videoLists')
      .select('*')
      .not('admin_ids', 'cs', '{"' + this.storeAuth.user?.id + '"}')
      .order('id', { ascending: false })

    if (error) {
      console.log('getPublicVideoLists error', error)
    }

    this.publicVideoLists = videoLists?.map(this.makeUiVideoList) || []
  })

  createVideoList = async (name: string, isPublic: boolean, onSuccess: () => void = Function) => {
    const { data: videoListJson, error } = await supabase
      .from<VideoListJsonType>('videoLists')
      .insert({ name: name, is_public: isPublic, admin_ids: [this.storeAuth.user.id] })
      .single()

    if (error) {
      console.error('failed to create videolist', error.message)
    } else {
      const videoList = this.makeUiVideoList(videoListJson!)
      this.addToAdminVideoList(videoList)
      onSuccess()
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
}

export default VideoListStore
