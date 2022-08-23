import supabase from '~/supabase'
import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import Auth from './Auth'
import { Decamelized } from 'humps'
import { callTmdb, sendNotifications, UpdateType } from '~/api/api'

export type TvEpisode = {
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
  voteAverage: 7.6
  voteCount: number
  next?: TvEpisode
  previous?: TvEpisode
}

export type TvSeason = {
  airDate: string
  episodeCount?: number
  id: string
  name: string
  overview: string
  posterPath: string
  seasonNumber: number
  episodes?: TvEpisode[]
}

type WatchedSeasonJson = {
  watched?: boolean
  episodes?: Record<number, boolean>
}

export type VideoInfoType = {
  watched?: boolean
  seasons?: Record<number, WatchedSeasonJson>
}

export type VideoTableType = {
  id: string
  video_id: string
  tracked: boolean
  last_watched_season_number: number | null
  last_watched_episode_number: number | null
  video_info: VideoInfoType
}

class Video {
  adult?: boolean | undefined
  backdropPath!: string
  genreIds!: number[]
  id!: string
  mediaType!: 'movie' | 'tv'
  originalLanguage!: string
  originalTitle?: string | undefined
  overview!: string
  popularity!: number
  posterPath!: string
  releaseDate?: string | undefined
  title?: string | undefined
  name?: string | undefined
  firstAirDate?: string | undefined
  video?: boolean | undefined
  originCountry?: [string] | undefined
  originalName?: string | undefined
  voteAverage!: number
  voteCount!: number
  seasons?: TvSeason[] | undefined
  lastEpisodeToAir?: TvEpisode
  nextEpisodeToAir?: TvEpisode

  tracked = false
  videoInfo: VideoInfoType = {}
  serverId: string | undefined

  storeAuth: Auth

  lastWatchedSeasonNumber: number | null = null
  lastWatchedEpisodeNumber: number | null = null
  seasonMap: Record<number, TvSeason | null> = {}

  constructor(
    json: Video,
    auth: Auth,
    videoTableData: VideoTableType | null = null,
    videoId: string | null = null,
  ) {
    makeAutoObservable(this, {
      adult: false,
      backdropPath: false,
      genreIds: false,
      id: false,
      mediaType: false,
      originalLanguage: false,
      originalTitle: false,
      overview: false,
      popularity: false,
      posterPath: false,
      releaseDate: false,
      title: false,
      name: false,
      firstAirDate: false,
      video: false,
      originCountry: false,
      originalName: false,
      voteAverage: false,
      voteCount: false,
      seasons: false,
      storeAuth: false,
    })

    if (videoId) {
      this.mediaType = videoId.startsWith('mv') ? 'movie' : 'tv'
      this.id = videoId.substring(2)
    }

    this._assignValuesFromJson(json)

    if (videoTableData) {
      this._assignFromVideoTable(videoTableData)
    } else {
      this._lazyLoadVideoFromVideoTable()
    }

    this.storeAuth = auth
  }

  _assignValuesFromJson = (json: Video) => {
    // remove special seasons until we learn how to deal with them
    json.seasons && _.remove(json.seasons, season => season.name === 'Specials')

    Object.assign(this, json)
  }

  _assignFromVideoTable = (videoTable: VideoTableType) => {
    this.serverId = videoTable.id
    this.videoInfo = videoTable.video_info || {}
    this.tracked = videoTable.tracked
    this.lastWatchedSeasonNumber = videoTable.last_watched_season_number
    this.lastWatchedEpisodeNumber = videoTable.last_watched_episode_number
  }

  _lazyLoadVideoFromVideoTable = async () => {
    const { data: videoTable, error } = await supabase
      .from<VideoTableType>('videos')
      .select('*')
      .match({ video_id: this.videoId })
      .maybeSingle()

    if (error) {
      console.error('failed to lazy load video:', error.message)
    } else if (videoTable) {
      this._assignFromVideoTable(videoTable)
    }
  }

