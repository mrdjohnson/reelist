import { TmdbBaseVideoResponseType } from '@reelist/interfaces/tmdb/TmdbBaseVideoResponseType'

export type TmdbDiscoverShowResponseType = TmdbBaseVideoResponseType & {
  originalName: string
  name: string
  firstAirDate: string
}

export type TmdbDiscoverMovieResponseType = TmdbBaseVideoResponseType & {
  adult: boolean
  originalTitle: string
  releaseDate: string
  title: string
  video: boolean
}
