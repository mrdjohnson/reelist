import React, { useState } from 'react'
import { Pressable, Text, View, Icon, Checkbox, Row } from 'native-base'
import { observer } from 'mobx-react-lite'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Video, { TvSeason } from '@reelist/models/Video'
import NamedTileRow from '~/shared/components/NamedTileRow'
import _ from 'lodash'
import { useReelistNavigation } from '~/utils/navigation'
import { useStore } from '@reelist/utils/hooks/useStore'

const IndeterminateIcon = <Icon as={<MaterialIcons name="indeterminate-check-box" />} />

const sectionDivider = <View borderBottomColor="light.300" borderBottomWidth={1} />

const VideoOverviewTab = observer(({ video }: { video: Video }) => {
  const navigation = useReelistNavigation()
  const { appState } = useStore()

  const [minimizeVideoOverview, setMinimizeVideoOverview] = useState(true)

  const navigateToSeason = (season: TvSeason) => {
    appState.setCurrentVideo(video)

    navigation.push('videoSeasonModal', {
      videoId: video.id,
      seasonNumber: season.seasonNumber,
    })
  }

  return (
    <View flex={1} paddingX="10px">
      <Pressable onPress={() => setMinimizeVideoOverview(!minimizeVideoOverview)} paddingY="10px">
        <Text numberOfLines={minimizeVideoOverview ? 3 : 0}>{video.overview}</Text>
      </Pressable>

      <Text numberOfLines={2} adjustsFontSizeToFit color="coolGray.600" marginBottom="10px" fontSize="sm">
        {video.genres.map(genre => genre.name).join(', ')}
      </Text>

      {sectionDivider}

      {video.isTv && video.seasons && (
        <>
          <View>
            {video.seasons.length > 1 && (
              <Row
                justifyContent="space-between"
                borderBottomWidth={1}
                borderBottomColor="light.700"
                marginTop="10px"
              >
                <Text fontSize="lg">Seasons: </Text>

                <Checkbox
                  size="sm"
                  value={video.id}
                  isChecked={video.isWatched}
                  onChange={() => video.toggleWatched()}
                  accessibilityLabel={video.name}
                  colorScheme="reelist"
                />
              </Row>
            )}

            {video.seasons.map(season => (
              <Row key={season.id} alignItems="center" marginBottom="10px" marginTop="10px">
                <Pressable onPress={() => navigateToSeason(season)} flex={1}>
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
                  colorScheme="reelist"
                />
              </Row>
            ))}
          </View>

          {sectionDivider}
        </>
      )}

      <NamedTileRow
        label={'Related to ' + video.videoName}
        loadVideos={async () => video.fetchRelated()}
        marginX="0px"
        marginY="10px"
      />
    </View>
  )
})

export default VideoOverviewTab
