import React, { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  Icon,
  Center,
  Checkbox,
  Actionsheet,
  HStack,
  Switch,
  Row,
  Column,
  Box,
  AspectRatio,
  Flex,
} from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '~/hooks/useStore'
import { BackHandler } from 'react-native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Video, { TvEpisode, TvSeason } from '~/models/Video'
import _ from 'lodash'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import moment from 'moment'
import { ReelistScreen } from '~/utils/navigation'

const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500'
const IndeterminateIcon = <Icon as={<MaterialIcons name="indeterminate-check-box" />} />

const CAN_GO_BACK = false
const CANNOT_GO_BACK = true

const ascendingSort = (episodeA: TvEpisode, episodeB: TvEpisode) =>
  episodeA.episodeNumber - episodeB.episodeNumber
const descendingSort = (episodeB: TvEpisode, episodeA: TvEpisode) =>
  episodeA.episodeNumber - episodeB.episodeNumber

const VideoScreen = observer(({ navigation }: ReelistScreen) => {
  const { auth, videoStore, videoListStore } = useStore()
  const videoId = videoStore.currentVideoId
  const [video, setVideo] = useState<Video | null>(null)
  const [season, setSeason] = useState<TvSeason | null>(null)
  const [episode, setEpisode] = useState<TvEpisode | null>(null)
  const [manageLists, setManageLists] = useState<true | null>(null)
  const [minimizeVideoOverview, setMinimizeVideoOverview] = useState(true)
  const [ascendingOrder, setAscendingOrder] = useState<boolean>(true)
  const [hideFutureEpisodes, setHideFutureEpisodes] = useState(true)
  const [showVideoId, setShowVideoId] = useState(false)

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

  const episodes: TvEpisode[] | undefined = useMemo(() => {
    if (!season?.episodes || !video) return

    let episodeChain = _.chain(season.episodes)

    if (hideFutureEpisodes) {
      episodeChain = episodeChain.filter(episode => moment(episode.airDate).isBefore())
    }

    episodeChain = episodeChain.sort(ascendingOrder ? ascendingSort : descendingSort)

    return episodeChain.value()
  }, [season?.episodes, ascendingOrder, hideFutureEpisodes])

  if (!video || !videoId) {
    return <Text>Loading, there may have been an error for: {videoId}</Text>
  }

  const renderEpisode = (episode: TvEpisode) => {
    const aired = moment(episode.airDate).isBefore()

    return (
      <View
        key={episode.id}
        flexDirection="row"
        alignItems="center"
        marginBottom={2}
        opacity={aired ? '100' : '50'}
      >
        <Pressable flex={1} onPress={() => setEpisode(episode)} disabled={!aired}>
          <Text fontSize="sm" color="gray.400">
            Episode {episode.episodeNumber}
          </Text>

          <Text fontSize="md">{episode.name}</Text>
        </Pressable>

        <Checkbox
          value={season?.seasonNumber + ''}
          isChecked={video.getIsEpisodeWatched(episode)}
          onChange={() => video.toggleEpisodeWatched(episode)}
          accessibilityLabel={'Episode ' + episode.episodeNumber}
          size="md"
        />
      </View>
    )
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
      <Row alignItems="center">
        <Text marginRight="10px">
          Season:{video.nextEpisode?.seasonNumber} Episode: {video.nextEpisode?.episodeNumber}
        </Text>

        <Button onPress={video.watchNextEpisode}>
          <Icon as={<MaterialCommunityIcons name="eye-plus" />} color="white" />
        </Button>
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
              rounded="md"
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

          {video.isMovie || (
            <Row margin="10px" justifyContent="space-between">
              {videoStatus}

              <Button size="sm" onPress={() => video.backfillWatched()}>
                Backfill?
              </Button>
            </Row>
          )}

          <HStack alignItems="center" space="8px" margin="10px">
            <Text>Show in Tracked</Text>

            <Switch size="sm" value={video.tracked} onChange={video.toggleTracked} />
          </HStack>
        </>
      )}

      {video.isMovie && (
        <Flex flexDirection="column-reverse" flex={1}>
          {video.isWatched ? (
            <Button
              margin="10px"
              variant="outline"
              borderColor="gray.600"
              _text={{ color: 'gray.600' }}
              color="gray.600"
              colorScheme="gray.600"
              endIcon={<Icon as={<MaterialCommunityIcons name="eye-check" />} color="gray.600" />}
              onPress={() => video.toggleWatched()}
            >
              Watched
            </Button>
          ) : (
            <Button
              margin="10px"
              variant="outline"
              borderColor="blue.600"
              _text={{ color: 'blue.600' }}
              color="blue.600"
              colorScheme="blue.600"
              endIcon={<Icon as={<MaterialCommunityIcons name="eye-plus" />} color="blue.600" />}
              onPress={() => video.toggleWatched()}
            >
              Watch
            </Button>
          )}
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

          <Row justifyContent="space-between">
            <Row alignItems="center">
              <Text>Hide future shows:</Text>
              <Switch
                size="sm"
                value={hideFutureEpisodes}
                onChange={() => setHideFutureEpisodes(!hideFutureEpisodes)}
              />
            </Row>
            <Button onPress={() => setAscendingOrder(!ascendingOrder)} size="lg">
              <Icon
                as={
                  <MaterialCommunityIcons
                    name={ascendingOrder ? 'sort-ascending' : 'sort-descending'}
                  />
                }
                color="white"
              />
            </Button>
          </Row>

          <ScrollView flex={1}>{episodes?.map(renderEpisode)}</ScrollView>

          {/* using flatlist even with smaller values takes a long time to render */}
          {/* <FlatList
            data={episodes}
            keyExtractor={item => item.id}
            initialNumToRender={15}
            renderItem={episodeRenderer}
          /> */}
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
