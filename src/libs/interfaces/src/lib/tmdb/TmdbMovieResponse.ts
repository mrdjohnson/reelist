import { TmdbDiscoverMovieResponseType } from '@reelist/interfaces/tmdb//TmdbDiscoverVideoResponseType'
import { TmdbBaseByIdVideoResponse } from '@reelist/interfaces/tmdb/TmdbBaseByIdVideoResponse'

export type TmdbMovieSimilarResponseType = TmdbDiscoverMovieResponseType & {
  adult: boolean
  // video
}

type BaseMovie = TmdbBaseByIdVideoResponse & TmdbDiscoverMovieResponseType

export type TmdbMovieByIdResponse = Omit<BaseMovie, 'genreIds'> & {
  runtime: number
  releaseDate: string
  similar: {
    results: TmdbMovieSimilarResponseType[]
  }
  // productionCompanies
  // productionCountries
  // belongsToCollection
  // budget
  // revenue
  // imdbId
  // video
  // tagline
  // type
}
