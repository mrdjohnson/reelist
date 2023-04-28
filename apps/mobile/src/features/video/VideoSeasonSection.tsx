import React, { useEffect, useMemo, useState } from 'react'
import {
  ScrollView,
  Text,
  View,
  Icon,
  Center,
  Checkbox,
  Actionsheet,
  Switch,
  Row,
  Pressable,
} from 'native-base'
import { observer } from 'mobx-react-lite'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Video, { TvEpisode, TvSeason } from '@reelist/models/Video'
import _ from 'lodash'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import moment from 'moment'
import { BackHandler } from 'react-native'
import AppButton from '@reelist/components/AppButton'
import ActionButton from '@reelist/components/ActionButton'

const IndeterminateIcon = <Icon as={<MaterialIcons name="indeterminate-check-box" />} />

const ascendingSort = (episodeA: TvEpisode, episodeB: TvEpisode) =>
  episodeA.episodeNumber - episodeB.episodeNumber
const descendingSort = (episodeB: TvEpisode, episodeA: TvEpisode) =>
  episodeA.episodeNumber - episodeB.episodeNumber

const CAN_GO_BACK = false
const CANNOT_GO_BACK = true

type VideoSeasonSectionProps = {
  video: Video
  season: TvSeason
}
const VideoSeasonSection = observer(({ video, season }: VideoSeasonSectionProps) => {
  const [episode, setEpisode] = useState<TvEpisode | null>(null)
  const [ascendingOrder, setAscendingOrder] = useState<boolean>(true)
  const [hideFutureEpisodes, setHideFutureEpisodes] = useState(true)

  const episodes: TvEpisode[] | undefined = useMemo(() => {
    if (!season?.episodes || !video) return

    let episodeChain = _.chain(season.episodes)

    if (hideFutureEpisodes) {
      episodeChain = episodeChain.filter(episode => moment(episode.airDate).isBefore())
    }

    episodeChain = episodeChain.sort(ascendingOrder ? ascendingSort : descendingSort)

    return episodeChain.value()
  }, [season?.episodes, ascendingOrder, hideFutureEpisodes])

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
          colorScheme="reelist"
        />
      </View>
    )
  }

  return (
    <View flex={1} display="flex">
      <View paddingLeft="10px" paddingRight="10px" flex={1}>
        <View flexDirection="row" borderBottomWidth={1} marginBottom="10px" alignItems="center">
          <AppButton onPress={video.clearSelectedSeason} marginRight="8px" size="sm">
            Go Back
          </AppButton>

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
              video.getIsSeasonPartiallyWatched(season.seasonNumber) ? IndeterminateIcon : undefined
            }
            colorScheme="reelist"
          />
        </View>

        <Row justifyContent="space-between">
          <Row alignItems="center">
            <Text>Hide future shows:</Text>
            <Switch size="sm" onValueChange={setHideFutureEpisodes} defaultIsChecked />
          </Row>
          <ActionButton
            onPress={() => setAscendingOrder(!ascendingOrder)}
            icon={
              <MaterialCommunityIcons
                name={ascendingOrder ? 'sort-ascending' : 'sort-descending'}
              />
            }
          />
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

export default VideoSeasonSection
