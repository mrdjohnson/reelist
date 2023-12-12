import { TmdbShowByIdResponse, TmdbTvSeason } from '@reelist/interfaces/tmdb/TmdbShowResponse'
import { TmdbVideoByIdType } from '@reelist/interfaces/tmdb/TmdbVideoByIdType'
import { classFromProps } from '@reelist/utils/ClassHelper'
import { callTmdb } from '@reelist/apis/api'
import _ from 'lodash'

export abstract class AbstractBaseShow extends classFromProps<
  TmdbVideoByIdType<TmdbShowByIdResponse>
>() {
  fetchSeason = async (seasonNumber: number) => {
    if (this.seasonMap[seasonNumber]) return this.seasonMap[seasonNumber]

    const path = this.tmdbPath + '/season/' + seasonNumber

    let season: TmdbTvSeason | null = null

    try {
      season = (await callTmdb(path).then(item => _.get(item, 'data.data'))) as TmdbTvSeason
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      if (season) {
        this.seasonMap[seasonNumber] = season
      }
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
}

export class TmdbShowById extends AbstractBaseShow {
  override hasUser: false = false
}
