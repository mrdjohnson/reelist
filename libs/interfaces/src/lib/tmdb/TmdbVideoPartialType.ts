import { TmdbBaseVideoResponseType } from '@reelist/interfaces/tmdb/TmdbBaseVideoResponseType'

export type TmdbVideoPartialType = TmdbBaseVideoResponseType & {
  isTv: boolean
  mediaType: 'tv' | 'mv'
  videoId: string
  videoName: string
  videoOriginalName: string
  videoReleaseDate: string
}
