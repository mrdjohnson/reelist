import { Row, View } from 'native-base'
import React from 'react'
import TrackedVideoItem from '~/features/video/TrackedVideoItem'
import VideoItem from '~/features/video/VideoItem'
import { TmdbVideoPartialType } from '@reelist/interfaces/tmdb/TmdbVideoPartialType'
import { UserVideoType } from '@reelist/models/UserVideo'

export type VideoChunk<T = TmdbVideoPartialType> = [T, T?, T?]

type PartialTypeArray = {
  videos: VideoChunk<TmdbVideoPartialType>
  isTracked?: false
}

type FullTypeArray = {
  videos: VideoChunk<UserVideoType>
  isTracked: true
}

type ThreeTileRowProps = PartialTypeArray | FullTypeArray

const ThreeTileRow = ({
  videos: [video1, video2, video3],
  isTracked = false,
}: ThreeTileRowProps) => {
  const VideoComponent = isTracked ? TrackedVideoItem : VideoItem

  return (
    <Row space={2} justifyContent="space-between" paddingX="10px" paddingBottom={2}>
      <View flex={1}>
        <VideoComponent video={video1} isTile />
      </View>

      <View flex={1}>
        <VideoComponent video={video2} isTile />
      </View>

      <View flex={1}>
        <VideoComponent video={video3} isTile />
      </View>
    </Row>
  )
}

export default ThreeTileRow