  _linkEpisodes = () => {
    let season = this.seasonMap[1]
    let previousEpisode: TvEpisode

    const assignPreviousAndNextEpisode = (nextEpisode: TvEpisode) => {
      if (!previousEpisode) {
        // this should only happen for the very first episode
        previousEpisode = nextEpisode
        return
      }

      if (nextEpisode.episodeNumber === this.lastEpisodeToAir?.episodeNumber) {
        this.lastEpisodeToAir = nextEpisode
      }

      nextEpisode.previous = previousEpisode
      previousEpisode.next = nextEpisode
      previousEpisode = nextEpisode
    }

    while (season) {
      season.episodes?.forEach(assignPreviousAndNextEpisode)

      season = this.seasonMap[season.seasonNumber + 1]
    }
  }

  toggleTracked = async () => {
    const nextTracked = !this.tracked

    await this.updateWatched('toggle tracked', {
      tracked: nextTracked,
    })
  }

  toggleWatched = async (isWatchedOverride: boolean | null = null) => {
    let nextIsWatched = isWatchedOverride

    if (nextIsWatched === null) {
      const seasonIsWatchedOrPartiallyWatched = (season: TvSeason | null) => {
        if (season === null) return false
        if (this.getIsSeasonPartiallyWatched(season.seasonNumber)) return true
        return this.getIsSeasonWatched(season.seasonNumber)
      }

      const hasWatchedData = _.some(this.seasonMap, seasonIsWatchedOrPartiallyWatched)

      nextIsWatched = !hasWatchedData
    }

    // if the show has been watched; mark the last aired episode as watched
    // if the show has been unwatched; set to null
    let lastWatchedEpisodeData

    if (nextIsWatched) {
      // mark the most recent episode, and all the previous ones as watched
      if (this.nextEpisodeToAir) {
        this.backfillWatched(this.lastEpisodeToAir)

        // leave episode as un-watched
        return
      }

      // mark last episode at this time as watched
      lastWatchedEpisodeData = episodeToEpisodeWatchedData(this.lastEpisodeToAir)
    } else {
      // reset any watched episode data
      lastWatchedEpisodeData = episodeToEpisodeWatchedData(null)
      nextIsWatched = false
    }

    await this.updateWatched('toggle watched', {
      video_info: { watched: nextIsWatched },
      ...lastWatchedEpisodeData,
    })
  }

  toggleSeasonWatched = async (
    seasonNumber: number,
    isSeasonWatchedOverride: boolean | undefined = undefined,
  ) => {
    const isSeasonWatched = this.getIsSeasonWatched(seasonNumber)
    const isSeasonPartiallyWatched = this.getIsSeasonPartiallyWatched(seasonNumber)
    const lastEpisodeInSeason = seasonNumber === this.lastEpisodeToAir?.seasonNumber

    let seasonWillBeWatched = !(isSeasonWatched || isSeasonPartiallyWatched)

    // if there is an override, ignore everything else and just say its whatever the override is
    seasonWillBeWatched = isSeasonWatchedOverride ?? seasonWillBeWatched

    const watchedSeasons = this.getWatchedSeasons()

    let lastWatchedEpisodeData

    if (seasonWillBeWatched) {
      let episode

      if (lastEpisodeInSeason) {
        episode = this.lastEpisodeToAir
      } else {
        episode = _.last(this.seasonMap[seasonNumber]?.episodes)
      }

      if (!episode) throw new Error('unable to find last episode for season')

      this.backfillSeason(episode)

      if (this.getIsAllSeasonsWatched(true)) {
        return await this.toggleWatched(true)
      }

      lastWatchedEpisodeData = episodeToEpisodeWatchedData(episode)
    } else {
      watchedSeasons[seasonNumber] = { watched: false }

      if (this.getIsAllSeasonsWatched(false)) {
        return await this.toggleWatched(false)
      }

      lastWatchedEpisodeData = episodeToEpisodeWatchedData(this.lastWatchedEpisodeFromEnd)
    }

    await this.updateWatched('toggle season watched', {
      video_info: this.videoInfo,
      ...lastWatchedEpisodeData,
    })
  }

