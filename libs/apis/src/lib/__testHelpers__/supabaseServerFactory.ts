import { UserTableType } from '@reelist/interfaces/tables/UserTable'

import { VideoListTableType } from '@reelist/interfaces/tables/VideoListTable'
import { VideoTableType } from '@reelist/interfaces/tables/VideoTable'
import _ from 'lodash'
import { DefaultBodyType, StrictRequest } from 'msw'
import { videoTableTypeFactory } from '@reelist/interfaces/tables/__factories__/VideoTableFactory'

const getId = (url: string) => url.match('eq.(?<id>.*)')?.groups?.id

const getIds = (url: string) => {
  const result = new URLSearchParams(url).get('id')

  return result?.match(/in\.\((?<ids>[^)]*)/)?.groups?.ids?.split(',')
}

const getUserIds = (url: string) => {
  const result = new URLSearchParams(url).get('admin_ids')

  return result?.match(/cs\.\{(?<adminIds>[^}]*)/)?.groups?.adminIds?.split(',')
}

type HttpType = 'get' | 'post' | 'patch' | 'delete'

type UrlHandlerType = {
  url: string
  httpType: HttpType
  request: StrictRequest<DefaultBodyType>
}

class SupabaseDb {
  private profiles: UserTableType[] = []
  private videoLists: VideoListTableType[] = []
  private videos: VideoTableType[] = []

  db = {
    createProfile: (userTableData: UserTableType) => {
      this.profiles.push(userTableData)
    },

    createVideoList: (videoListResponse: VideoListTableType) => {
      this.videoLists.push(videoListResponse)
    },

    createVideo: (video: Partial<VideoTableType> = {}) => {
      const videoResponse = videoTableTypeFactory.build(video)
      this.videos.push(videoResponse)

      return videoResponse
    },
  }

  addProfile(profile: UserTableType) {
    this.profiles.push(profile)
  }

  findProfile(id?: string) {
    return _.find(this.profiles, { id })
  }

  findProfiles(ids: string[]) {
    const profileMap = _.keyBy(this.profiles, 'id')
    const profiles = ids.map(id => profileMap[id])

    return _.compact(profiles)
  }

  async handleProfileUrl({ url, httpType, request }: UrlHandlerType) {
    const id = getId(url)
    const ids = getIds(url)

    switch (httpType) {
      case 'get':
        if (id) {
          return this.findProfile(id)
        } else if (ids) {
          return this.findProfiles(ids)
        }
        break

      case 'post':
      case 'patch':
        const body = await request.json()

        const profile = this.findProfile(id)

        if (!profile) throw new Error('Profile not found')

        Object.assign(profile, body)

        return profile
    }

    return null
  }

  findVideoList(id?: string) {
    return _.find(this.videoLists, { id })
  }

  findVideoLists(ids: string[]) {
    const videoListMap = _.keyBy(this.videoLists, 'id')
    const videoLists = ids.map(id => videoListMap[id])

    return _.compact(videoLists)
  }

  findVideoListsByAdminId(adminIds: string[]) {
    // new list of video lists that are shared with the given admin ids
    return _.reject(this.videoLists, videoList =>
      _.chain(videoList.admin_ids).intersection(adminIds).isEmpty().value(),
    )
  }

  async handleVideoListUrl({ url, httpType, request }: UrlHandlerType) {
    const id = getId(url)
    const ids = getIds(url)
    const adminIds = getUserIds(url)

    switch (httpType) {
      case 'get':
        if (id) {
          return this.findVideoList(id)
        } else if (ids) {
          return this.findVideoLists(ids)
        } else if (adminIds) {
          return this.findVideoListsByAdminId(adminIds)
        }

        break

      case 'post':
      case 'patch':
        const body = await request.json()

        const videoList = this.findVideoList(id)

        if (!videoList) throw new Error('VideoList not found')

        Object.assign(videoList, body)

        return videoList
    }

    return null
  }

  reset() {
    this.profiles = []
    this.videoLists = []
    this.videos = []
  }
}

const supabaseDb = new SupabaseDb()

export { supabaseDb }
