import _ from 'lodash'
import { flow, makeAutoObservable } from 'mobx'
import { Decamelized } from 'humps'
import { callTmdb, sendNotifications, UpdateType } from '@reelist/apis/api'
import moment from 'moment'
import { humanizedDuration } from '@reelist/utils/humanizedDuration'
import VideoStore from './VideoStore'
import VideoApi from '@reelist/apis/VideoApi'
import { VideoInfoType, VideoTableType } from 'libs/interfaces/src/lib/tables/VideoTable'
import Auth from '@reelist/models/Auth'

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

type TvNetwork = {
  name: string
  id: string
  logoPath: string
}

export type Provider = {
  logoPath: string
  providerId: number
  providerName: string
  displayPriority: number
}

type ProviderCountry = {
  link: string
  flatrate: Provider[]
  rent: Provider[]
  buy: Provider[]
}

type TvGenre = {
  id: number
  name: string
}

type VideoImageType = {
  aspectRatio: number
  height: number
  filePath: string
  voteAverage: number
  width: number

  // ignored:
  // voteCount
  // iso6391
}

type CastMember = {
  id: number
  name: string
  character: string
  order: number
  profilePath: string
}

type Credits = {
  cast: CastMember[]
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
  originCountry?: string[] | undefined
  originalName?: string | undefined
  voteAverage!: number
  voteCount!: number
  runtime?: number
  episodeRunTime?: number[]
  numberOfEpisodes?: number
  seasons?: TvSeason[] | undefined
  lastEpisodeToAir?: TvEpisode
  nextEpisodeToAir?: TvEpisode
  networks: TvNetwork[] = []
  providers!: Record<string, ProviderCountry> // = {}
  genres: TvGenre[] = []
  aggregateCredits?: Credits
  credits!: Credits
  similar: { results?: Video[] } = {}
  _relatedVideos?: Video[]
  images?: {
    backdrops: VideoImageType[]
    logos: VideoImageType[]
    posters: VideoImageType[]
  }

  videoId: string
  tracked = false
  videoInfo: VideoInfoType = {}
  serverId: string | undefined
  unWatchableEpisodeCount = 0
  allowInHistory = true

  seasonMap: Record<number, TvSeason | null> = {}

  constructor(
    json: Video,
    videoTableData: VideoTableType | null = null,
    videoId: string | null = null,
    private videoStore: VideoStore,
    private videoApi: VideoApi,
    private storeAuth: Auth
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
      similar: false,
      _relatedVideos: false,
    })

    if (videoId) {
      this.mediaType = videoId.startsWith('mv') ? 'movie' : 'tv'
      this.id = videoId.substring(2)
      this.videoId = videoId
    } else {
      this.videoId = (json.mediaType === 'movie' ? 'mv' : 'tv') + json.id
    }

    this._assignValuesFromJson(json)

    if (videoTableData) {
      this._assignFromVideoTable(videoTableData)
    } else if (storeAuth.loggedIn) {
      this._lazyLoadVideoFromVideoTable()
    }
  }

  _assignValuesFromJson = (json: Video) => {
    // remove special seasons until we learn how to deal with them
    json.seasons && _.remove(json.seasons, season => season.name === 'Specials')

    Object.assign(this, json)

    if (this.providers) return

    const providers = _.get(json, 'watch/providers.results') || {}
    this.providers = _.mapKeys(providers, (_value, key) => _.toUpper(key))
  }

  _assignFromVideoTable = (videoTable: VideoTableType) => {
    // if we already tried to get the data and nothing was there
    if (!videoTable.id) return

    this.serverId = videoTable.id
    this.videoInfo = videoTable.video_info || {}
    this.tracked = videoTable.tracked
    this.allowInHistory = videoTable.allow_in_history
  }

  _lazyLoadVideoFromVideoTable = async () => {
    const { data: videoTable, error } = await this.videoApi.loadVideo({
      videoId: this.videoId,
    })

    if (error) {
      // console.error('failed to lazy load video:', error.message)
    } else if (videoTable) {
      this._assignFromVideoTable(videoTable)
    }
  }

  _calculateUnwatchedEpisodes = () => {
    if (this.isMovie) return

    let episodesAfterLastAired = 0
    let lastEpisode = this.lastEpisodeToAir

    while (lastEpisode?.next) {
      episodesAfterLastAired += 1
      lastEpisode = lastEpisode.next
    }

    this.unWatchableEpisodeCount = episodesAfterLastAired
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

      if (
        nextEpisode.episodeNumber === this.lastEpisodeToAir?.episodeNumber &&
        nextEpisode.seasonNumber === this.lastEpisodeToAir?.seasonNumber
      ) {
        this.lastEpisodeToAir = nextEpisode
      } else if (
        nextEpisode.episodeNumber === this.nextEpisodeToAir?.episodeNumber &&
        nextEpisode.seasonNumber === this.nextEpisodeToAir?.seasonNumber
      ) {
        this.nextEpisodeToAir = nextEpisode
      }

      nextEpisode.previous = previousEpisode
      previousEpisode.next = nextEpisode
      previousEpisode = nextEpisode
    }

    while (season) {
      season.episodes?.forEach(assignPreviousAndNextEpisode)

      season = this.seasonMap[season.seasonNumber + 1]
    }

    // if the next episode airdate is before right now
    if (this.nextEpisodeToAir && moment(this.nextEpisodeToAir.airDate).isBefore()) {
      this.lastEpisodeToAir = this.nextEpisodeToAir
      this.nextEpisodeToAir = this.nextEpisodeToAir.next
    }

    this._calculateUnwatchedEpisodes()
  }

  toggleTracked = async () => {
    console.log('toggling tracked')
    const nextTracked = !this.tracked

    await this.updateWatched('toggle tracked', {
      tracked: nextTracked,
    })
  }

  toggleHistoryVisibility = async () => {
    const nextAllowInHistory = !this.allowInHistory

    await this.updateWatched('toggle history visibility', {
      allow_in_history: nextAllowInHistory,
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

    if (this.isMovie) {
      lastWatchedEpisodeData = episodeToEpisodeWatchedData(null)
      nextIsWatched = !this.isWatched
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
    const { data: videoJson, error } = await this.videoApi.updateVideo({
      ...upsertData,
      id: this.serverId,
      video_id: this.videoId,
    })

    if (error) {
      console.error('video failed to ' + type, error.message)
    } else if (videoJson) {
      console.log(this.videoName + ': ' + type)
      this._assignFromVideoTable(videoJson)
    }

    // this.notifyListsAboutWatched(update)
  }

  notifyListsAboutWatched = async (update: UpdateType) => {
    await sendNotifications({ ...update })
  }

  fetchWatchProviders = async () => {
    if (!_.isEmpty(this.providers)) return

    const videoType = this.isTv ? 'tv' : 'movie'

    const providers = await callTmdb(`/${videoType}/${this.id}/watch/providers`)
      .then(item => _.get(item, 'data.data.results') as Record<string, ProviderCountry>)
      .then(providers => _.mapKeys(providers, (_value, key) => _.toUpper(key)))

    this.providers = providers
  }

  fetchSeason = async (seasonNumber: number) => {
    if (this.seasonMap[seasonNumber]) return this.seasonMap[seasonNumber]

    debugger

    // console.log('fetching season: ', seasonNumber, 'for', this.name)

    const path = this.tmdbPath + '/season/' + seasonNumber

    let season: TvSeason | null = null

    try {
      season = (await callTmdb(path).then(item => _.get(item, 'data.data'))) as TvSeason
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      this.seasonMap[seasonNumber] = season
    }

    return this.seasonMap[seasonNumber]
  }

  fetchSeasons = flow(function* (this: Video) {
    if (!this.seasons) return

    const seasonMap = this.videoStore.videoSeasonMapByVideoId[this.videoId]

    if (!_.isUndefined(seasonMap)) {
      this.seasonMap = seasonMap
    } else {
      console.log('fetching seasons')
      yield Promise.allSettled(this.seasons?.map(season => this.fetchSeason(season.seasonNumber)))

      // debugger
      this.videoStore.videoSeasonMapByVideoId[this.videoId] = this.seasonMap || null
    }

    // if(_.isUndefined(this.videoStore.videoSeasonMapByVideoId[this.videoId]) {
    //   return
    // }

    this._linkEpisodes()
  })

  fetchRelated = () => {
    if (this._relatedVideos || !this.similar?.results) return this._relatedVideos || []

    this._relatedVideos = this.similar.results.map(similarVideoJson =>
      this.videoStore.makeUiVideo(similarVideoJson, this.mediaType + similarVideoJson.id),
    )

    return this._relatedVideos
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

  compareCompletionTo = (otherVideo: Video) => {
    // they cannot watch anymore episodes, can we?
    if (otherVideo.isCompleted) return this.isCompleted ? 0 : 1

    // they can watch more episodes, we cant.
    if (this.isCompleted) return -1

    // they cant watch any epsidoes today, can we?
    if (otherVideo.isLatestEpisodeWatched) return this.isLatestEpisodeWatched ? 0 : 1

    // they can actively watch another episode, can we?
    return this.isLatestEpisodeWatched ? -1 : 0
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
      episodeToWatch = episodeToWatch.next
    }

    return episodeToWatch
  }

  get isTv() {
    return this.mediaType === 'tv'
  }

  get isMovie() {
    return this.mediaType === 'movie'
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
    return moment(this.releaseDate || this.firstAirDate)
  }

  get lastVideoReleaseDate() {
    if (this.isMovie) return moment(this.releaseDate)

    return moment(this.lastEpisodeToAir?.airDate)
  }

  get tmdbPath() {
    return '/' + this.mediaType + '/' + this.id
  }

  // previously these values will still be stored on the server for now
  // but may just stick to the computed method entirely later
  get lastWatchedSeasonNumber() {
    return this.lastWatchedEpisodeFromEnd?.seasonNumber
  }

  get lastWatchedEpisodeNumber() {
    return this.lastWatchedEpisodeFromEnd?.episodeNumber
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

  get watchedEpisodeCount() {
    let watchedEpisodeCount = 0

    let episode = this.seasonMap[1]?.episodes?.[0]

    // go through every episode to see if its watched
    // could be faster by looking at the video list data
    while (episode) {
      if (this.getIsEpisodeWatched(episode)) {
        watchedEpisodeCount += 1
      }

      episode = episode.next
    }

    return watchedEpisodeCount
  }

  get minEpisodeRunTime() {
    return _.min(this.episodeRunTime) || 0
  }

  get totalWatchedDurationMinutes() {
    if (this.isCompleted) {
      return this.totalDurationMinutes
    }

    if (this.isMovie) {
      return 0
    }

    return this.watchedEpisodeCount * this.minEpisodeRunTime
  }

  get totalWatchedDuration() {
    return humanizedDuration(this.totalWatchedDurationMinutes)
  }

  get totalDurationMinutes() {
    if (this.isMovie) {
      return this.runtime || 0
    }

    if (this.numberOfEpisodes !== undefined) {
      return (this.numberOfEpisodes - this.unWatchableEpisodeCount) * this.minEpisodeRunTime
    }

    return 0
  }

  get durationOrSeasons() {
    if (this.isTv) {
      return `${this.seasons?.length} seasons`
    }

    return `${this.totalDurationMinutes} min`
  }

  get totalDuration() {
    return humanizedDuration(this.totalDurationMinutes)
  }

  get cast() {
    return (this.credits || this.aggregateCredits).cast || []
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
