import { TmdbVideoPartialType } from '@reelist/interfaces/tmdb/TmdbVideoPartialType'
import { TmdbPersonCreditResponse } from '@reelist/interfaces/tmdb/TmdbPersonResponse'
import { TmdbWatchProviderResponse } from '@reelist/interfaces/tmdb/TmdbWatchProviderResponse'
import {
  TmdbShowEpisodeResponseType,
  TmdbShowByIdResponse,
  TmdbShowSeasonPartialResponseType,
} from '@reelist/interfaces/tmdb/TmdbShowResponse'
import { TmdbMovieByIdResponse } from '@reelist/interfaces/tmdb/TmdbMovieResponse'
import { Moment } from 'moment'

export type TmdbVideoByIdResponse = TmdbShowByIdResponse | TmdbMovieByIdResponse

type TmdbMovieFields = {
  mediaType: 'mv'
  isTv: false
}

export type TmdbTvEpisode = TmdbShowEpisodeResponseType & {
  next?: TmdbTvEpisode
  previous?: TmdbTvEpisode
}

type TmdbTvSeason = TmdbShowSeasonPartialResponseType & {
  episodes?: TmdbTvEpisode[]
}

export type TmdbShowOnlyFields = {
  mediaType: 'tv'
  isTv: true

  lastAirDate: string
  lastEpisodeToAir: TmdbTvEpisode
  nextEpisodeToAir?: TmdbTvEpisode
  seasonPartials: TmdbShowSeasonPartialResponseType[]
  numberOfEpisodes: number
  numberOfSeasons: number
  episodeRunTimes: number[]
  seasonMap: Record<number, TmdbTvSeason | null>
}

export type TmdbBaseVideoType = TmdbVideoPartialType & {
  providers: TmdbWatchProviderResponse
  genres: Array<{
    id: number
    name: string
  }>
  // adult: boolean
  // homepage: string
  similar: TmdbVideoPartialType[]
  cast: TmdbPersonCreditResponse[]
  videoRuntime: string
  lastVideoReleaseDate: Moment
  totalDurationMinutes: number
}

type TmdbVideoBase = Omit<TmdbBaseVideoType, 'mediaType' | 'isTv'>

export type TmdbShowByIdType = TmdbVideoBase & TmdbShowOnlyFields
export type TmdbMovieByIdType = TmdbVideoBase & TmdbMovieFields

// todo: do I still need the response check? I think so
export type TmdbVideoByIdType<T = TmdbVideoByIdResponse> = TmdbVideoBase &
  (T extends TmdbShowByIdResponse ? TmdbShowOnlyFields : TmdbMovieFields)
