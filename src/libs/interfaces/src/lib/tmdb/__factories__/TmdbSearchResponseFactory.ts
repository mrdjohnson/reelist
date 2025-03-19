import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import {
  TmdbSearchMovieResponse,
  TmdbSearchPersonResponseType,
  TmdbSearchShowResponse,
  TmdbSearchVideoResponse,
} from '@reelist/interfaces/tmdb/TmdbSearchResponse'
import { TmdbVideoPartialType } from '../TmdbVideoPartialType'
import { TmdbVideoPartialFormatter } from '@reelist/utils/tmdbHelpers/TmdbVideoPartialFormatter'
import { tmdbBaseVideoFactory } from '@reelist/interfaces/tmdb/__factories__/TmdbBaseVideoResponseFactory'
import moment from 'moment'

export const tmdbSearchShowFactory = Factory.define<
  TmdbSearchShowResponse,
  null,
  TmdbVideoPartialType
>(({ sequence, params, onCreate }) => {
  onCreate(TmdbVideoPartialFormatter.fromTmdbSearchVideo)

  const baseVideo = tmdbBaseVideoFactory.build(params)

  return {
    video: faker.datatype.boolean(),
    adult: faker.datatype.boolean(),
    name: faker.random.words(),
    originalName: faker.random.words(),
    firstAirDate: moment(faker.date.past()).format('YYYY-MM-DD'),
    mediaType: 'tv',
    ...baseVideo,
  }
})

export const tmdbSearchMovieFactory = Factory.define<
  TmdbSearchMovieResponse,
  null,
  TmdbVideoPartialType
>(({ sequence, params, onCreate }) => {
  onCreate(TmdbVideoPartialFormatter.fromTmdbSearchVideo)

  const baseVideo = tmdbBaseVideoFactory.build(params)

  return {
    video: faker.datatype.boolean(),
    adult: faker.datatype.boolean(),
    title: faker.random.words(),
    originalTitle: faker.random.words(),
    releaseDate: moment(faker.date.past()).format('YYYY-MM-DD'),
    mediaType: 'movie',
    ...baseVideo,
  }
})

export const tmdbSearchVideoFactory = Factory.define<
  TmdbSearchVideoResponse,
  { isTv?: boolean },
  TmdbVideoPartialType
>(({ sequence, params, onCreate, transientParams }) => {
  onCreate(TmdbVideoPartialFormatter.fromTmdbSearchVideo)

  if (params.mediaType === 'tv' || transientParams.isTv) return tmdbSearchShowFactory.build()

  return tmdbSearchMovieFactory.build()
})

export const tmdbSearchPersonFactory = Factory.define<
  TmdbSearchPersonResponseType,
  { knownForCount: number }
>(({ sequence, transientParams }) => {
  const { knownForCount = 0 } = transientParams

  const name = faker.name.firstName() + ' ' + faker.name.lastName()

  return {
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
