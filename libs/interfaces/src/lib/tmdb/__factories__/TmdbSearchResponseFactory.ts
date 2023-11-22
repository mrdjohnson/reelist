import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import {
  TmdbSearchPersonResponseType,
  TmdbSearchVideoResponse,
} from '@reelist/interfaces/tmdb/TmdbSearchResponse'
import { TmdbVideoPartialType } from '../TmdbVideoPartialType'
import { TmdbVideoPartialMapper } from '@reelist/utils/tmdbHelpers/TmdbVideoPartialMapper'
import { tmdbBaseVideoFactory } from './TmdbBaseVideoResponseFactory'

export const tmdbSearchVideoFactory = Factory.define<
  TmdbSearchVideoResponse,
  null,
  TmdbVideoPartialType
>(({ sequence, params, onCreate }) => {
  onCreate(TmdbVideoPartialMapper.fromTmdbSearchVideo)

  const baseVideo = tmdbBaseVideoFactory.build({ id: sequence, ...params })

  return {
    video: faker.datatype.boolean(),
    adult: faker.datatype.boolean(),
    title: faker.random.words(),
    originalTitle: faker.random.words(),
    releaseDate: faker.date.past().toISOString(),
    mediaType: faker.helpers.arrayElement(['tv', 'movie']),
    ...baseVideo,
  }
})

export const tmdbSearchPersonFactory = Factory.define<
  TmdbSearchPersonResponseType,
  { knownForCount: number }
>(({ sequence, params, transientParams }) => {
  const { knownForCount = 0 } = transientParams

  const name = faker.name.firstName() + ' ' + faker.name.lastName()

  return {
    ...params,
    id: sequence,
    name,
    gender: faker.datatype.number({ min: 0, max: 2 }),
    originalName: name.repeat(2),
    adult: faker.datatype.boolean(),
    knownForDepartment: faker.name.jobType(),
    popularity: faker.datatype.float({ min: 0, max: 100, precision: 0.1 }),
    profilePath: faker.image.imageUrl(),
    knownFor: tmdbSearchVideoFactory.buildList(knownForCount),
    mediaType: 'person',
  }
})
