import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'inversify'
import { settleAll } from '@reelist/utils/settleAll'
import { TmdbTvSeason } from '@reelist/interfaces/tmdb/TmdbShowResponse'
import { TmdbVideoType } from '@reelist/models/Video'
import { TmdbClient } from '@reelist/utils/tmdbHelpers/TmdbClient'

@injectable()
class VideoStore {
  // TODO: do we want separate caches for partials and fulls? do we always need the full when we call for it?
  // for partial video modals, do we have enough information?
  tmdbJsonByVideoId: Record<string, TmdbVideoType | null> = {}
  videoSeasonMapByVideoId: Record<string, Record<number, TmdbTvSeason | null>> = {}
  userVideoById: Record<string, Record<string, unknown>> = {}

  constructor() {
    makeAutoObservable(this)
  }

  getVideoPath = (videoId: string, seasonNumber?: number) => {
    const videoIdMatch = videoId.match(/(..)(.*)/)

    if (!videoIdMatch) return null

    const [_videoId, type, id] = videoIdMatch

    const videoType = type === 'mv' ? 'movie' : type

    let path = `/${videoType}/${id}`

    if (seasonNumber) {
      path += '/season/' + seasonNumber
    }

    return path
  }

  getVideos = async (videoIds: string[] | undefined) => {
    if (!videoIds) return []

    const videos = await settleAll(videoIds.map(videoId => this.getVideo(videoId)))

    return _.compact(videos)
  }

  getVideo = async (videoId: string, seasonNumber?: number | null) => {
    if (this.tmdbJsonByVideoId[videoId]) {
      const video = this.tmdbJsonByVideoId[videoId]
      const number = seasonNumber ?? 1

      if (video?.isTv && !video.hasSeason(number)) {
        await video.fetchSeason(number)
      }

      return video
    }

    let seasonsStringToRequest = ',season/1'

    if (seasonNumber) {
      seasonsStringToRequest += `,season/${seasonNumber},season/${seasonNumber + 1}`
    }

    const video = await TmdbClient.getVideoById(videoId, seasonsStringToRequest)

    this.tmdbJsonByVideoId[videoId] = video

    return video
  }
}

export default VideoStore
