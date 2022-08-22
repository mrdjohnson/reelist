import supabase from '~/supabase'
import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import Auth from './Auth'
import { callTmdb, sendNotifications, UpdateType } from '~/api/api'

export type TvEpisodeType = {
  airDate: string
  episodeNumber: number
  id: string
  name: string
  overview: string
  productionCode: string
  runtime: number
  seasonNumber: number
  showId: number
  stillPath: string
  voteAverage: number
  voteCount: number
}

export type TvSeasonTmdbType = {
  airDate: string
  episodeCount: number
  id: string
  name: string
  overview: string
  posterPath: string
  seasonNumber: number
  episodes: TvEpisodeType[]
}

type TvSeasonTableType = {
  watched?: boolean
  shows?: Record<string, boolean>
}

type TvSeasonType = TvSeasonTableType & TvSeasonTmdbType

type TvSeasonProps = {
  tmdbData?: TvSeasonTmdbType
  tableData?: TvSeasonTableType
}

class TvSeason implements TvSeasonType {
  airDate!: string
  episodeCount!: number
  id!: string
  name!: string
  overview!: string
  posterPath!: string
  seasonNumber!: number
  episodes!: TvEpisodeType[]

  watched!: boolean
  shows!: Record<string, boolean>

  videoServerId?: string

  storeAuth: Auth

  constructor({ tmdbData, tableData }: TvSeasonProps = {}) {
    if (videoId) {
      this.mediaType = videoId.startsWith('mv') ? 'movie' : 'tv'
      this.id = videoId.substring(2)
    }

    if (tableData) {
      this._assignValuesFromJson(tableData)
    } else {
      this._lazyLoadDataFromTable()
    }

    this.storeAuth = auth

    makeAutoObservable(this, {
      airDate: false,
      episodeCount: false,
      id: false,
      name: false,
      overview: false,
      posterPath: false,
      seasonNumber: false,
      episodes: false,
    })
  }

  _assignValuesFromJson = (json: Video) => {
    // remove special seasons until we learn how to deal with them
    json.seasons && _.remove(json.seasons, season => season.name === 'Specials')

    Object.assign(this, json)
  }

  _assignFromTable = (tvSeasonTable: TvSeasonTableType) => {
    this.watched = tvSeasonTable.watched
    this.shows = tvSeasonTable.shows
  }

  _lazyLoadDataFromTable = async () => {
    const { data: videoTable, error } = await supabase
      .from<TvSeasonTableType>('videos')
      .select('*')
      .match({ video_id: this.videoId })
      .maybeSingle()

    if (error) {
      console.error('failed to lazy load video:', error.message)
    } else if (videoTable) {
      this._assignFromVideoTable(videoTable)
    }
  }

  toggleTracked = async () => {
    const nextTracked = !this.tracked

    const { data: videoJson, error } = await supabase
      .from<VideoTableType>('videos')
      .upsert({
        id: this.serverId,
        video_id: this.videoId,
        video_info: { ...this.videoInfo },
        tracked: nextTracked,
      })
      .single()

    if (error) {
      console.error('failed to toggle watched for video', error.message)
    } else if (videoJson) {
      this._assignFromVideoTable(videoJson)
    }
  }

  toggleWatched = async (watchedOverride: boolean | undefined = undefined) => {
    const nextWatched = watchedOverride ?? !this.watched

    await this.updateWatched({
      video_info: { watched: nextWatched },
      // todo, if unmarking a video... what should happen here?
      current_season: 1,
      current_episode: 1,
    })
  }

  toggleSeasonWatched = async (
    seasonNumber: number,
    seasonWatchedOverride: boolean | undefined = undefined,
  ) => {
    const seasonWatched = this.getSeasonWatched(seasonNumber)
    const seasonPartiallyWatched = this.getSeasonPartiallyWatched(seasonNumber)

    let nextSeasonWatched = !seasonWatched

    if (seasonPartiallyWatched) {
      nextSeasonWatched = true
    }

    // if there is an override, ignore everything else and just say its whatever the override is
    nextSeasonWatched = seasonWatchedOverride ?? nextSeasonWatched

    const seasons: Record<string, TvSeasonTableType> = {
      ...this.videoInfo?.seasons,
      // watch or unwatch all episodes
      [seasonNumber]: { watched: nextSeasonWatched },
    }

    const totalSeasons = _.size(this.seasonMap)
    const totalSeasonOverrides = _.size(seasons)

    const getAllSeasonsWatched = (watched: boolean) => {
      if (totalSeasons !== totalSeasonOverrides) return false

      const allSeasonsWatched = _.every(seasons, season => season.watched === watched)
      return allSeasonsWatched
    }

    if (getAllSeasonsWatched(true)) {
      return await this.toggleWatched(true)
    } else if (getAllSeasonsWatched(false)) {
      return await this.toggleWatched(false)
    }

    await this.updateWatched({
      video_info: { ...this.videoInfo, seasons },
      // todo, if unmarking a season... what should happen here?
      current_season: seasonNumber + 1,
      current_episode: 1,
    })
  }

