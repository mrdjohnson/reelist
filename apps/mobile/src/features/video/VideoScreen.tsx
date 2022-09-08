import React, { useEffect, useState } from 'react'
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  Icon,
  Center,
  Checkbox,
  Row,
  Switch,
  Column,
  Box,
  AspectRatio,
  Flex,
} from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '~/hooks/useStore'
import { BackHandler } from 'react-native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Video, { TvSeason } from '~/models/Video'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import moment from 'moment'
import { ReelistScreen } from '~/utils/navigation'
import VideoSeasonSection from './VideoSeasonSection'
import VideoListManagementSection from './VideoListManagementSection'
import ToggleButton from '~/shared/components/ToggleButton'
import AppButton from '~/shared/components/AppButton'
import ActionButton from '~/shared/components/ActionButton'

const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500'
const IndeterminateIcon = <Icon as={<MaterialIcons name="indeterminate-check-box" />} />

const CAN_GO_BACK = false
const CANNOT_GO_BACK = true

const VideoScreen = observer(({ navigation }: ReelistScreen) => {
  const { videoStore } = useStore()
  const videoId = videoStore.currentVideoId
  const [video, setVideo] = useState<Video | null>(null)
  const [manageLists, setManageLists] = useState(false)
  const [minimizeVideoOverview, setMinimizeVideoOverview] = useState(true)
  const [showVideoId, setShowVideoId] = useState(false)

  const season = video?.selectedSeason

  const setSeason = (nextSeason: TvSeason | null) => {
    if (!video) return

    video.selectedSeason = nextSeason
  }

  useEffect(() => {
    if (!videoId) return

    videoStore.getVideo(videoId).then(setVideo)
  }, [videoId])

  useEffect(() => {
    if (!video) return

    video.fetchSeasons()
  }, [video])

  useEffect(() => {
    if (!season || !videoId) return

    video?.fetchSeason(season.seasonNumber).then(setSeason)
  }, [season?.id])

  useEffect(() => {
    const onBackButtonPressed = () => {
      if (season) {
        setSeason(null)

        return CANNOT_GO_BACK
      }

      if (manageLists) {
        setManageLists(false)

        return CANNOT_GO_BACK
      }

      return CAN_GO_BACK
    }

    BackHandler.addEventListener('hardwareBackPress', onBackButtonPressed)

    return () => BackHandler.removeEventListener('hardwareBackPress', onBackButtonPressed)
  }, [season, manageLists])

  if (!video || !videoId) {
    return <Text>Loading, there may have been an error for: {videoId}</Text>
  }

  let videoStatus

  if (video.isCompleted) {
    videoStatus = <Text>Completed</Text>
  } else if (video.isLatestEpisodeWatched) {
    videoStatus = (
      <Column>
        <Text>Currently Live</Text>

        {video.nextEpisodeToAir && (
          <Text>
            {/* Friday, Aug 19th 22 */}
            Next Air Date:
            {moment(video.nextEpisodeToAir.airDate).format(' dddd, MMM Do')}
          </Text>
        )}
      </Column>
    )
  } else {
    videoStatus = (
      <Row alignItems="center" justifyContent="space-between" minWidth="50%">
        <Text marginRight="10px">
          Season:{video.nextEpisode?.seasonNumber} Episode: {video.nextEpisode?.episodeNumber}
        </Text>

        <AppButton
          onPress={video.watchNextEpisode}
          icon={<MaterialCommunityIcons name="eye-plus" />}
        />
      </Row>
    )
  }

  const imageSource = video.backdropPath

  return (
    <View flex={1} display="flex">
      {imageSource && (
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
      )}

      <Center padding="10px" paddingTop="0">
        <Pressable onPress={() => setMinimizeVideoOverview(!minimizeVideoOverview)}>
          <Text numberOfLines={minimizeVideoOverview ? 3 : 0}>{video.overview}</Text>
        </Pressable>
      </Center>

      {manageLists ? (
        <VideoListManagementSection
          video={video}
          closeManageListsSection={() => setManageLists(false)}
        />
      ) : (
        <>
          <AppButton margin="10px" marginBottom="0px" onPress={() => setManageLists(true)}>
            Manage Lists
          </AppButton>

          {video.isMovie || (
            <Row margin="10px" justifyContent="space-between">
              {videoStatus}

              <ActionButton size="sm" onPress={() => video.backfillWatched()}>
                Backfill?
              </ActionButton>
            </Row>
          )}

          <Row alignItems="center" space="8px" margin="10px">
            <ToggleButton
              size="sm"
              minWidth="50%"
              active={video.tracked}
              icon={<MaterialCommunityIcons name="bookmark-plus" />}
              activeIcon={<MaterialCommunityIcons name="bookmark-check" />}
              content="Add to Bookmarks"
              activeContent="Added to Bookmarks"
              onPress={() => video.toggleTracked()}
            />
          </Row>
        </>
      )}

      {video.isMovie && (
        <Flex flexDirection="column-reverse" flex={1}>
          <ToggleButton
            margin="10px"
            active={video.isWatched}
            color="blue.500"
            activeColor="gray.600"
            icon={<MaterialCommunityIcons name="eye-plus" />}
            activeIcon={<MaterialCommunityIcons name="eye-check" />}
            content="Watch"
            activeContent="Watched"
            onPress={() => video.toggleWatched()}
          />
        </Flex>
      )}

      {!season && !manageLists && video.isTv && (
        <ScrollView>
          <View paddingRight="10px" paddingLeft="10px">
            <View flexDirection="row" justifyContent="space-between" borderBottomWidth={1}>
              <Text fontSize="lg">Seasons: </Text>

              <Checkbox
                size="sm"
                value={video.id}
                isChecked={video.isWatched}
                onChange={() => video.toggleWatched()}
                accessibilityLabel={video.name}
              />
            </View>

            {video.seasons?.map(season => (
              <View
                key={season.id}
                flexDirection="row"
                alignItems="center"
                marginBottom="10px"
                marginTop="10px"
              >
                <Pressable onPress={() => setSeason(season)} flex={1}>
                  <Text fontSize="md">{season.name}</Text>
                </Pressable>

                <Checkbox
                  value={season.seasonNumber + ''}
                  isChecked={
                    video.getIsSeasonWatched(season.seasonNumber) ||
                    video.getIsSeasonPartiallyWatched(season.seasonNumber)
                  }
                  onChange={() => video.toggleSeasonWatched(season.seasonNumber)}
                  accessibilityLabel={'Season ' + season.seasonNumber}
                  icon={
                    video.getIsSeasonPartiallyWatched(season.seasonNumber)
                      ? IndeterminateIcon
                      : undefined
                  }
                />
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {season && <VideoSeasonSection video={video} season={season} />}
    </View>
  )
})

export default VideoScreen
