import React, { useEffect, useMemo, useState } from 'react'
import {
  ScrollView,
  Text,
  View,
  Icon,
  Checkbox,
  Actionsheet,
  Switch,
  Row,
  Pressable,
  ArrowBackIcon,
  AspectRatio,
  Image,
  Column,
  ChevronRightIcon,
} from 'native-base'
import { observer } from 'mobx-react-lite'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import _ from 'lodash'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import moment from 'moment'
import { BackHandler } from 'react-native'
import ActionButton from '~/components/ActionButton'
import { ReelistScreenFrom } from '~/utils/navigation'
import { useStore } from '@reelist/utils/hooks/useStore'
import ToggleButton from '~/shared/components/ToggleButton'
import LoadingSection from '~/shared/components/LoadingSection'
import UserShow from '@reelist/models/UserShow'
import { TmdbTvSeason } from '@reelist/interfaces/tmdb/TmdbShowResponse'
import { TmdbTvEpisode } from '@reelist/interfaces/tmdb/TmdbVideoByIdType'

const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500'

const IndeterminateIcon = <Icon as={<MaterialIcons name="indeterminate-check-box" />} />

const ascendingSort = (episodeA: TmdbTvEpisode, episodeB: TmdbTvEpisode) =>
  episodeA.episodeNumber - episodeB.episodeNumber
const descendingSort = (episodeB: TmdbTvEpisode, episodeA: TmdbTvEpisode) =>
  episodeA.episodeNumber - episodeB.episodeNumber

const CAN_GO_BACK = false
const CANNOT_GO_BACK = true

