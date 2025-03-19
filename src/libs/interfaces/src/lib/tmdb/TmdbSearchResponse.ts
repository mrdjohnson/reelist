import {
  TmdbBaseMovieResponse,
  TmdbBaseShowResponse,
} from '@reelist/interfaces/tmdb/TmdbBaseVideoResponse'
import { TmdbBasePersonResponse } from '@reelist/interfaces/tmdb/TmdbPersonResponse'

export type TmdbSearchVideoResponse = TmdbSearchShowResponse | TmdbSearchMovieResponse

export type TmdbSearchShowResponse = TmdbBaseShowResponse & {
  adult: boolean
  mediaType: 'tv'
}

export type TmdbSearchMovieResponse = TmdbBaseMovieResponse & {
  video: boolean
  adult: boolean
  mediaType: 'movie'
}

export type TmdbSearchPersonResponseType = TmdbBasePersonResponse & {
  originalName: string
  adult: boolean
  knownForDepartment: string
  popularity: number
  knownFor: Array<TmdbSearchVideoResponse>
  mediaType: 'person'
}

export type TmdbSearchMultiResponseType = TmdbSearchVideoResponse | TmdbSearchPersonResponseType
