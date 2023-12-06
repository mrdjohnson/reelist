import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { VideoInfoType, VideoTableType } from '../VideoTable'

export const videoTableTypeFactory = Factory.define<
  VideoTableType,
  { isTv?: boolean; userId?: string; videoInfo?: VideoInfoType }
>(({ sequence, params, transientParams }) => {
  const videoId = (transientParams.isTv ? 'tv' : 'mv') + sequence

  return {
    id: 'video_' + sequence,
    video_id: videoId,
    genreIds: [],
    tracked: false,
    last_watched_season_number: undefined,
    last_watched_episode_number: undefined,
    video_info: undefined,
    user_id: '',
    allow_in_history: false,
    updated_at: faker.date.past(),
  }
})
