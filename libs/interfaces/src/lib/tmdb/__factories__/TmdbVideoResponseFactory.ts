import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { TmdbShowEpisodeResponseType, TmdbShowByIdResponse } from '../TmdbShowResponse'
import { tmdbPersonCreditFactory } from '@reelist/interfaces/tmdb/__factories__/TmdbPersonResponseFactory'
import {
  tmdbDiscoverMovieFactory,
  tmdbDiscoverShowFactory,
} from '@reelist/interfaces/tmdb/__factories__/TmdbDiscoverResponseFactory'
import { TmdbMovieByIdResponse } from '@reelist/interfaces/tmdb/TmdbMovieResponse'
import {
  TmdbVideoByIdResponse,
  TmdbVideoByIdType,
} from '@reelist/interfaces/tmdb/TmdbVideoByIdType'
import { TmdbVideoByIdFormatter } from '@reelist/utils/tmdbHelpers/TmdbVideoByIdFormatter'
import Video from '@reelist/models/Video'

export const tmdbEpisodeFactory = Factory.define<TmdbShowEpisodeResponseType>(({ sequence }) => {
  return {
    id: sequence,
    name: faker.lorem.words(3),
    overview: faker.lorem.paragraph(),
    voteAverage: faker.datatype.float({ min: 0, max: 10, precision: 0.1 }),
    voteCount: faker.datatype.number({ min: 10, max: 10000 }),
    airDate: faker.date.past().toISOString(),
    episodeNumber: faker.datatype.number({ min: 10, max: 10000 }),
    runtime: faker.datatype.number({ min: 10, max: 10000 }),
    seasonNumber: faker.datatype.number({ min: 10, max: 10000 }),
    stillPath: faker.image.imageUrl(),
  }
})

export const tmdbShowFactory = Factory.define<
  TmdbShowByIdResponse,
  null,
  TmdbVideoByIdType<TmdbShowByIdResponse>
>(({ params, onCreate }) => {
  onCreate(TmdbVideoByIdFormatter.fromTmdbShow)

  const creator = tmdbPersonCreditFactory.build()

  const { genreIds, ...baseShow } = tmdbDiscoverShowFactory.build(params)

  return {
    ...baseShow,
    adult: faker.datatype.boolean(),
    createdBy: creator,
    genres: [],
    seasons: [],
    episodeRunTimes: [],
    episodeRunTime: [],
    homepage: faker.internet.domainName(),
    languages: [],
    lastAirDate: faker.date.past().toISOString(),
    nextEpisodeToAir: undefined,
    networks: [],
    numberOfEpisodes: faker.datatype.number({ max: 1000 }),
    similar: { results: [] },
    credits: { cast: [] },
    aggregateCredits: { cast: [] },
    numberOfSeasons: faker.datatype.number({ max: 10 }),
    inProduction: faker.datatype.boolean(),
    lastEpisodeToAir: tmdbEpisodeFactory.build(),
    'watch/providers': { results: {} },
  }
})

export const tmdbMovieFactory = Factory.define<
  TmdbMovieByIdResponse,
  null,
  TmdbVideoByIdType<TmdbMovieByIdResponse>
>(({ params, onCreate }) => {
  onCreate(TmdbVideoByIdFormatter.fromTmdbMovie)

  const baseMovie = tmdbDiscoverMovieFactory.build(params)

  return {
    ...baseMovie,
    adult: faker.datatype.boolean(),
    runtime: faker.datatype.number({ max: 1000 }),
    releaseDate: faker.date.past().toISOString(),
    genres: [],
    homepage: faker.internet.domainName(),
    languages: [],
    similar: { results: [] },
    credits: { cast: [] },
    'watch/providers': { results: {} },
  }
})

const tmdbVideoFactory = Factory.define<
  TmdbVideoByIdResponse,
  {
    isTv?: boolean
  },
  TmdbVideoByIdType
>(({ transientParams, onCreate }) => {
  onCreate(json => {
    const videoId = (transientParams.isTv ? 'tv' : 'mv') + json.id

    return TmdbVideoByIdFormatter.fromTmdbBaseVideo(json, videoId)
  })

  if (transientParams.isTv) return tmdbShowFactory.build()

  return tmdbMovieFactory.build()
})

export const tmdbVideoFromShowFactory = tmdbVideoFactory.transient({ isTv: true })
export const tmdbVideoFromMovieFactory = tmdbVideoFactory.transient({ isTv: false })
