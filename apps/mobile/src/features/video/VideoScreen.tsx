import React, { useEffect, useMemo, useState } from 'react'
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  Row,
  Box,
  AspectRatio,
  ArrowBackIcon,
  ThreeDotsIcon,
} from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '@reelist/utils/hooks/useStore'
import Video from '@reelist/models/Video'
import { ReelistScreenFrom } from '~/utils/navigation'
import TabView from '@reelist/components/TabView'
import _ from 'lodash'
import VideoOverviewTab from './VideoOverviewTab'
import VideoDashboardTab from './VideoDashboardTab'
import { ActivityIndicator } from 'react-native'
import LoadingSection from '~/shared/components/LoadingSection'

const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500'

const VideoScreen = observer(({ route, navigation }: ReelistScreenFrom<'videoScreen'>) => {
  const { videoStore } = useStore()

  const [video, setVideo] = useState<Video | null>(null)
  const [showVideoId, setShowVideoId] = useState(false)

  const imageSource = video?.backdropPath
  const { videoId } = route.params

  useEffect(() => {
    if (!videoId) return

    setVideo(null)

    videoStore.getVideo(videoId).then(setVideo)
  }, [videoId])

  useEffect(() => {
    if (!video) return

    video.fetchSeasons()
  }, [video])

  const routes = useMemo(() => {
    if (!video) return []

    return [
      { name: 'Overview', render: () => <VideoOverviewTab video={video} /> },
      {
        name: 'Dashboard',
        render: () => <VideoDashboardTab video={video} navigation={navigation} />,
      },
    ]
  }, [video])

  if (!video) {
    return <LoadingSection />
  }

  return (
    <ScrollView
      stickyHeaderIndices={[imageSource ? 1 : 0]}
      contentContainerStyle={{ display: 'flex' }}
      display="flex"
    >
      {imageSource && (
        <View zIndex={100} marginBottom="-45px" position="relative">
          <Pressable
            zIndex={1}
            top="10px"
            left="10px"
            onPress={navigation.goBack}
            position="absolute"
          >
            <ArrowBackIcon color="white" />
          </Pressable>

          <Box maxHeight="500px">
            <AspectRatio
              width="100%"
              ratio={{
                base: 16 / 9,
              }}
            >
              <Image
                source={{ uri: IMAGE_PATH + imageSource }}
                alt={imageSource}
                resizeMode="contain"
                backgroundColor="red"
              />
            </AspectRatio>

            <Box position="absolute" bottom="0" width="100%" paddingX="10px" zIndex={1}>
              <Pressable onLongPress={() => setShowVideoId(!showVideoId)}>
                <Text
                  fontSize="2xl"
                  numberOfLines={1}
                  shadow="2"
                  color="white"
                  style={{ textShadowColor: 'black', textShadowRadius: 5 }}
                  adjustsFontSizeToFit
                >
                  {video.videoName}
                </Text>

                {showVideoId && (
                  <View backgroundColor="black">
                    <Text color="white" fontSize="sm" textAlign="center">
                      {video.videoId}
                    </Text>
                  </View>
                )}
              </Pressable>
            </Box>
          </Box>
        </View>
      )}

      {/* hidden bar under header */}
      <View backgroundColor="white">
        <Row
          top="0px"
          height="45px"
          justifyContent="space-between"
          alignItems="center"
          paddingX="10px"
          backgroundColor="light.300:alpha.40"
          space={2}
          width="100%"
          display="flex"
        >
          <ArrowBackIcon flex={1} />

          <Text flexShrink={1} numberOfLines={2} adjustsFontSizeToFit textAlign="center">
            {video.videoName}
          </Text>

          <ThreeDotsIcon flex={1} />
        </Row>
      </View>

      <TabView routes={routes} />
    </ScrollView>
  )
})

export default VideoScreen
