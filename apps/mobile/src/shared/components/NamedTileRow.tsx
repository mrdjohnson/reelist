import { AspectRatio, Row, View, Text, Column, ScrollView, Pressable } from 'native-base'
import React, { useMemo, useState } from 'react'
import Video from '~/models/Video'
import _ from 'lodash'
import VideoImage from '~/features/video/VideoImage'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { useReelistNavigation } from '~/utils/navigation'
import { useStore } from '~/hooks/useStore'
import LinkButton from '~/shared/components/LinkButton'
import { IViewProps } from 'native-base/lib/typescript/components/basic/View/types'
import useAsyncState from '~/hooks/useAsyncState'

type NamedTileRowProps = IViewProps & {
  videos?: Video[]
  label: string
  size?: number
  showMoreText?: string
  onShowMore?: () => void
  loadVideos?: () => Promise<Video[]>
  userId?: string
}

const NamedTileRow = ({
  label,
  videos,
  size = 10,
  showMoreText,
  onShowMore,
  loadVideos,
  userId,
  ...props
}: NamedTileRowProps) => {
  const { appState, videoStore } = useStore()

  const navigation = useReelistNavigation()
  const [localVideos] = useAsyncState([], loadVideos)

  const displayVideos = useMemo(() => {
    return localVideos || videos
  }, [localVideos, videos])

  if (_.isEmpty(displayVideos)) return null

  const navigateToVideoScreen = (video: Video) => {
    videoStore.setCurrentVideoId(video.videoId)
    navigation.navigate('videoScreen')
  }

  const handleShowMore = () => {
    if (onShowMore) {
      onShowMore()
    } else if (loadVideos) {
      navigation.navigate('videosModal', {
        title: label,
        loadVideos,
        userId,
      })
    }
  }

  return (
    <Column marginX="10px" paddingBottom="10px" {...props}>
      <Text paddingBottom="4px" fontSize="md">
        {label}
      </Text>

      <ScrollView horizontal>
        <Row space="8px" flex={1} paddingLeft="10px">
          {_.take(displayVideos, size).map(video => (
            <Pressable
              key={video.videoId}
              onPress={() => navigateToVideoScreen(video)}
              onLongPress={() => appState.setActionSheetVideo(video)}
            >
              <VideoImage video={video} containerProps={{ height: '120px', width: 'auto' }} />
            </Pressable>
          ))}

          <Pressable backgroundColor="blue.300:alpha.20" rounded="sm" onPress={handleShowMore}>
            <AspectRatio ratio={{ base: 2 / 3 }} width="100%" height="120px">
              <View textAlign="center" alignItems="center" justifyContent="center">
                <MaterialCommunityIcons
                  size={30}
                  name="chevron-double-right"
                  style={{ color: 'black', marginVertical: 'auto' }}
                />
              </View>
            </AspectRatio>
          </Pressable>
        </Row>
      </ScrollView>

      {showMoreText && (
        <LinkButton alignSelf="flex-end" onPress={handleShowMore}>
          {showMoreText}
        </LinkButton>
      )}
    </Column>
  )
}

export default NamedTileRow
