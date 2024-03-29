import _ from 'lodash'
import { callTmdb } from '@reelist/apis/api'
import { VideoTableType } from 'libs/interfaces/src/lib/tables/VideoTable'
import { TmdbTvEpisode, TmdbVideoByIdType } from '@reelist/interfaces/tmdb/TmdbVideoByIdType'
import { TmdbShowByIdResponse, TmdbTvSeason } from '@reelist/interfaces/tmdb/TmdbShowResponse'
import User from '@reelist/models/User'
import { UserMovie } from '@reelist/models/UserVideo'
import AbstractUserVideo from '@reelist/models/AbstractUserVideo'
import { flow } from 'mobx'
import moment from 'moment'
import { mix, Mixin } from 'ts-mixer'
import { AbstractBaseShow, TmdbShowById } from '@reelist/models/tmdb/TmdbShowById'

@mix(TmdbShowById, AbstractUserVideo)
class UserShow extends Mixin(AbstractUserVideo, AbstractBaseShow) {
  override isTv: true = true
  override hasUser: true = true

  unWatchableEpisodeCount = 0

  seasons?: TmdbTvSeason[] | undefined

  lastWatchedEpisode?: TmdbTvEpisode
  lastWatchedSeasonNumber?: number
  lastWatchedEpisodeNumber?: number

  constructor(
    public override tmdbVideo: TmdbShowById,
    protected override user: User,
    userVideoData?: VideoTableType,
  ) {
    super(tmdbVideo, user, userVideoData)

    this._linkEpisodes()
  }