const VideoSeasonModal = observer(
  ({ route, navigation }: ReelistScreenFrom<'videoSeasonModal'>) => {
    const { videoStore, appState } = useStore()

    const [video, setVideo] = useState<UserShow | null>(null)

    const [season, setSeason] = useState<TmdbTvSeason | null>(null)

    const [episode, setEpisode] = useState<TmdbTvEpisode | null>(null)
    const [ascendingOrder, setAscendingOrder] = useState<boolean>(true)
    const [hideFutureEpisodes, setHideFutureEpisodes] = useState(true)

    const episodes: TmdbTvEpisode[] | undefined = useMemo(() => {
      if (!season?.episodes || !video) return

      let episodeChain = _.chain(season.episodes)

      if (hideFutureEpisodes) {
        episodeChain = episodeChain.filter(episode => moment(episode.airDate).isBefore())
      }

      episodeChain = episodeChain.sort(ascendingOrder ? ascendingSort : descendingSort)

      return episodeChain.value()
    }, [season?.episodes, ascendingOrder, hideFutureEpisodes])

    const initUserVideo = async () => {
      const video = await videoStore.getVideoProgressForUser(route.params.videoId)

      if (!video.isTv) {
        navigation.navigate('home')
        return
      }

      video.fetchSeason(route.params.seasonNumber).then(setSeason)

      setVideo(video)
    }

    useEffect(() => {
      initUserVideo()
    }, [route.params.videoId])

    useEffect(() => {
      const onBackButtonPressed = () => {
        if (episode) {
          setEpisode(null)

          return CANNOT_GO_BACK
        }

        return CAN_GO_BACK
      }

      BackHandler.addEventListener('hardwareBackPress', onBackButtonPressed)

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackButtonPressed)
    }, [episode])

    const renderEpisodeLineItem = (episode: TmdbTvEpisode) => {
      const aired = moment(episode.airDate).isBefore()

      return (
        <View
          key={episode.id}
          flexDirection="row"
          alignItems="flex-end"
          marginBottom={2}
          opacity={aired ? '100' : '50'}
        >
          <Checkbox
            value={season?.seasonNumber + ''}
            isChecked={video.getIsEpisodeWatched(episode)}
            onChange={() => video.toggleEpisodeWatched(episode)}
            accessibilityLabel={'Episode ' + episode.episodeNumber}
            size="sm"
            colorScheme="reelist"
            marginRight="10px"
          />

          <Pressable
            flex={1}
            onPress={() => setEpisode(episode)}
            disabled={!aired}
            flexDirection="row"
            alignItems="center"
          >
            <Column flex={1}>
              <Text fontSize="sm" color="gray.400">
                Episode {episode.episodeNumber}
              </Text>

              <Text fontSize="md">{episode.name}</Text>
            </Column>

            <Row alignItems="center" paddingRight="10px">
              <Icon as={<MaterialIcons name="star-rate" />} size="sm" color="red.600" />
              <Text color="light.700">{episode.voteAverage.toPrecision(2)}</Text>
            </Row>

            <ChevronRightIcon />
          </Pressable>
        </View>
      )
    }

    if (!season) {
      return <LoadingSection />
    }

    return (
      <View flex={1} display="flex">
        <View paddingLeft="10px" paddingRight="10px" flex={1}>
          <View backgroundColor="white">
            <Row
              height="45px"
              justifyContent="space-between"
              alignItems="center"
              backgroundColor="light.300:alpha.40"
              space={2}
              width="100%"
              display="flex"
            >
              <Pressable onPress={navigation.goBack}>
                <ArrowBackIcon flex={1} />
              </Pressable>

              <Text
                flexShrink={1}
                numberOfLines={2}
                adjustsFontSizeToFit
                textAlign="center"
                fontSize="xl"
              >
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
                colorScheme="reelist"
              />
            </Row>
          </View>

          <Row justifyContent="space-between" alignItems="center">
            <Row alignItems="center">
              <Text>Hide future shows:</Text>
              <Switch
                size="sm"
                onValueChange={setHideFutureEpisodes}
                defaultIsChecked
                colorScheme="reelist"
              />
            </Row>

            <ActionButton
              onPress={() => setAscendingOrder(!ascendingOrder)}
              icon={
                <MaterialCommunityIcons
                  name={ascendingOrder ? 'sort-ascending' : 'sort-descending'}
                />
              }
              size="sm"
            />
          </Row>

          <View borderBottomColor="light.300" borderBottomWidth={1} marginY="4px" />

          <ScrollView flex={1} showsVerticalScrollIndicator={false}>
            {episodes?.map(renderEpisodeLineItem)}
          </ScrollView>
        </View>

        {/* hidden */}

        <Actionsheet isOpen={!!episode} onClose={() => setEpisode(null)}>
          {episode && (
            <View backgroundColor={'white'} roundedTop="lg" width="100%">
              {episode.stillPath && (
                <AspectRatio
                  width="100%"
                  ratio={{
                    base: 16 / 9,
                  }}
                >
                  <Image
                    source={{ uri: IMAGE_PATH + episode.stillPath }}
                    resizeMode="contain"
                    backgroundColor="red"
                    roundedTop="lg"
                  />
                </AspectRatio>
              )}

              <View padding="10px">
                <Row alignItems="center" justifyContent="space-between" space="2">
                  <Text fontSize="xl" adjustsFontSizeToFit numberOfLines={2}>
                    {episode.name}
                  </Text>

                  <ToggleButton
                    margin="10px"
                    active={video.getIsEpisodeWatched(episode)}
                    color="blue.500"
                    activeColor="gray.600"
                    icon={<MaterialCommunityIcons name="eye-plus" />}
                    activeIcon={<MaterialCommunityIcons name="eye-check" />}
                    content="Watch"
                    activeContent="Watched"
                    onPress={() => video.toggleEpisodeWatched(episode)}
                    size="sm"
                  />
                </Row>

                <Column paddingY="10px">
                  <Text color="light.700">
                    {`S: ${season.seasonNumber} E: ${episode.episodeNumber} | ${moment(
                      episode.airDate,
                    ).format('MMM YYYY')} | ${episode.runtime || 'Unknown'} min`}
                  </Text>

                  <Row alignItems="center">
                    <Icon as={<MaterialIcons name="star-rate" />} size="sm" color="red.600" />
                    <Text color="light.700">
                      {`${episode.voteAverage.toPrecision(2)} | ${episode.voteCount} ${
                        episode.voteCount === 1 ? 'vote' : 'voters'
                      }`}
                    </Text>
                  </Row>
                </Column>

                <Text textAlign="left">{episode.overview}</Text>
              </View>
            </View>
          )}
        </Actionsheet>
      </View>
    )
  },
)

export default VideoSeasonModal
