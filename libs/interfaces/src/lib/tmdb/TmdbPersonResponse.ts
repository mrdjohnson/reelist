import { TmdbBaseVideoResponse } from '@reelist/interfaces/tmdb/TmdbBaseVideoResponse'
import { TmdbSearchVideoResponse } from '@reelist/interfaces/tmdb/TmdbSearchResponse'
import { TmdbVideoPartialType } from '@reelist/interfaces/tmdb/TmdbVideoPartialType'

export type TmdbBasePersonResponse = {
  id: number
  name: string
  gender: number
  profilePath: string
}

export type TmdbPersonCreditResponse = TmdbBasePersonResponse & {
  adult: boolean
  // knownForDepartment: string
  originalName: string
  popularity: number
  character: string
  creditId: string
  order: number
}

export type TmdbPersonVideoCreditResponse = TmdbSearchVideoResponse & {
  creditId: string
  order: number
  character: string
}

export type TmdbPersonByIdResponse = TmdbBasePersonResponse & {
  adult: boolean
  alsoKnownAs: string[]
  knownForDepartment: string
  biography: string
  originalName: string
  birthday: string
  deathday: string
  // placeOfBirth: string
  popularity: number
  profilePath: string
  character: string
  creditId: string
  order: number
  combinedCredits: { cast: TmdbPersonVideoCreditResponse[] }
}

export type TmdbPersonType = TmdbPersonByIdResponse & {
  media: TmdbVideoPartialType[]
}
