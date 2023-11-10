import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import {
  createTmdbSearchVideoResult,
  TmdbSearchPersonResultResponseType,
  TmdbSearchVideoResultResponseType,
  TmdbSearchVideoResultType,
} from '@reelist/models/tmdb/TmdbSearchVideo'
import { tmdbBaseVideoFactory } from '@reelist/models/tmdb/factories/TmdbBaseVideoFactory'

export const tmdbSearchPersonResultFactory = Factory.define<
  TmdbSearchPersonResultResponseType & {
    knownForCount?: number
  }
>(({ sequence, params }) => {
  const { knownForCount = 0, ...rest } = params

  return {
    id: sequence,
    name: faker.random.words(),
    gender: faker.datatype.number(2),
    originalName: faker.name.firstName(),
    adult: faker.datatype.boolean(),
    knownForDepartment: faker.helpers.arrayElement(['Acting', 'Production', 'Directing']),
    popularity: faker.datatype.number(100),
    profilePath: faker.image.imageUrl(),
    knownFor: tmdbSearchVideoResultFactory.buildList(knownForCount),
    ...rest,
    mediaType: 'person',
  }
})

export const tmdbSearchVideoResultFactory = Factory.define<
  TmdbSearchVideoResultResponseType,
  null,
  TmdbSearchVideoResultType
>(({ sequence, params, onCreate }) => {
  onCreate(json => createTmdbSearchVideoResult(json))

  const {
    title = faker.random.words(),
    releaseDate = faker.date.past().toISOString(),
    mediaType = faker.helpers.arrayElement(['tv', 'movie']),
    ...options
  } = params

  const { name, firstAirDate, ...searchVideoResultParams } = tmdbBaseVideoFactory.build(options)

  return {
    title,
    releaseDate,
    ...searchVideoResultParams,
    id: sequence,
    mediaType,
  }
})
