import { TmdbShowByIdResponse, TmdbTvSeason } from '@reelist/interfaces/tmdb/TmdbShowResponse'
import { TmdbMovieByIdResponse } from '@reelist/interfaces/tmdb/TmdbMovieResponse'
import { TmdbVideoPartialFormatter } from './TmdbVideoPartialFormatter'
import _ from 'lodash'
import { TmdbVideoByIdResponse } from '@reelist/interfaces/tmdb/TmdbVideoByIdType'
import moment from 'moment'
import { TmdbShowById } from '@reelist/models/tmdb/TmdbShowById'
import { TmdbMovieById } from '@reelist/models/tmdb/TmdbMovieById'
import { TmdbVideoType } from '@reelist/models/Video'

export class TmdbVideoByIdFormatter {
  static fromTmdbBaseVideo(json: TmdbShowByIdResponse, videoId: string): TmdbShowById
  static fromTmdbBaseVideo(json: TmdbMovieByIdResponse, videoId: string): TmdbMovieById
  static fromTmdbBaseVideo(json: TmdbVideoByIdResponse, videoId: string): TmdbVideoType
  static fromTmdbBaseVideo(
    json: TmdbVideoByIdResponse | null,
    videoId: string,
  ): TmdbVideoType | null
  static fromTmdbBaseVideo(json: null, videoId: string): null
  static fromTmdbBaseVideo(
    json: TmdbVideoByIdResponse | null,
    videoId: string,
  ): TmdbVideoType | null {
    if (json === null) return null

    if (videoId.startsWith('mv')) {
      return TmdbVideoByIdFormatter.fromTmdbMovie(json as TmdbMovieByIdResponse)
    } else {
      return TmdbVideoByIdFormatter.fromTmdbShow(json as TmdbShowByIdResponse)
    }
  }

  static fromTmdbShow(json: TmdbShowByIdResponse): TmdbShowById {
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

    const seasonMap: Record<number, TmdbTvSeason> = {}

    // manually attach the season from the custom season appended request
    _.keys(json).forEach(key => {
      if (!key.startsWith('season/')) return

      const season = _.get(json, key) as TmdbTvSeason
      if (!season?.name) throw new Error('season response is broken')
      seasonMap[season.seasonNumber] = season
    })

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
      lastVideoReleaseDate: moment(json.lastAirDate),
      // deviation from the original Video implementation which removed the future episodes from the count
      totalDurationMinutes: (_.min(json.episodeRunTime) || 0) * json.numberOfEpisodes,
      seasonMap,
    }
  }

  static fromTmdbMovie(json: TmdbMovieByIdResponse): TmdbMovieById {
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
