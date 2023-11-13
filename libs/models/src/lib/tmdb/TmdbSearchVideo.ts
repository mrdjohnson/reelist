import {
    BaseMovie,createTmdbBaseVideo, TmdbBaseVideoResponseType } from '@reelist/models/tmdb/TmdbBaseVideo'
import { extendObservable } from 'mobx'

export type TmdbSearchVideoResultResponseType = TmdbBaseVideoResponseType &
    BaseMovie & {
    mediaType: 'tv' | 'movie'
}

export type TmdbSearchPersonResultResponseType = {
  name: string
  gender: number
  originalName: string
  adult: boolean
  knownForDepartment: string
  popularity: number
  profilePath: string
  knownFor: TmdbSearchVideoResultResponseType[]
  mediaType: 'person'
}

export type TmdbSearchMultiResultResponseType =
  | TmdbSearchVideoResultResponseType
  | TmdbSearchPersonResultResponseType

export const createTmdbSearchVideosResultsFromSearchPerson = (
  json: TmdbSearchPersonResultResponseType,
) => {
  return json.knownFor.flatMap(createTmdbSearchVideoResult)
}

export const createTmdbSearchVideoResult = (json: TmdbSearchVideoResultResponseType) => {
  const mediaType = json.mediaType === 'tv' ? 'tv' : 'mv'

  const { name, firstAirDate, ...video } = createTmdbBaseVideo({ ...json, mediaType })

  return extendObservable(video, {
    title: json.title,
    releaseDate: json.releaseDate,
  })
}

export type TmdbSearchVideoResultType = ReturnType<typeof createTmdbSearchVideoResult>
