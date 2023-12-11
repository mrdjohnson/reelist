import {
  TmdbBasePersonResponse,
  TmdbPersonCreditResponse,
} from '@reelist/interfaces/tmdb/TmdbPersonResponse'
import { TmdbDiscoverShowResponseType } from '@reelist/interfaces/tmdb//TmdbDiscoverVideoResponseType'
import { TmdbBaseByIdVideoResponse } from '@reelist/interfaces/tmdb/TmdbBaseByIdVideoResponse'
import { TmdbTvEpisode } from '@reelist/interfaces/tmdb/TmdbVideoByIdType'

export type TmdbShowPersonResponseType = TmdbBasePersonResponse & {
  creditId: string
}

export type TmdbShowEpisodeResponseType = {
  id: number
  name: string
  overview: string
  voteAverage: number
  voteCount: number
  airDate: string
  episodeNumber: number
  // productionCode: string
  runtime: number
  seasonNumber: number
  // showId: number
  stillPath: string
  // episodeType: string
}

export type TmdbShowNetworkResponseType = {
  id: number
  logoPath: string
  name: string
  originCountry: string
}

export type TmdbShowSeasonPartialResponseType = {
  airDate: string
  episodeCount: number
  id: number
  name: string
  overview: string
  posterPath: string
  seasonNumber: number
  voteAverage: number
}

export type TmdbTvSeason = TmdbShowSeasonPartialResponseType & {
  episodes?: TmdbTvEpisode[]
}

export type TmdbShowSimilarResponseType = TmdbDiscoverShowResponseType & {
  adult: boolean
}

type AggregateRole = {
  creditId: string
  character: string
  episodeCount: number
}
export type TmdbShowAggregateCreditResponseType = Omit<TmdbPersonCreditResponse, 'character'> & {
  roles: AggregateRole[]
}

type BaseShow = TmdbBaseByIdVideoResponse & TmdbDiscoverShowResponseType

export type TmdbShowByIdResponse = Omit<BaseShow, 'genreIds'> & {
  createdBy: TmdbShowPersonResponseType
  episodeRunTime: number[]
  inProduction: boolean
  lastAirDate: string
  lastEpisodeToAir: TmdbShowEpisodeResponseType
  nextEpisodeToAir?: TmdbShowEpisodeResponseType
  networks: TmdbShowNetworkResponseType[]
  // this number does not include the "specials" season's episodes
  numberOfEpisodes: number
  // this number does not include the "specials" season
  numberOfSeasons: number

  // this includes "specials" seasons
  seasons: TmdbShowSeasonPartialResponseType[]
  aggregateCredits: {
    cast: TmdbShowAggregateCreditResponseType[]
  }
  similar: {
    results: TmdbShowSimilarResponseType[]
  }

  // this is based on a custom call to the TMDb API for the season along with the show response
  'season/X'?: TmdbTvSeason

  // productionCompanies
  // productionCountries
  // spokenLanguages
  // tagline
  // type
}