  toggleEpisodeWatched = async (
    episode: TvEpisode,
    isEpisodeWatchedOverride: boolean | undefined = undefined,
  ) => {
    const { seasonNumber, episodeNumber } = episode

    const watchedEpisodes = this.getWatchedSeasonEpisodes(seasonNumber)
    const episodeWillBeWatched = isEpisodeWatchedOverride ?? !this.getIsEpisodeWatched(episode)

    watchedEpisodes[episodeNumber] = episodeWillBeWatched

    if (!episodeWillBeWatched) {
      this.getWatchedSeason(seasonNumber).watched = false
    }

    if (this.getIsAllEpisodesInSeasonWatched(seasonNumber, true)) {
      return await this.toggleSeasonWatched(seasonNumber, true)
    } else if (this.getIsAllEpisodesInSeasonWatched(seasonNumber, false)) {
      return await this.toggleSeasonWatched(seasonNumber, false)
    }

    let lastWatchedEpisodeData: Partial<VideoTableType> = {}

    if (episodeWillBeWatched) {
      lastWatchedEpisodeData = episodeToEpisodeWatchedData(episode)
    } else {
      lastWatchedEpisodeData = episodeToEpisodeWatchedData(this.lastWatchedEpisodeFromEnd)
    }

    await this.updateWatched('toggle episode watched', {
      video_info: this.videoInfo,
      ...lastWatchedEpisodeData,
    })
  }

  backfillSeason = (lastEpisodeWatchedInSeason: TvEpisode) => {
    const seasonNumber = lastEpisodeWatchedInSeason.seasonNumber
    const currentSeasonEpisodes = this.getWatchedSeasonEpisodes(seasonNumber)

    let episodeNumber = lastEpisodeWatchedInSeason.episodeNumber

    while (episodeNumber >= 1) {
      currentSeasonEpisodes[episodeNumber] = true

      episodeNumber -= 1
    }

    const seasons = this.getWatchedSeasons()

    // there is always at least one episode in the season watched, no need to falsey check
    if (this.getIsAllEpisodesInSeasonWatched(seasonNumber, true)) {
      seasons[seasonNumber] = { watched: true }
    }
  }

  backfillWatched = async (lastWatchedEpisodeOverride: TvEpisode | null = null) => {
    const lastWatchedEpisode = lastWatchedEpisodeOverride || this.currentBaseEpisode

    if (!lastWatchedEpisode) return

    const lastWatchedSeasonNumber = lastWatchedEpisode.seasonNumber

    let seasonNumber = lastWatchedSeasonNumber - 1
    const seasons = this.getWatchedSeasons()

    while (seasonNumber >= 1) {
      seasons[seasonNumber] = { watched: true }

      seasonNumber -= 1
    }

    this.backfillSeason(lastWatchedEpisode)

    // run through the logic to condense everything as watched
    await this.toggleEpisodeWatched(lastWatchedEpisode, true)
  }

