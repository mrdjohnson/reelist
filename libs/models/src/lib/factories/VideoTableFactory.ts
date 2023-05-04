import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { VideoTableType } from '@reelist/interfaces/tables/VideoTable'
import moment from 'moment'

export const createVideoTable = Factory.define<VideoTableType>(() => {
  const isMovie = faker.datatype.boolean()

  return {
    id: faker.lorem.slug(),
    video_id: faker.lorem.slug(),
    tracked: faker.datatype.boolean(),
    last_watched_season_number: isMovie ? null : faker.datatype.number(25),
    last_watched_episode_number: isMovie ? null : faker.datatype.number(25),
    video_info: {},
    user_id: '',
    allow_in_history: true,
    updated_at: moment().subtract(5, 'minutes').toDate(),
  }
})
