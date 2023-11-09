import { makeAutoObservable } from 'mobx'

export type BaseMovie = {
  title: string
  releaseDate: string

  name?: never
  firstAirDate?: never
}

export type BaseShow = {
  name: string
  firstAirDate: string

  title?: never
  releaseDate?: never
}

export type TmdbBaseVideoResponseType = {
  adult: boolean
  backdropPath: string
  genreIds: number[]
  id: number
  originalLanguage: string
  overview: string
  popularity: number
  posterPath: string
  originCountry: string[]
  originalName: string
  voteAverage: number
  voteCount: number
  video: boolean
  status: string
  tagline: string
} & (BaseMovie | BaseShow)

export type VideoMediaType = {
  mediaType: 'tv' | 'mv'
}

export const createTmdbBaseVideo = (json: TmdbBaseVideoResponseType & VideoMediaType) => {
  const isTv = json.mediaType === 'tv'

  return makeAutoObservable({
    ...json,
    videoId: json.mediaType + json.id,
    videoName: json.name || json.title,
    isTv,
  })
}

export type TmdbBaseVideoType = ReturnType<typeof createTmdbBaseVideo>
