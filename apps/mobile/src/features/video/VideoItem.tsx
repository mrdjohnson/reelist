import React from 'react'
import { observer } from 'mobx-react-lite'
import Video from '@reelist/models/Video'
import { useStore } from '~/hooks/useStore'
import { useReelistNavigation } from '~/utils/navigation'
import { Column, IPressableProps, Pressable, Row, Skeleton, Text, View } from 'native-base'
import VideoImage from './VideoImage'
import { GestureResponderEvent } from 'react-native'

type VideoItemProps = IPressableProps & {
  video: Video | null | undefined
  isTile?: boolean
}

const VideoItem = observer(({ video, isTile = false, onPress, ...props }: VideoItemProps) => {
  const { appState, videoStore } = useStore()
  const navigation = useReelistNavigation()

  if (!video) return null

  const name = video.name || video.title

  const goToMediaPage = (event: GestureResponderEvent) => {
    onPress && onPress(event)

    videoStore.setCurrentVideoId(video.videoId)
    navigation.navigate('videoScreen')
  }

  if (isTile) {
    return (
      <Pressable
        onPress={goToMediaPage}
        onLongPress={() => appState.setActionSheetVideo(video)}
        {...props}
      >
        <VideoImage video={video} />
      </Pressable>
    )
  }

  return (
    <Pressable
      flexDirection="row"
      margin="10px"
      onPress={goToMediaPage}
      onLongPress={() => appState.setActionSheetVideo(video)}
      {...props}
    >
      <View flexShrink={1}>
        <VideoImage
          video={video}
          containerProps={{ marginRight: '8px', maxHeight: '120px' }}
          backgroundColor="black"
        />
      </View>

      <View flex={1} justifyContent="space-between">
        <Column>
          <Text fontSize="lg" color={'black'} adjustsFontSizeToFit numberOfLines={1}>
            {name}
          </Text>

          <Text fontSize="sm" color="light.500" adjustsFontSizeToFit numberOfLines={1}>
            {video.originalName}

            {video.originalName && video.videoReleaseDate && (
              <Text color="light.700">{'  |  '}</Text>
            )}

            {video.videoReleaseDate.format("MMM Do 'YY")}
          </Text>
        </Column>

        <Text numberOfLines={3} ellipsizeMode="tail">
          {video.overview}
        </Text>
      </View>
    </Pressable>
  )
})

export const videoItemSkeleton = (
  <Row margin="10px">
    <Column marginRight="8px">
      <Skeleton minWidth="80px" height="110px" rounded="sm" endColor="light.300" flexShrink={1} />
    </Column>

    <Column flex={1}>
      <Skeleton.Text size="sm" endColor="light.600" lines={4} paddingY="4px" />
    </Column>
  </Row>
)

export default VideoItem
