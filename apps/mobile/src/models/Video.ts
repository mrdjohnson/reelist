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
}

export type TvSeason = {
  airDate: string
  episodeCount: number
  id: string
  name: string
  overview: string
  posterPath: string
  seasonNumber: number
  episodes?: TvEpisode[]
}

type WatchedSeasonJson = {
  watched?: boolean
  episodes?: Record<string, boolean>
}

export type VideoInfoType = null | {
  watched?: boolean
  seasons?: Record<string, WatchedSeasonJson>
}

export type VideoTableType = {
  id: string
  video_id: string
  tracked: boolean
  current_season: number
  current_episode: number
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

  tracked = false
  videoInfo: VideoInfoType = null
  serverId: string | undefined

  storeAuth: Auth

  currentSeason = -1
  currentEpisode = 0
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
    this.videoInfo = videoTable.video_info
    this.tracked = videoTable.tracked
    this.currentSeason = videoTable.current_season
    this.currentEpisode = videoTable.current_episode
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

  toggleWatched = async () => {
    const nextWatched = !this.watched || this.partiallyWatched

    await this.updateWatched({
      id: this.serverId,
      video_id: this.videoId,
      video_info: { ...this.videoInfo, watched: nextWatched },
      // todo, if unmarking a video... what should happen here?
      current_season: 0,
      current_episode: 0,
    })
  }

  toggleSeasonWatched = async (seasonNumber: number) => {
    const seasonWatched = this.getSeasonWatched(seasonNumber)
    const seasonPartiallyWatched = this.getSeasonPartiallyWatched(seasonNumber)

    let nextSeasonWatched = !seasonWatched

    if (seasonPartiallyWatched) {
      nextSeasonWatched = true
    }

    const seasons = {
      ...this.videoInfo?.seasons,
      // watch or unwatch all episodes
      [seasonNumber]: { watched: nextSeasonWatched },
    }

    await this.updateWatched({
      id: this.serverId,
      video_id: this.videoId,
      video_info: { ...this.videoInfo, seasons },
      // todo, if unmarking a season... what should happen here?
      current_season: seasonNumber + 1,
      current_episode: 1,
    })
  }

  toggleEpisodeWatched = async (episode: TvEpisode) => {
    const { seasonNumber, episodeNumber } = episode

    let season = { ...this.getSeason(seasonNumber) }
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
      season = { watched: true }
    } else if (getAllEpisodesWatched(false)) {
      season = { watched: false }
    }

    const seasons = {
      ...this.videoInfo?.seasons,
      [seasonNumber]: season,
    }

    await this.updateWatched({
      id: this.serverId,
      video_id: this.videoId,
      video_info: { ...this.videoInfo, seasons },
      // todo, if unmarking an episode... what should happen here?
      current_season: episode.seasonNumber,
      current_episode: episode.episodeNumber + 1,
    })
  }

  updateWatched = async (upsertData: Partial<VideoTableType>) => {
    const { data: videoJson, error } = await supabase
      .from<VideoTableType>('videos')
      .upsert(upsertData)
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

  getEpisodeWatched = (episode: TvEpisode) => {
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

export type VideoJsonType = Decamelized<Video>

export default Video
