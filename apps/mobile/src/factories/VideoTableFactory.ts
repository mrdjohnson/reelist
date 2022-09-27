import { VideoTableType } from '~/models/Video'
import { faker } from '@faker-js/faker'

export const createVideoTable = (options: Partial<VideoTableType> = {}): VideoTableType => {
  const isMovie = faker.datatype.boolean()

  return {
    id: faker.lorem.slug(),
    video_id: faker.lorem.slug(),
    tracked: faker.datatype.boolean(),
    last_watched_season_number: isMovie ? null : faker.datatype.number(25),
    last_watched_episode_number: isMovie ? null : faker.datatype.number(25),
    video_info: {},
    user_id: '',
    ...options,
  }
}
