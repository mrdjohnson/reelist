import { callTmdb } from '@reelist/apis/api'
import { TmdbVideoByIdResponse } from '@reelist/interfaces/tmdb/TmdbVideoByIdType'
import _ from 'lodash'
import { TmdbPersonByIdResponse, TmdbPersonType } from '@reelist/interfaces/tmdb/TmdbPersonResponse'
import { TmdbVideoType } from '@reelist/models/Video'
import { TmdbVideoByIdFormatter } from '@reelist/utils/tmdbHelpers/TmdbVideoByIdFormatter'
import { TmdbPersonFormatter } from '@reelist/utils/tmdbHelpers/TmdbPersonFormatter'

const getVideoPath = (videoId: string) => {
  const videoIdMatch = videoId.match(/(..)(.*)/)

  if (!videoIdMatch) return null

  const [_videoId, type, id] = videoIdMatch

  const videoType = type === 'mv' ? 'movie' : type

  return `/${videoType}/${id}`
}

export class TmdbClient {
  static async getVideoById(videoId: string, appendToResponse = ''): Promise<TmdbVideoType | null> {
    const path = getVideoPath(videoId)

    if (!path) return null

    let videoResponse: TmdbVideoByIdResponse | null

    videoResponse = await callTmdb<TmdbVideoByIdResponse>(path, {
      // TODO: images is never used; remove?
      append_to_response:
        'images,similar,aggregate_credits,credits,watch/providers' + appendToResponse,
    }).then(item => _.get(item, 'data.data') || null)

    return TmdbVideoByIdFormatter.fromTmdbBaseVideo(videoResponse, videoId)
  }

  static async getPersonById(
    personId?: string,
    appendToResponse = '',
  ): Promise<TmdbPersonType | null> {
    if (!personId) return null

    const path = `/person/${personId}`

    let personResponse: TmdbPersonByIdResponse | null

    personResponse = await callTmdb<TmdbPersonByIdResponse>(path, {
      append_to_response: 'images,combined_credits' + appendToResponse,
    }).then(item => _.get(item, 'data.data') || null)

    return TmdbPersonFormatter.fromTmdbPersonById(personResponse)
  }
}
