import { callTmdb } from '@reelist/apis/api'
import _ from 'lodash'
import Video from '@reelist/models/Video'

const getVideoPath = (videoId: string) => {
  const videoIdMatch = videoId.match(/(..)(.*)/)

  if (!videoIdMatch) return null

  const [_videoId, type, id] = videoIdMatch

  const videoType = type === 'mv' ? 'movie' : type

  return `/${videoType}/${id}`
}

export const getDiscoverVideo = (videoId: string) => {
  const path = getVideoPath(videoId)

  if (!path) return null

  return callTmdb(path, {
    append_to_response: 'watch/providers',
  }).then(item => _.get(item, 'data.data') || null)
}

export const getDiscoverVideos = async (videoIds: string[]) => {
  if (!videoIds) return []

  const videos: Array<Video | null> = await Promise.all(
    videoIds.map(videoId => getDiscoverVideo(videoId)),
  )

  return _.compact(videos)
}
