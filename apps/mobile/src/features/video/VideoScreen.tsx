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
import { ReelistScreenFrom } from '~/utils/navigation'
import TabView from '~/components/TabView'
import VideoOverviewTab from './VideoOverviewTab'
import VideoDashboardTab from './VideoDashboardTab'
import LoadingSection from '~/shared/components/LoadingSection'
import { AnyVideoType } from '@reelist/models/Video'

const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500'

const VideoScreen = observer(({ route, navigation }: ReelistScreenFrom<'videoScreen'>) => {
  const { videoStore, auth } = useStore()

  const [video, setVideo] = useState<AnyVideoType | null>(null)
  const [showVideoId, setShowVideoId] = useState(false)

  const imageSource = video?.backdropPath
  const { videoId } = route.params

  useEffect(() => {
    if (!videoId) return

    setVideo(null)

    videoStore.getVideoOrUserVideo(videoId, auth.user.id).then(setVideo)
  }, [videoId])

  const routes = useMemo(() => {
    if (!video) return []

    const tabs = [{ name: 'Overview', render: () => <VideoOverviewTab video={video} /> }]

    if (video.hasUser) {
      tabs.push({
        name: 'Dashboard',
        render: () => <VideoDashboardTab video={video} navigation={navigation} />,
      })
    }

    return tabs
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
          <Pressable flex={1} onPress={navigation.goBack}>
            <ArrowBackIcon />
          </Pressable>

          <Text flexShrink={1} numberOfLines={2} adjustsFontSizeToFit textAlign="center">
            {video.videoName}
          </Text>

          <ThreeDotsIcon flex={1} />
        </Row>
      </View>

      <TabView routes={routes} showTabBar={video.hasUser} />
    </ScrollView>
  )
})

export default VideoScreen
