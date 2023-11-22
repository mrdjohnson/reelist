import {
  TmdbShowByIdResponse,
  TmdbShowSeasonPartialResponseType,
} from '@reelist/interfaces/tmdb/TmdbShowResponse'
import { TmdbMovieByIdResponse } from '@reelist/interfaces/tmdb/TmdbMovieResponse'
import { TmdbVideoPartialFormatter } from './TmdbVideoPartialFormatter'
import _ from 'lodash'
import {
  TmdbVideoByIdResponse,
  TmdbVideoByIdType,
} from '@reelist/interfaces/tmdb/TmdbVideoByIdType'
import moment from 'moment'

export class TmdbVideoByIdFormatter {
  static fromTmdbBaseVideo(
    json: TmdbShowByIdResponse,
    videoId: string,
  ): TmdbVideoByIdType<TmdbShowByIdResponse>
  static fromTmdbBaseVideo(
    json: TmdbMovieByIdResponse,
    videoId: string,
  ): TmdbVideoByIdType<TmdbMovieByIdResponse>
  static fromTmdbBaseVideo(json: TmdbVideoByIdResponse, videoId: string): TmdbVideoByIdType
  static fromTmdbBaseVideo(
    json: TmdbVideoByIdResponse | null,
    videoId: string,
  ): TmdbVideoByIdType | null
  static fromTmdbBaseVideo(json: null, videoId: string): null
  static fromTmdbBaseVideo(
    json: TmdbVideoByIdResponse | null,
    videoId: string,
  ): TmdbVideoByIdType | null {
    if (json === null) return null

    if (videoId.startsWith('mv')) {
      return TmdbVideoByIdFormatter.fromTmdbMovie(json as TmdbMovieByIdResponse)
    } else {
      return TmdbVideoByIdFormatter.fromTmdbShow(json as TmdbShowByIdResponse)
    }
  }

  static fromTmdbShow(json: TmdbShowByIdResponse): TmdbVideoByIdType<TmdbShowByIdResponse> {
    const genreIds = _.map(json.genres, 'id')
    const showPartial = TmdbVideoPartialFormatter.fromTmdbShow({
      ...json,
      genreIds,
    })

    const similar = json.similar.results.map(TmdbVideoPartialFormatter.fromTmdbShow)

    const aggregateCast = json.aggregateCredits.cast.map(credit => {
      if (!credit.roles?.[0]) return null

      const { character } = credit.roles[0]

      return {
        ...credit,
        character,
      }
    })

    const cast = json.credits.cast.concat(_.compact(aggregateCast))

    const { seasons, ...rest } = json

    // remove special seasons until we learn how to deal with them
    const seasonPartials = _.reject(seasons, { name: 'Specials' })

    const providers = json['watch/providers'].results

    return {
      ...showPartial,
      ...rest,
      similar,
      episodeRunTimes: json.episodeRunTime,
      mediaType: 'tv',
      isTv: true,
      cast: _.uniqBy(cast, 'id'),
      seasonPartials,
      providers: _.mapKeys(providers, (_value, key) => _.toUpper(key)),
      videoRuntime: seasonPartials.length === 1 ? '1 season' : `${seasonPartials.length} seasons`,
      lastVideoReleaseDate: moment(json.lastEpisodeToAir.airDate),
      // deviation from the original Video implementation which removed the future episodes from the count
      totalDurationMinutes: (_.min(json.episodeRunTime) || 0) * json.numberOfEpisodes,
    }
  }

  static fromTmdbMovie(json: TmdbMovieByIdResponse): TmdbVideoByIdType<TmdbMovieByIdResponse> {
    const genreIds = _.map(json.genres, 'id')
    const moviePartial = TmdbVideoPartialFormatter.fromTmdbMovie({
      ...json,
      genreIds,
    })

    const similar = json.similar.results.map(TmdbVideoPartialFormatter.fromTmdbMovie)

    const providers = json['watch/providers'].results

    return {
      ...moviePartial,
      ...json,
      similar,
      mediaType: 'mv',
      isTv: false,
      cast: json.credits.cast,
      providers: _.mapKeys(providers, (_value, key) => _.toUpper(key)),
      videoRuntime: `${json.runtime} min`,
      lastVideoReleaseDate: moviePartial.videoReleaseDate,
      totalDurationMinutes: json.runtime,
    }
  }
}
