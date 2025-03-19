import { TmdbBaseVideoResponse } from '@reelist/interfaces/tmdb/TmdbBaseVideoResponse'
import { Moment } from 'moment'

export type TmdbVideoPartialType = TmdbBaseVideoResponse & {
  isTv: boolean
  hasUser: true | any
  mediaType: 'tv' | 'mv'
  tmdbPath: string
  videoId: string
  videoName: string
  videoOriginalName: string
  videoReleaseDate: Moment
}
