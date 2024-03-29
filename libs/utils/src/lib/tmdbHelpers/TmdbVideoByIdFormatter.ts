import { TmdbShowByIdResponse, TmdbTvSeason } from '@reelist/interfaces/tmdb/TmdbShowResponse'
import { TmdbMovieByIdResponse } from '@reelist/interfaces/tmdb/TmdbMovieResponse'
import { TmdbVideoPartialFormatter } from './TmdbVideoPartialFormatter'
import _ from 'lodash'
import { TmdbVideoByIdResponse } from '@reelist/interfaces/tmdb/TmdbVideoByIdType'
import moment from 'moment'
import { TmdbShowById } from '@reelist/models/tmdb/TmdbShowById'
import { TmdbMovieById } from '@reelist/models/tmdb/TmdbMovieById'
import { TmdbVideoType } from '@reelist/models/Video'
import {
  TmdbWatchProviderData,
  TmdbWatchProviderResponse,
} from '@reelist/interfaces/tmdb/TmdbWatchProviderResponse'
import { TmdbPersonCreditResponse } from '@reelist/interfaces/tmdb/TmdbPersonResponse'

const formatProviders = (
  tmdbWatchProviderResponse: TmdbWatchProviderResponse,
): Record<string, TmdbWatchProviderData[]> => {
  const providerResponsesByRegion = _.mapKeys(tmdbWatchProviderResponse, (_value, key) =>
    _.toUpper(key),
  )

  const providersByRegion = _.mapValues(providerResponsesByRegion, providerCountry => {
    const link = providerCountry.link

    const buys = _.map(providerCountry.buy, providerData => ({
      ...providerData,
      link,
      type: 'Buy',
    }))

    const rents = _.map(providerCountry.rent, providerData => ({
      ...providerData,
      link,
      type: 'Rent',
    }))

    const streams = _.map(providerCountry.flatrate, providerData => ({
      ...providerData,
      link,
      type: 'Stream',
    }))

    return _.sortBy([...streams, ...rents, ...buys], 'providerName', 'displayPriority')
  })

  return providersByRegion
}

const formatCast = (cast: TmdbPersonCreditResponse[]) => {
  return _.take(cast, 200)
}

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

    const seasonMap: Record<number, TmdbTvSeason> = {}

    // manually attach the season from the custom season appended request
    _.keys(json).forEach(key => {
      if (!key.startsWith('season/')) return

      const season = _.get(json, key) as TmdbTvSeason
      if (!season?.name) throw new Error('season response is broken')
      seasonMap[season.seasonNumber] = season
    })

    return new TmdbShowById({
      ...showPartial,
      ...rest,
      similar,
      episodeRunTimes: json.episodeRunTime,
      mediaType: 'tv',
      isTv: true,
      cast: formatCast(_.uniqBy(cast, 'id')),
      seasonPartials,
      providers: formatProviders(json['watch/providers'].results),
      videoRuntime: seasonPartials.length === 1 ? '1 season' : `${seasonPartials.length} seasons`,
      lastVideoReleaseDate: moment(json.lastAirDate),
      // deviation from the original Video implementation which removed the future episodes from the count
      totalDurationMinutes: (_.min(json.episodeRunTime) || 0) * json.numberOfEpisodes,
      seasonMap,
    })
  }

  static fromTmdbMovie(json: TmdbMovieByIdResponse): TmdbMovieById {
    const genreIds = _.map(json.genres, 'id')
    const moviePartial = TmdbVideoPartialFormatter.fromTmdbMovie({
      ...json,
      genreIds,
    })

    const similar = json.similar.results.map(TmdbVideoPartialFormatter.fromTmdbMovie)

    return {
      ...moviePartial,
      ...json,
      similar,
      mediaType: 'mv',
      isTv: false,
      cast: formatCast(json.credits.cast),
      providers: formatProviders(json['watch/providers'].results),
      videoRuntime: `${json.runtime} min`,
      lastVideoReleaseDate: moviePartial.videoReleaseDate,
      totalDurationMinutes: json.runtime,
    }
  }
}
