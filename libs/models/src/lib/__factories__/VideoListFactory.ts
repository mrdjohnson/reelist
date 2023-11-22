import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import humps from 'humps'
import { AutoSortType, VideoListTableType } from 'libs/interfaces/src/lib/tables/VideoListTable'
import VideoList from '@reelist/models/VideoList'

export const videoListFactory = Factory.define<VideoListTableType, null, VideoList>(
  ({ sequence, params, onCreate, transientParams }) => {
    onCreate(videoListTableJson => new VideoList(videoListTableJson))

    return {
      id: `videoList_${sequence}`,
      admin_ids: [],
      is_joinable: false,
      is_public: false,
      name: faker.random.words(),
      video_ids: [],
      followed_list_ids: [],
      followed_user_ids: [],
      unique_id: '',
      auto_sort_type: AutoSortType.NONE,
      auto_sort_is_ascending: false,
    }
  },
)
