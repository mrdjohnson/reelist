import { TmdbVideoPartialType } from '@reelist/interfaces/tmdb/TmdbVideoPartialType'
import {
  TmdbSearchPersonResponseType,
  TmdbSearchVideoResponse,
} from '@reelist/interfaces/tmdb/TmdbSearchResponse'
import moment from 'moment'
import {
  TmdbBaseMovieResponse,
  TmdbBaseShowResponse,
} from '@reelist/interfaces/tmdb/TmdbBaseVideoResponse'

type NeededPartialFields = {
  mediaType: 'tv' | 'mv'
  id: number
}
const createTmdbVideoCommonFields = (json: NeededPartialFields) => {
  return {
    isTv: json.mediaType === 'tv',
    videoId: json.mediaType + json.id,
    mediaType: json.mediaType,
  }
}

export class TmdbVideoPartialFormatter {
  static fromTmdbShow(json: TmdbBaseShowResponse): TmdbVideoPartialType {
    const { name, firstAirDate, originalName } = json

    return {
      ...json,
      ...createTmdbVideoCommonFields({ id: json.id, mediaType: 'tv' }),
      hasUser: false,
      videoName: name,
      videoOriginalName: originalName,
      videoReleaseDate: moment(firstAirDate),
    }
  }

  static fromTmdbMovie(json: TmdbBaseMovieResponse): TmdbVideoPartialType {
    const { title, releaseDate, originalTitle } = json

    return {
      ...json,
      ...createTmdbVideoCommonFields({ id: json.id, mediaType: 'mv' }),
      hasUser: false,
      videoName: title,
      videoOriginalName: originalTitle,
      videoReleaseDate: moment(releaseDate),
    }
  }

  static fromTmdbSearchVideo(json: TmdbSearchVideoResponse): TmdbVideoPartialType {
    if (json.mediaType === 'tv') {
      return TmdbVideoPartialFormatter.fromTmdbShow(json)
    }

    return TmdbVideoPartialFormatter.fromTmdbMovie(json)
  }

  static fromTmdbSearchPerson(json: TmdbSearchPersonResponseType): TmdbVideoPartialType[] {
    return json.knownFor.map(TmdbVideoPartialFormatter.fromTmdbSearchVideo)
  }
}
