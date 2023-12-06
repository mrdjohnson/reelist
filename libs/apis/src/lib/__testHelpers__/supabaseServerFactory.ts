import { factory, manyOf, oneOf, primaryKey } from '@mswjs/data'
import { UserTableType } from '@reelist/interfaces/tables/UserTable'

import { ModelDefinitionValue } from '@mswjs/data/lib/glossary'
import { faker } from '@faker-js/faker'
import { AutoSortType, VideoListTableType } from '@reelist/interfaces/tables/VideoListTable'
import { VideoInfoType, VideoTableType } from '@reelist/interfaces/tables/VideoTable'
import moment from 'moment'
import _ from 'lodash'
import { DefaultBodyType, StrictRequest } from 'msw'
import { userFactory } from '@reelist/models/__factories__/UserFactory'
import { videoListFactory } from '@reelist/models/__factories__/VideoListFactory'
import { videoTableTypeFactory } from '@reelist/interfaces/tables/__factories__/VideoTableFactory'
import videoList from '@reelist/models/VideoList'

// export function defineModel<T>(generator: () => { [key in keyof T]: ModelDefinitionValue }) {
//   return generator()
// }
//
// // All keys of `User` type need to be defined here
// const profiles = defineModel<UserTableType>(() => ({
//   id: primaryKey(faker.datatype.uuid),
//   name: () => faker.name.firstName(),
//   updated_at: () => faker.date.past().toISOString(),
//   username: () => faker.internet.userName(),
//   avatar_url: () => faker.internet.avatar(),
//   followed_list_ids: manyOf('videoLists'),
//   followed_user_ids: manyOf('profiles'),
//   notificationId: String,
// }))
//
// const videoLists = defineModel<VideoListTableType>(() => ({
//   id: primaryKey(faker.datatype.uuid),
//   name: () => faker.random.words(),
//   is_public: () => false,
//   admin_ids: () => [],
//   is_joinable: () => false,
//   video_ids: () => [], // manyOf relationship is not id based here
//   followed_user_ids: manyOf('profiles'),
//   unique_id: String,
//   auto_sort_type: () => AutoSortType.NONE,
//   auto_sort_is_ascending: () => false,
// }))
//
// const videos = defineModel<VideoTableType>(() => ({
//   id: primaryKey(faker.datatype.uuid),
//   video_id: () => faker.helpers.arrayElement(['tv', 'mv']) + faker.random.numeric(),
//   tracked: () => false,
//   last_watched_season_number: undefined,
//   last_watched_episode_number: undefined,
//   video_info: undefined,
//   user_id: oneOf('profiles'),
//   allow_in_history: () => false,
//   updated_at: () => moment().subtract(3, 'days').toISOString(),
// }))
//
// export const supabaseDb = factory({
//   profiles,
//   videoLists,
//   videos,
// })

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
