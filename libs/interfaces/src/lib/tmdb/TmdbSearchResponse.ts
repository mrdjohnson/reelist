import { TmdbBaseVideoResponseType } from '@reelist/interfaces/tmdb/TmdbBaseVideoResponseType'

export type TmdbSearchVideoResponse = TmdbBaseVideoResponseType & {
  releaseDate: string
  title: string
  video: boolean
  originalTitle: string
  adult: boolean
  mediaType: 'tv' | 'movie'
}

export type TmdbSearchPersonResponseType = {
  name: string
  gender: number
  originalName: string
  adult: boolean
  knownForDepartment: string
  popularity: number
  profilePath: string
  knownFor: Array<TmdbSearchVideoResponse>
  mediaType: 'person'
}

export type TmdbSearchMultiResponseType = TmdbSearchVideoResponse | TmdbSearchPersonResponseType
