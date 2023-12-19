import { TmdbShowByIdResponse, TmdbTvSeason } from '@reelist/interfaces/tmdb/TmdbShowResponse'
import { TmdbVideoByIdType } from '@reelist/interfaces/tmdb/TmdbVideoByIdType'
import { classFromProps } from '@reelist/utils/ClassHelper'
import { callTmdb } from '@reelist/apis/api'
import _ from 'lodash'
import moment from 'moment'

export abstract class AbstractBaseShow extends classFromProps<
  TmdbVideoByIdType<TmdbShowByIdResponse>
>() {
  hasSeason = (seasonNumber: number) => {
    const season = this.seasonMap[seasonNumber]

    return season !== undefined
  }

  fetchSeason = async (seasonNumber: number) => {
    if (this.hasSeason(seasonNumber)) return this.seasonMap[seasonNumber]

    const path = this.tmdbPath + '/season/' + seasonNumber

    let season: TmdbTvSeason | null = null

    try {
      season = (await callTmdb<TmdbTvSeason>(path).then(item => _.get(item, 'data.data'))) || null
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      this.seasonMap[seasonNumber] = season
    }

    return this.seasonMap[seasonNumber]
  }

  fetchSeasons = async () => {
    await Promise.allSettled(
      this.seasonPartials.map(season => {
        if (this.seasonMap[season.seasonNumber] !== undefined) return

        return this.fetchSeason(season.seasonNumber)
      }),
    )
  }

  hasFutureEpisodes = (season: TmdbTvSeason) => {
    if (!season.episodes) return false

    const currentDate = moment()

    return season.episodes.some(episode => moment(episode.airDate).isAfter(currentDate))
  }
}

export class TmdbShowById extends AbstractBaseShow {
  override hasUser: false = false
}
