import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import { tmdbBaseVideoFactory } from '@reelist/interfaces/tmdb/__factories__/TmdbBaseVideoResponseFactory'
import {
  TmdbDiscoverMovieResponseType,
  TmdbDiscoverShowResponseType,
} from '@reelist/interfaces/tmdb/TmdbDiscoverVideoResponseType'
import { TmdbVideoPartialType } from '@reelist/interfaces/tmdb/TmdbVideoPartialType'
import { TmdbVideoPartialMapper } from '@reelist/utils/tmdbHelpers/TmdbVideoPartialMapper'

export const tmdbDiscoverShowFactory = Factory.define<
  TmdbDiscoverShowResponseType,
  null,
  TmdbVideoPartialType
>(({ sequence, params, onCreate }) => {
  onCreate(TmdbVideoPartialMapper.fromTmdbDiscoverShow)

  const baseVideo = tmdbBaseVideoFactory.build({ id: sequence, ...params })

  return {
    name: faker.random.words(),
    originalName: faker.random.words(),
    firstAirDate: faker.date.past().toISOString(),
    ...baseVideo,
  }
})
export const tmdbDiscoverMovieFactory = Factory.define<
  TmdbDiscoverMovieResponseType,
  null,
  TmdbVideoPartialType
>(({ sequence, params, onCreate }) => {
  onCreate(TmdbVideoPartialMapper.fromTmdbDiscoverMovie)

  const baseVideo = tmdbBaseVideoFactory.build({ id: sequence, ...params })

  return {
    adult: faker.datatype.boolean(),
    originalTitle: faker.random.words(),
    releaseDate: faker.date.past().toISOString(),
    title: faker.random.words(),
    video: faker.datatype.boolean(),
    ...baseVideo,
  }
})
