import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import humps from 'humps'
import { AutoSortType, VideoListTableType } from 'libs/interfaces/src/lib/tables/VideoListTable'
import VideoList from '@reelist/models/VideoList'
import { mockServer } from '@reelist/apis/__testHelpers__/apiTestHelper'
import inversionContainer from '@reelist/models/inversionContainer'
import VideoListStore from '@reelist/models/VideoListStore'

export const videoListFactory = Factory.define<VideoListTableType, null, VideoList>(
  ({ sequence, params, onCreate, transientParams }) => {
    onCreate(async videoListTableJson => {
      mockServer.supabase.db.createVideoList(videoListTableJson)

      const videoListStore = inversionContainer.get<VideoListStore>(VideoListStore)

      const videoList = await videoListStore.getVideoList(videoListTableJson.id)

      if (!videoList) {
        throw new Error('unable to create video list')
      }

      return videoList
    })

    return {
      id: `videoList_${sequence}`,
      admin_ids: [],
      is_joinable: false,
      name: faker.random.words(),
      video_ids: [],
      is_public: false,
      unique_id: '',
      auto_sort_type: AutoSortType.NONE,
      auto_sort_is_ascending: false,
    }
  },
)
