import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import {
  TmdbShowEpisodeResponseType,
  TmdbShowByIdResponse,
  TmdbShowSeasonPartialResponseType,
  TmdbTvSeason,
} from '@reelist/interfaces/tmdb/TmdbShowResponse'
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
import { mockServer } from '@reelist/apis/__testHelpers__/apiTestHelper'
import inversionContainer from '@reelist/models/inversionContainer'
import VideoStore from '@reelist/models/VideoStore'
import { TmdbShowById } from '@reelist/models/tmdb/TmdbShowById'
import _ from 'lodash'

export const tmdbEpisodeResponseFactory = Factory.define<TmdbShowEpisodeResponseType>(
  ({ sequence }) => {
    return {
      id: sequence,
      name: faker.lorem.words(3),
      overview: faker.lorem.paragraph(),
      voteAverage: faker.datatype.float({ min: 0, max: 10, precision: 0.1 }),
      voteCount: faker.datatype.number({ min: 10, max: 10000 }),
      airDate: faker.date.past().toISOString(),
      episodeNumber: sequence,
      runtime: faker.datatype.number({ min: 10, max: 10000 }),
      seasonNumber: faker.datatype.number({ min: 10, max: 10000 }),
      stillPath: faker.image.imageUrl(),
    }
  },
)
export const tmdbSeasonResponseFactory = Factory.define<TmdbShowSeasonPartialResponseType>(
  ({ sequence }) => {
    return {
      id: sequence,
      airDate: faker.date.past().toISOString(),
      episodeCount: faker.datatype.number({ min: 10, max: 100 }),
      name: faker.lorem.words(3),
      overview: faker.lorem.paragraph(),
      posterPath: faker.image.imageUrl(),
      seasonNumber: sequence,
      voteAverage: faker.datatype.float({ min: 0, max: 10, precision: 0.1 }),
    }
  },
)

export const tmdbShowFactory = Factory.define<
  TmdbShowByIdResponse,
  { seasonPartialCount: number; buildSeasons: boolean },
  TmdbShowById
>(({ params, transientParams, onCreate }) => {
  onCreate(async showResponse => {
    mockServer.tmdb.db.createShow(showResponse)

    const videoStore = inversionContainer.get<VideoStore>(VideoStore)

    const show = await videoStore.getVideo('tv' + showResponse.id)

    if (!show) {
      throw new Error('Show not found')
    } else if (!show.isTv) {
      throw new Error('Bad Data: show.isTv is false')
    }

    return show
  })

  const creator = tmdbPersonCreditFactory.build()

  const { genreIds, ...baseShow } = tmdbDiscoverShowFactory.build(params)

  const seasonPartialCount = transientParams.seasonPartialCount || 3

  tmdbSeasonResponseFactory.rewindSequence()

  const seasons = tmdbSeasonResponseFactory.buildList(seasonPartialCount)

  let lastEpisodeToAir: TmdbShowEpisodeResponseType | undefined
  let customSeasons: Record<string, TmdbTvSeason> = {}
  if (transientParams.buildSeasons) {
    let episodeNumber = 1
    seasons.map(seasonPartial => {
      const episodes = tmdbEpisodeResponseFactory.buildList(seasonPartial.episodeCount)

      episodes.forEach(episode => {
        episode.episodeNumber = episodeNumber
        episode.seasonNumber = seasonPartial.seasonNumber
        episodeNumber += 1
      })

      customSeasons['season/' + seasonPartial.seasonNumber] = {
        ...seasonPartial,
        episodes,
      }

      lastEpisodeToAir = _.last(episodes)
    })
  }

  lastEpisodeToAir ||= tmdbEpisodeResponseFactory.build()

  return {
    ...baseShow,
    ...customSeasons,
    'season/X': customSeasons['season/1'],
    adult: faker.datatype.boolean(),
    createdBy: creator,
    genres: [],
    seasons,
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
    numberOfSeasons: seasonPartialCount,
    inProduction: faker.datatype.boolean(),
    lastEpisodeToAir,
    'watch/providers': { results: {} },
  }
})

export const tmdbMovieFactory = Factory.define<
  TmdbMovieByIdResponse,
  null,
  TmdbVideoByIdType<TmdbMovieByIdResponse>
>(({ params, onCreate }) => {
  onCreate(async movieResponse => {
    mockServer.tmdb.db.createMovie(movieResponse)

    const videoStore = inversionContainer.get<VideoStore>(VideoStore)

    const movie = await videoStore.getVideo('mv' + movieResponse.id)

    if (!movie) {
      throw new Error('Movie not found')
    } else if (movie.isTv) {
      throw new Error('Bad Data: movie.isTv is true')
    }

    return movie
  })

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

export const tmdbVideoFactory = Factory.define<
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

  if (transientParams.isTv ?? faker.datatype.boolean()) return tmdbShowFactory.build()

  return tmdbMovieFactory.build()
})

export const tmdbVideoFromShowFactory = tmdbVideoFactory.transient({ isTv: true })
export const tmdbVideoFromMovieFactory = tmdbVideoFactory.transient({ isTv: false })