  toggleEpisodeWatched = async (episode: TvEpisodeType) => {
    const { seasonNumber, episodeNumber } = episode

    const season = { ...this.getSeason(seasonNumber) }
    const episodes = season.episodes || {}
    const episodeWatched = this.getEpisodeWatched(episode)

    season.episodes = { ...episodes, [episodeNumber]: !episodeWatched }

    const totalEpisodes = _.size(this.seasonMap[seasonNumber]?.episodes)
    const totalEpisodeOverrides = _.size(season.episodes)

    const getAllEpisodesWatched = (watched: boolean) => {
      if (season.watched !== watched && totalEpisodeOverrides !== totalEpisodes) return false

      const allEpisodes = _.every(season.episodes, episodeWatched => episodeWatched === watched)
      return allEpisodes
    }

    if (getAllEpisodesWatched(true)) {
      return await this.toggleSeasonWatched(seasonNumber, true)
    } else if (getAllEpisodesWatched(false)) {
      return await this.toggleSeasonWatched(seasonNumber, false)
    }

    const seasons = {
      ...this.videoInfo?.seasons,
      [seasonNumber]: season,
    }

    await this.updateWatched({
      video_info: { ...this.videoInfo, seasons },
      // todo, if unmarking an episode... what should happen here?
      current_season: episode.seasonNumber,
      current_episode: episode.episodeNumber + 1,
    })
  }

  backfillWatched = async () => {
    const nextVideoInfo: VideoInfoType = {
      ...this.videoInfo,
    }

    nextVideoInfo.seasons = nextVideoInfo.seasons || {}

    let seasonNumber = this.currentSeason - 1

    while (seasonNumber >= 1) {
      nextVideoInfo.seasons[String(seasonNumber)] = { watched: true }

      seasonNumber -= 1
    }

    let episodeNumber = this.currentEpisode - 1

    // init the current episodes if they do not exist,
    // should be impossible-ish because this was assinged somehow
    const currentSeason = nextVideoInfo.seasons[this.currentSeason]
    if (!currentSeason.episodes) currentSeason.episodes = {}

    while (episodeNumber >= 1) {
      currentSeason.episodes[episodeNumber] = true

      episodeNumber -= 1
    }

    this.updateWatched({
      video_info: nextVideoInfo,
    })
  }

  updateWatched = async (upsertData: Partial<VideoTableType>) => {
    const { data: videoJson, error } = await supabase
      .from<VideoTableType>('videos')
      .upsert({
        ...upsertData,
        id: this.serverId,
        video_id: this.videoId,
      })
      .single()

    if (error) {
      console.error('failed to toggle watched for video', error.message)
    } else if (videoJson) {
      this._assignFromVideoTable(videoJson)
    }

    // this.notifyListsAboutWatched(update)
  }

  notifyListsAboutWatched = async (update: UpdateType) => {
    await sendNotifications({ ...update })
  }

  fetchSeason = async (seasonNumber: number) => {
    if (this.seasonMap[seasonNumber]) return this.seasonMap[seasonNumber]

    console.log('fetching season: ', seasonNumber, 'for', this.name)

    const path = this.tmdbPath + '/season/' + seasonNumber

    let season: TvSeasonTmdbType | null = null

    try {
      season = await callTmdb(path).then(item => _.get(item, 'data.data'))
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      this.seasonMap[seasonNumber] = season
    }

    return this.seasonMap[seasonNumber]
  }

  fetchSeasons = async () => {
    if (!this.seasons) return

    await Promise.allSettled(this.seasons?.map(season => this.fetchSeason(season.seasonNumber)))
  }

  watchNextEpisode = () => {
    if (this.nextEpisode) {
      this.toggleEpisodeWatched(this.nextEpisode)
    }
  }

  getSeason = (seasonNumber: number) => {
    return this.videoInfo?.seasons?.[seasonNumber] || {}
  }

  getSeasonWatched = (seasonNumber: number) => {
    return this.getSeason(seasonNumber).watched ?? this.watched
  }

  getSeasonPartiallyWatched = (seasonNumber: number) => {
    // if there are any episode overrides, the season is partially watched
    return !_.isEmpty(this.getSeason(seasonNumber).episodes)
  }

  getEpisodeWatched = (episode: TvEpisodeType) => {
    const { seasonNumber, episodeNumber } = episode

    return (
      this.getSeason(seasonNumber).episodes?.[episodeNumber] ?? this.getSeasonWatched(seasonNumber)
    )
  }

  get nextEpisode() {
    let seasonNumber = this.currentSeason
    let episodeNumber = this.currentEpisode

    console.log('next ep: ', this.name)

    if (!this.seasonMap) return
    console.log(
      'first_run name: ',
      this.name,
      'season:',
      seasonNumber,
      'episode:',
      episodeNumber,
      _.size(this.seasonMap),
    )

    while (seasonNumber <= _.size(this.seasonMap)) {
      const season = this.seasonMap[seasonNumber]

      const episodeCount = _.size(season?.episodes)

      const episode = _.find(season?.episodes, { episodeNumber })
      console.log('while_run name: ', this.name, 'season:', seasonNumber, 'episode:', episodeNumber)

      if (episode) {
        return episode
      } else if (episodeNumber < episodeCount) {
        episodeNumber += 1
      } else {
        episodeNumber = 1
        seasonNumber += 1
      }
    }
  }

  get videoId() {
    return (this.mediaType === 'movie' ? 'mv' : 'tv') + this.id
  }

  get watched() {
    return !!this.videoInfo?.watched
  }

  get partiallyWatched() {
    return !_.isEmpty(this.videoInfo?.seasons)
  }

  get videoName() {
    return this.name || this.title || 'Un-titled'
  }

  get videoReleaseDate() {
    return this.releaseDate || this.firstAirDate
  }

  get tmdbPath() {
    return '/' + this.mediaType + '/' + this.id
  }
}

export default TvSeason
