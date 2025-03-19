export type TmdbBaseVideoResponse = {
  backdropPath: string
  genreIds: number[]
  id: number
  originalLanguage: string
  // originCountry: string[]
  overview: string
  popularity: number
  posterPath: string
  // status: string
  voteAverage: number
  voteCount: number
}

export type TmdbBaseShowResponse = TmdbBaseVideoResponse & {
  originalName: string
  name: string
  firstAirDate: string
}

export type TmdbBaseMovieResponse = TmdbBaseVideoResponse & {
  originalTitle: string
  title: string
  releaseDate: string
}
