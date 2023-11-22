import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import { tmdbBaseVideoFactory } from '@reelist/interfaces/tmdb/__factories__/TmdbBaseVideoResponseFactory'
import {
  TmdbDiscoverMovieResponseType,
  TmdbDiscoverShowResponseType,
} from '@reelist/interfaces/tmdb/TmdbDiscoverVideoResponseType'
import { TmdbVideoPartialType } from '@reelist/interfaces/tmdb/TmdbVideoPartialType'
import { TmdbVideoPartialFormatter } from '@reelist/utils/tmdbHelpers/TmdbVideoPartialFormatter'
import moment from 'moment/moment'

export const tmdbDiscoverShowFactory = Factory.define<
  TmdbDiscoverShowResponseType,
  null,
  TmdbVideoPartialType
>(({ sequence, params, onCreate }) => {
  onCreate(TmdbVideoPartialFormatter.fromTmdbShow)

  const baseVideo = tmdbBaseVideoFactory.build(params)

  return {
    name: faker.random.words(),
    originalName: faker.random.words(),
    firstAirDate: moment(faker.date.past()).format('YYYY-MM-DD'),
    ...baseVideo,
  }
})
export const tmdbDiscoverMovieFactory = Factory.define<
  TmdbDiscoverMovieResponseType,
  null,
  TmdbVideoPartialType
>(({ sequence, params, onCreate }) => {
  onCreate(TmdbVideoPartialFormatter.fromTmdbMovie)

  const baseVideo = tmdbBaseVideoFactory.build(params)

  return {
    adult: faker.datatype.boolean(),
    originalTitle: faker.random.words(),
    releaseDate: moment(faker.date.past()).format('YYYY-MM-DD'),
    title: faker.random.words(),
    video: faker.datatype.boolean(),
    ...baseVideo,
  }
})
