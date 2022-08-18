import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Button,
  Input,
  Pressable,
  ScrollView,
  SectionList,
  Text,
  View,
  Icon,
  Center,
  Checkbox,
  Hidden,
  FlatList,
  Actionsheet,
  HStack,
  Switch,
  Row,
} from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '~/hooks/useStore'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import VideoList from '~/models/VideoList'
import {
  BackHandler,
  NativeSyntheticEvent,
  SectionListData,
  TextInputChangeEventData,
  TextInputSubmitEditingEventData,
} from 'react-native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Video, { TvEpisode, TvSeason } from '~/models/Video'
import { callTmdb } from '~/api/api'
import _ from 'lodash'
import VideoItem from '~/features/video/VideoItem'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

const VideoListListItem = observer(
  ({
    videoList,
    currentVideoListId,
    onVideoListPress,
  }: {
    videoList: VideoList
    currentVideoListId: string | undefined
    onVideoListPress: (videoList: VideoList) => void
  }) => {
    return (
      <Pressable
        onPress={() => onVideoListPress(videoList)}
        backgroundColor={currentVideoListId === videoList.id ? 'amber.200' : undefined}
        flexDirection="row"
        alignItems="center"
      >
        <Icon name="playlist-star" color="#4F8EF7" size={30} />

        <Text margin={'10px'} fontSize="md" height="auto">
          {videoList.name}
        </Text>
      </Pressable>
    )
  },
)

const IndeterminateIcon = <Icon as={<MaterialIcons name="indeterminate-check-box" />} />

const CAN_GO_BACK = false
const CANNOT_GO_BACK = true

const VideoScreen = observer(({ navigation }: NativeStackScreenProps<any>) => {
  const { auth, videoStore, videoListStore } = useStore()
  const videoId = videoStore.currentVideoId
  const [video, setVideo] = useState<Video | null>(null)
  const [season, setSeason] = useState<TvSeason | null>(null)
  const [episode, setEpisode] = useState<TvEpisode | null>(null)
  const [manageLists, setManageLists] = useState<true | null>(null)
  const [minimizeVideoOverview, setMinimizeVideoOverview] = useState(true)

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

      if (episode) {
        setEpisode(null)

        return CANNOT_GO_BACK
      }

      if (manageLists) {
        setManageLists(null)

        return CANNOT_GO_BACK
      }

      return CAN_GO_BACK
    }

    BackHandler.addEventListener('hardwareBackPress', onBackButtonPressed)

    return () => BackHandler.removeEventListener('hardwareBackPress', onBackButtonPressed)
  }, [season, episode, manageLists])

  if (!video || !videoId) {
    return <Text>Loading, there may have been an error for: {videoId}</Text>
  }

  const name = video.name || video.title

  return (
    <View flex={1} backgroundColor="white" display="flex">
      <Center padding="10px" paddingTop="0">
        <Text fontSize="2xl">{name + ': ' + video.videoId}</Text>

        <Pressable onPress={() => setMinimizeVideoOverview(!minimizeVideoOverview)}>
          <Text numberOfLines={minimizeVideoOverview ? 3 : 0}>{video.overview}</Text>
        </Pressable>
      </Center>

      {manageLists ? (
        <View flex={1} padding="10px" paddingTop="0">
          <Center>
            <Text>Manage Lists: </Text>

            <Button onPress={() => setManageLists(null)}>Go Back</Button>
          </Center>

          <ScrollView>
            {videoListStore.adminVideoLists.map(videoList => (
              <View flexDirection="row" marginTop="10px" key={videoList.id}>
                <Text flex={1} fontSize="lg">
                  {videoList.name}
                </Text>

                <Checkbox
                  value={videoList.id}
                  isChecked={videoList.includes(video)}
                  onChange={() => videoList.addOrRemoveVideo(video)}
                  accessibilityLabel={'VideoList: ' + videoList.name}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        <>
          <Button margin="10px" marginBottom="0px" onPress={() => setManageLists(true)}>
            Manage Lists
          </Button>

          <Row margin="10px" justifyContent="space-between">
            <Row>
              <Text marginRight="10px">
                You are on:
                {'\n'}
                Season:{video.currentSeason} Episode: {video.currentEpisode}
              </Text>

              <Button onPress={video.watchNextEpisode}>
                <Icon as={<MaterialCommunityIcons name="eye-plus" />} color="white" />
              </Button>
            </Row>

            <Button size="sm" onPress={video.backfillWatched}>
              Backfill?
            </Button>
          </Row>

          <HStack alignItems="center" space="8px" margin="10px">
            <Text>Show in Tracked</Text>

            <Switch size="sm" value={video.tracked} onChange={video.toggleTracked} />
          </HStack>
        </>
      )}

      <ScrollView display={(season || manageLists) && 'none'}>
        <View paddingRight="10px" paddingLeft="10px">
          <View flexDirection="row" justifyContent="space-between" borderBottomWidth={1}>
            <Text fontSize="lg">Seasons: </Text>

            <Checkbox
              size="sm"
              value={video.id}
              isChecked={video.watched}
              onChange={video.toggleWatched}
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
                  video.getSeasonWatched(season.seasonNumber) ||
                  video.getSeasonPartiallyWatched(season.seasonNumber)
                }
                onChange={() => video.toggleSeasonWatched(season.seasonNumber)}
                accessibilityLabel={'Season ' + season.seasonNumber}
                icon={
                  video.getSeasonPartiallyWatched(season.seasonNumber)
                    ? IndeterminateIcon
                    : undefined
                }
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {season && (
        <View paddingLeft="10px" paddingRight="10px" flex={1}>
          <View flexDirection="row" borderBottomWidth={1} marginBottom="10px" alignItems="center">
            <Button onPress={() => setSeason(null)} marginRight="8px" size="sm">
              Go Back
            </Button>

            <Text fontSize="lg" flex={1}>
              {season.name}
            </Text>

            <Checkbox
              value={season.seasonNumber + ''}
              isChecked={
                video.getSeasonWatched(season.seasonNumber) ||
                video.getSeasonPartiallyWatched(season.seasonNumber)
              }
              onChange={() => video.toggleSeasonWatched(season.seasonNumber)}
              accessibilityLabel={'Season ' + season.seasonNumber}
              icon={
                video.getSeasonPartiallyWatched(season.seasonNumber) ? IndeterminateIcon : undefined
              }
            />
          </View>

          <FlatList
            data={season.episodes!}
            keyExtractor={item => item.id}
            renderItem={({ item: episode }) => (
              <View key={episode.id} flexDirection="row" alignItems="center" marginBottom={2}>
                <Pressable flex={1} onPress={() => setEpisode(episode)}>
                  <Text fontSize="sm" color="gray.400">
                    Episode {episode.episodeNumber}
                  </Text>

                  <Text fontSize="md">{episode.name.trim()}</Text>
                </Pressable>

                <Checkbox
                  value={season.seasonNumber + ''}
                  isChecked={video.getEpisodeWatched(episode)}
                  onChange={() => video.toggleEpisodeWatched(episode)}
                  accessibilityLabel={'Episode ' + episode.episodeNumber}
                  size="md"
                />
              </View>
            )}
          />
        </View>
      )}

      {/* hidden */}

      <Actionsheet isOpen={!!episode} onClose={() => setEpisode(null)}>
        {episode && (
          <View backgroundColor={'white'} borderTopRadius={12} padding="10px">
            <Center>
              <Text fontSize="xl">{episode.name}</Text>

              <Text>{episode.overview}</Text>
            </Center>
          </View>
        )}
      </Actionsheet>
    </View>
  )
})

export default VideoScreen
