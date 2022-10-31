import { Row, View } from 'native-base'
import React from 'react'
import TrackedVideoItem from '~/features/video/TrackedVideoItem'
import VideoItem from '~/features/video/VideoItem'
import Video from '~/models/Video'

export type VideoChunk = [Video, Video?, Video?]

type ThreeTileRowProps = {
  videos: VideoChunk
  isTracked?: boolean
}

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