  updateWatched = async (type: string, upsertData: Partial<VideoTableType>) => {
    const { data: videoJson, error } = await supabase
      .from<VideoTableType>('videos')
      .upsert({
        ...upsertData,
        id: this.serverId,
        video_id: this.videoId,
      })
      .single()

    if (error) {
      console.error('video failed to ' + type, error.message)
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

    let season: TvSeason | null = null

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

    this._linkEpisodes()
  }

  watchNextEpisode = () => {
    if (this.nextEpisode) {
      this.toggleEpisodeWatched(this.nextEpisode)
    }
  }

  getWatchedSeasons = () => {
    if (!this.videoInfo.seasons) this.videoInfo.seasons = {}

    return this.videoInfo.seasons
  }

  getWatchedSeason = (seasonNumber: number) => {
    const seasons = this.getWatchedSeasons()

    if (!seasons[seasonNumber]) seasons[seasonNumber] = {}

    return seasons[seasonNumber]
  }

  getWatchedSeasonEpisodes = (seasonNumber: number) => {
    const season = this.getWatchedSeason(seasonNumber)

    if (!season.episodes) season.episodes = {}

    return season.episodes
  }

  getIsSeasonWatched = (seasonNumber: number) => {
    return this.getWatchedSeason(seasonNumber).watched ?? this.isWatched
  }

  getIsSeasonPartiallyWatched = (seasonNumber: number) => {
    // if there are any episode overrides, the season is partially watched
    return !_.isEmpty(this.getWatchedSeason(seasonNumber).episodes)
  }

  getIsAllSeasonsWatched = (watched: boolean) => {
    const watchedSeasons = this.getWatchedSeasons()

    const totalSeasons = _.size(this.seasonMap)
    const totalWatchedSeasons = _.size(watchedSeasons)

    if (watched) {
      // fast fail if all of the seasons have not been marked as SOMETHING
      if (totalSeasons !== totalWatchedSeasons) return false

      return _.every(watchedSeasons, season => season.watched === true)
    }

    return _.every(watchedSeasons, season => Boolean(season.watched) === false)
  }

  getIsAllEpisodesInSeasonWatched = (seasonNumber: number, watched: boolean) => {
    const watchedSeason = this.getWatchedSeason(seasonNumber)

    const totalEpisodes = _.size(this.seasonMap[seasonNumber]?.episodes)
    const totalEpisodeOverrides = _.size(watchedSeason.episodes)

    if (watchedSeason.watched !== watched && totalEpisodeOverrides !== totalEpisodes) return false

    const allEpisodes = _.every(
      watchedSeason.episodes,
      episodeWatched => episodeWatched === watched,
    )

    return allEpisodes
  }

  getIsEpisodeWatched = (episode: TvEpisode) => {
    const { seasonNumber, episodeNumber } = episode

    return (
      this.getWatchedSeason(seasonNumber).episodes?.[episodeNumber] ??
      this.getIsSeasonWatched(seasonNumber)
    )
  }

  condenseVideoInfo = () => {
    // this.seasonMap.forEach(({seasonNumber}) => {
    //   // const watchedSeason =
    // })
  }

  get currentBaseEpisode(): TvEpisode | undefined {
    const seasonNumber = this.lastWatchedSeasonNumber || 1
    const episodeNumber = this.lastWatchedEpisodeNumber || 1

    return _.find(this.seasonMap[seasonNumber]?.episodes, { episodeNumber })
  }

  get nextEpisode() {
    const firstEpisode = this.seasonMap[1]?.episodes?.[0]

    if (!this.lastWatchedSeasonNumber || !this.lastWatchedEpisodeNumber) return firstEpisode

    let episodeToWatch = this.currentBaseEpisode?.next || firstEpisode

    while (episodeToWatch && this.getIsEpisodeWatched(episodeToWatch)) {
      this.lastWatchedSeasonNumber = episodeToWatch.seasonNumber
      this.lastWatchedEpisodeNumber = episodeToWatch.episodeNumber

      episodeToWatch = episodeToWatch.next
    }

    return episodeToWatch
  }

  get videoId() {
    return (this.mediaType === 'movie' ? 'mv' : 'tv') + this.id
  }

  get isWatched() {
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

  get lastWatchedEpisodeFromEnd() {
    let lastEpisode = this.lastEpisodeToAir

    while (lastEpisode && !this.getIsEpisodeWatched(lastEpisode)) {
      lastEpisode = lastEpisode.previous
    }

    return lastEpisode
  }

  get isLatestEpisodeWatched() {
    if (this.mediaType === 'movie' || !this.lastEpisodeToAir) return this.isWatched

    if (!this.lastWatchedSeasonNumber && !this.lastWatchedEpisodeNumber) return false
    if (!this.currentBaseEpisode) return false

    const lastEpisodeNumber = this.lastEpisodeToAir.episodeNumber
    const lastSeasonNumber = this.lastEpisodeToAir.seasonNumber

    const currentEpisodeNumber = this.currentBaseEpisode.episodeNumber
    const currentSeasonNumber = this.currentBaseEpisode.seasonNumber

    return lastEpisodeNumber === currentEpisodeNumber && lastSeasonNumber === currentSeasonNumber
  }

  get isCompleted() {
    if (this.mediaType === 'movie' || !this.lastEpisodeToAir) return this.isWatched

    if (this.nextEpisodeToAir) return false

    return this.isLatestEpisodeWatched
  }
}

const episodeToEpisodeWatchedData = (episode: TvEpisode | null | undefined) => {
  if (!episode) {
    return {
      last_watched_season_number: null,
      last_watched_episode_number: null,
    }
  }

  return {
    last_watched_season_number: episode.seasonNumber,
    last_watched_episode_number: episode.episodeNumber,
  }
}

export type VideoJsonType = Decamelized<Video>

export default Video
