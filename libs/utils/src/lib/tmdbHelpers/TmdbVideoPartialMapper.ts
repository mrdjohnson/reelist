import {
  TmdbDiscoverMovieResponseType,
  TmdbDiscoverShowResponseType,
} from '@reelist/interfaces/tmdb/TmdbDiscoverVideoResponseType'
import { TmdbVideoPartialType } from '@reelist/interfaces/tmdb/TmdbVideoPartialType'
import {
  TmdbSearchPersonResponseType,
  TmdbSearchVideoResponse,
} from '@reelist/interfaces/tmdb/TmdbSearchResponse'

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

export class TmdbVideoPartialMapper {
  static fromTmdbDiscoverShow(json: TmdbDiscoverShowResponseType): TmdbVideoPartialType {
    const { name, firstAirDate, originalName } = json

    return {
      ...json,
      ...createTmdbVideoCommonFields({ id: json.id, mediaType: 'tv' }),
      videoName: name,
      videoOriginalName: originalName,
      videoReleaseDate: firstAirDate,
    }
  }

  static fromTmdbDiscoverMovie(json: TmdbDiscoverMovieResponseType): TmdbVideoPartialType {
    const { title, releaseDate, originalTitle, adult, video } = json

    return {
      ...json,
      ...createTmdbVideoCommonFields({ id: json.id, mediaType: 'mv' }),
      videoName: title,
      videoOriginalName: originalTitle,
      videoReleaseDate: releaseDate,
    }
  }

  static fromTmdbSearchVideo(json: TmdbSearchVideoResponse): TmdbVideoPartialType {
    const { title, releaseDate, originalTitle, mediaType: originalMediaType } = json
    const mediaType = originalMediaType === 'tv' ? 'tv' : 'mv'

    return {
      ...json,
      ...createTmdbVideoCommonFields({ id: json.id, mediaType }),
      videoName: title,
      videoOriginalName: originalTitle,
      videoReleaseDate: releaseDate,
    }
  }

  static fromTmdbSearchPerson(json: TmdbSearchPersonResponseType): TmdbVideoPartialType[] {
    return json.knownFor.map(TmdbVideoPartialMapper.fromTmdbSearchVideo)
  }
}
