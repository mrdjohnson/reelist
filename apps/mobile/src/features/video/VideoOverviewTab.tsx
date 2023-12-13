import React, { useState } from 'react'
import { Pressable, Text, View, Icon, Checkbox, Row, ChevronRightIcon } from 'native-base'
import { observer } from 'mobx-react-lite'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import NamedTileRow from '~/shared/components/NamedTileRow'
import { useReelistNavigation } from '~/utils/navigation'
import { useStore } from '@reelist/utils/hooks/useStore'
import { TmdbShowSeasonPartialResponseType } from '@reelist/interfaces/tmdb/TmdbShowResponse'
import { AnyVideoType } from '@reelist/models/Video'

const IndeterminateIcon = <Icon as={<MaterialIcons name="indeterminate-check-box" />} />

const sectionDivider = <View borderBottomColor="light.300" borderBottomWidth={1} />

const VideoOverviewTab = observer(({ video }: { video: AnyVideoType }) => {
  const navigation = useReelistNavigation()
  const { appState } = useStore()

  const [minimizeVideoOverview, setMinimizeVideoOverview] = useState(true)

  const navigateToSeason = (season: TmdbShowSeasonPartialResponseType) => {
    if (video.isTv !== true) throw new Error('Video is not a TV show')

    appState.setCurrentVideo(video)

    const userId = video.hasUser ? video.userId : null

    navigation.push('videoSeasonModal', {
      videoId: video.videoId,
      userId,
      seasonNumber: season.seasonNumber,
    })
  }

  return (
    <View flex={1} paddingX="10px">
      <Pressable onPress={() => setMinimizeVideoOverview(!minimizeVideoOverview)} paddingY="10px">
        <Text numberOfLines={minimizeVideoOverview ? 3 : 0}>{video.overview}</Text>
      </Pressable>

      <Text
        numberOfLines={2}
        adjustsFontSizeToFit
        color="coolGray.600"
        marginBottom="10px"
        fontSize="sm"
      >
        {video.genres.map(genre => genre.name).join(', ')}
      </Text>

      {sectionDivider}

      {video.isTv && (
        <>
          <View>
            <Row
              justifyContent="space-between"
              borderBottomWidth={1}
              borderBottomColor="light.700"
              marginTop="10px"
            >
              <Text fontSize="lg">Seasons: </Text>

              {video.hasUser && (
                <Checkbox
                  size="sm"
                  value={video.videoId}
                  isChecked={video.isWatched}
                  onChange={() => video.toggleWatched()}
                  accessibilityLabel={video.videoName}
                  colorScheme="reelist"
                />
              )}
            </Row>

            {video.isTv &&
              video.seasonPartials.map(season => (
                <Row key={season.id} alignItems="center" marginBottom="10px" marginTop="10px">
                  {video.hasUser && (
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
                      marginRight="10px"
                    />
                  )}

                  <Pressable onPress={() => navigateToSeason(season)} flex={1}>
                    <Row justifyContent="space-between" alignItems="center">
                      <Text fontSize="md">{season.name}</Text>
                      <ChevronRightIcon />
                    </Row>
                  </Pressable>
                </Row>
              ))}
          </View>

          {sectionDivider}
        </>
      )}

      <NamedTileRow
        label={'Related to ' + video.videoName}
        loadVideos={async () => video.similar}
        marginX="0px"
        marginY="10px"
      />
    </View>
  )
})

export default VideoOverviewTab