  override _assignFromVideoTable(userVideoData?: VideoTableType) {
    super._assignFromVideoTable(userVideoData)

    this.lastWatchedSeasonNumber = userVideoData?.last_watched_season_number || 1
    this.lastWatchedEpisodeNumber = userVideoData?.last_watched_episode_number || 1
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

  // TODO; make this based on the number of episodes left in the season + next season episodes
  _calculateUnwatchedEpisodes = () => {
    let episodesAfterLastAired = 0
    let lastEpisode = this.lastEpisodeToAir

    while (lastEpisode?.next) {
      episodesAfterLastAired += 1
      lastEpisode = lastEpisode.next
    }

    this.unWatchableEpisodeCount = episodesAfterLastAired
  }

  _findEpisode = ({
    episodeNumber,
    seasonNumber,
  }: {
    episodeNumber: number
    seasonNumber: number
  }) => {
    return _.find<TmdbTvEpisode>(this.seasonMap[seasonNumber]?.episodes, {
      episodeNumber,
    })
  }

  _linkEpisodes = () => {
    let previousEpisode: TmdbTvEpisode

    const episodes = _.chain(this.seasonMap)
      .values()
      .orderBy('seasonNumber')
      .flatMap(season => season?.episodes)
      .compact()
      .value()

    episodes.forEach(episode => {
      episode.previous = previousEpisode

      if (previousEpisode) {
        previousEpisode.next = episode
      }

      previousEpisode = episode
    })

    if (this.lastEpisodeToAir) {
      const lastEpisodeToAir = this._findEpisode(this.lastEpisodeToAir)

      if (lastEpisodeToAir) {
        this.lastEpisodeToAir = lastEpisodeToAir
        this.nextEpisodeToAir = lastEpisodeToAir.next
      }
    }

    if (this.lastWatchedSeasonNumber && this.lastWatchedEpisodeNumber) {
      this.lastWatchedEpisode = this._findEpisode({
        seasonNumber: this.lastWatchedSeasonNumber,
        episodeNumber: this.lastWatchedEpisodeNumber,
      })
    }

    // if the next episode airdate is before right now
    if (
      this.nextEpisodeToAir &&
      moment(this.nextEpisodeToAir.airDate).isBefore(moment().endOf('day'))
    ) {
      this.lastEpisodeToAir = this.nextEpisodeToAir
      this.nextEpisodeToAir = this.nextEpisodeToAir.next
    }

    this._calculateUnwatchedEpisodes()
  }

  override toggleWatched = async (isWatchedOverride: boolean | null = null) => {
    let nextIsWatched = isWatchedOverride

    if (nextIsWatched === null) {
      const seasonIsWatchedOrPartiallyWatched = (season: TmdbTvSeason | null) => {
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
    episode: TmdbTvEpisode,
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

  backfillSeason = (lastEpisodeWatchedInSeason: TmdbTvEpisode) => {
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

  backfillWatched = async (lastWatchedEpisodeOverride: TmdbTvEpisode | null = null) => {
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

  // TODO this can avoid a full fetch if we calculate based on the videoInfo instead
  calculateLastWatchedEpisode = async () => {
    await this.fetchSeasons()

    let episode = this.lastWatchedEpisode
    let lastWatchedEpisode = undefined

    while (episode) {
      if (this.getIsEpisodeWatched(episode)) {
        lastWatchedEpisode = episode
        break
      }

      episode = episode.previous
    }

    return episodeToEpisodeWatchedData(lastWatchedEpisode)
  }

  override updateWatched = async (type: string, upsertData: Partial<VideoTableType>) => {
    // this is a work around to always have last watched episode data for a show
    const episodeDataOverride = await this.calculateLastWatchedEpisode()

    const { data: videoJson, error } = await this.videoApi.updateVideo({
      ...upsertData,
      ...episodeDataOverride,
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

  override fetchSeasons = async () => {
    await super.fetchSeasons()

    this._linkEpisodes()
  }

  override fetchSeason = async (seasonNumber: number) => {
    if (this.hasSeason(seasonNumber)) return this.seasonMap[seasonNumber]

    const season = await super.fetchSeason(seasonNumber)

    if (season) {
      this._linkEpisodes()
    }

    return season
  }

  watchNextEpisode = async () => {
    if (this.nextEpisode) {
      await this.toggleEpisodeWatched(this.nextEpisode)
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

  getIsEpisodeWatched = (episode: TmdbTvEpisode) => {
    const { seasonNumber, episodeNumber } = episode

    return (
      this.getWatchedSeason(seasonNumber).episodes?.[episodeNumber] ??
      this.getIsSeasonWatched(seasonNumber)
    )
  }

  override compareCompletionTo(otherVideo: UserShow | UserMovie) {
    if (!otherVideo.isTv) {
      return super.compareCompletionTo(otherVideo)
    }

    // they cannot watch anymore episodes, can we?
    if (otherVideo.isCompleted) return this.isCompleted ? 0 : 1

    // they can watch more episodes, we cant.
    if (this.isCompleted) return -1

    // they cant watch any epsidoes today, can we?
    if (otherVideo.isLatestEpisodeWatched) return this.isLatestEpisodeWatched ? 0 : 1

    // they can actively watch another episode, can we?
    return this.isLatestEpisodeWatched ? -1 : 0
  }

  get currentBaseEpisode(): TmdbTvEpisode | undefined {
    const seasonNumber = this.lastWatchedSeasonNumber || 1
    const episodeNumber = this.lastWatchedEpisodeNumber || 1

    return _.find(this.seasonMap[seasonNumber]?.episodes, { episodeNumber })
  }

  get nextEpisode() {
    return this.lastWatchedEpisode?.next
  }

  get partiallyWatched() {
    return !_.isEmpty(this.videoInfo?.seasons)
  }

  get lastWatchedEpisodeFromEnd() {
    return this.lastWatchedEpisode
  }

  get isLatestEpisodeWatched() {
    return this.lastEpisodeToAir === this.lastWatchedEpisode
  }

  override get isCompleted() {
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
    return _.min(this.episodeRunTimes) || 0
  }

  override get totalWatchedDurationMinutes() {
    if (this.isCompleted) {
      return this.totalDurationMinutes
    }

    return this.watchedEpisodeCount * this.minEpisodeRunTime
  }

  // override get totalDurationMinutes() {
  //   if (this.tmdbVideo.numberOfEpisodes !== undefined) {
  //     return (this.numberOfEpisodes - this.unWatchableEpisodeCount) * this.minEpisodeRunTime
  //   }
  //
  //   return 0
  // }

  get durationOrSeasons() {
    if (this.isTv) {
      return `${this.seasons?.length} seasons`
    }

    return `${this.totalDurationMinutes} min`
  }
}

const episodeToEpisodeWatchedData = (episode: TmdbTvEpisode | null | undefined) => {
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

export default UserShow
