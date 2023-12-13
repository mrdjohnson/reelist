import { isObservable, makeAutoObservable, makeObservable } from 'mobx'
import { sendNotifications, UpdateType } from '@reelist/apis/api'
import { humanizedDuration } from '@reelist/utils/humanizedDuration'
import VideoStore from './VideoStore'
import VideoApi from '@reelist/apis/VideoApi'
import { VideoInfoType, VideoTableType } from 'libs/interfaces/src/lib/tables/VideoTable'
import {
  TmdbBaseVideoType,
  TmdbVideoByIdResponse,
  TmdbVideoByIdType,
} from '@reelist/interfaces/tmdb/TmdbVideoByIdType'
import inversionContainer from '@reelist/models/inversionContainer'
import { SupabaseClient } from '@supabase/supabase-js'
import {
  TmdbShowEpisodeResponseType,
  TmdbShowSeasonPartialResponseType,
  TmdbTvSeason,
} from '@reelist/interfaces/tmdb/TmdbShowResponse'
import User from '@reelist/models/User'
import { classFromProps } from '@reelist/utils/ClassHelper'
import { TmdbMovieByIdResponse } from '@reelist/interfaces/tmdb/TmdbMovieResponse'
import UserShow from '@reelist/models/UserShow'
import { TmdbVideoType } from '@reelist/models/Video'

abstract class AbstractUserVideo extends classFromProps<TmdbBaseVideoType>() {
  tracked = false
  videoInfo: VideoInfoType = makeObservable({})
  serverId: string | undefined
  allowInHistory = true

  abstract override isTv: boolean

  protected videoStore: VideoStore = inversionContainer.get<VideoStore>(VideoStore)
  protected videoApi: VideoApi

  constructor(
    public tmdbVideo: TmdbVideoType,
    protected user: User,
    userVideoData?: VideoTableType,
  ) {
    super(tmdbVideo)

    const supabase: SupabaseClient = inversionContainer.get<SupabaseClient>(SupabaseClient)
    this.videoApi = new VideoApi('videos', supabase)

    this._assignFromVideoTable(userVideoData)

    makeObservable(this)
  }

  get userId() {
    return this.user.id
  }

  _assignFromVideoTable(videoTable?: VideoTableType) {
    // if we already tried to get the data and nothing was there
    if (!videoTable) return

    if (!isObservable(videoTable)) {
      makeAutoObservable(videoTable)
    }

    this.serverId = videoTable.id
    this.videoInfo = videoTable.video_info || {}
    this.tracked = videoTable.tracked
    this.allowInHistory = videoTable.allow_in_history
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
    let nextIsWatched = isWatchedOverride ?? !this.isWatched

    return this.updateWatched('toggle watched', {
      video_info: { watched: nextIsWatched },
    })
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

  get isWatched() {
    return !!this.videoInfo?.watched
  }

  // this should be based on watched episode count of season and or season status... or just is watched if its a movie
  get isCompleted() {
    return this.isWatched
  }

  get totalWatchedDurationMinutes() {
    if (this.isCompleted) {
      return this.totalDurationMinutes
    }

    return 0
  }

  get totalWatchedDuration() {
    return humanizedDuration(this.totalWatchedDurationMinutes)
  }

  get totalDuration() {
    return humanizedDuration(this.totalDurationMinutes)
  }

  compareCompletionTo(otherVideo: AbstractUserVideo) {
    const [LESS_COMPLETE, EQUAL_TO, MORE_COMPLETE] = [-1, 0, 1]

    if (this.isCompleted === otherVideo.isCompleted) return EQUAL_TO // I am equal to

    if (this.isCompleted) return MORE_COMPLETE // I am more completed

    return LESS_COMPLETE // I am less complete
  }
}

export default AbstractUserVideo
