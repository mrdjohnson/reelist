import { TmdbBaseVideoResponse } from '@reelist/interfaces/tmdb/TmdbBaseVideoResponse'
import { Moment } from 'moment'

export type TmdbVideoPartialType = TmdbBaseVideoResponse & {
  isTv: boolean
  mediaType: 'tv' | 'mv'
  videoId: string
  videoName: string
  videoOriginalName: string
  videoReleaseDate: Moment
}
