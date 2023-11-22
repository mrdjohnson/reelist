import {
  TmdbBaseMovieResponse,
  TmdbBaseShowResponse,
} from '@reelist/interfaces/tmdb/TmdbBaseVideoResponse'

export type TmdbDiscoverShowResponseType = TmdbBaseShowResponse

export type TmdbDiscoverMovieResponseType = TmdbBaseMovieResponse & {
  adult: boolean
  video: boolean
}
