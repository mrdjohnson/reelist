import React from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@reelist/utils/hooks/useStore'
import { Column, Pressable, Text, View } from 'native-base'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import moment from 'moment'
import { useReelistNavigation } from '~/utils/navigation'
import AppButton from '~/components/AppButton'
import VideoImage from './VideoImage'
import { UserVideoType } from '@reelist/models/UserVideo'

type VideoItemProps = {
  video: UserVideoType | null | undefined
  isTile?: boolean
  isInteractable?: boolean
}

const TrackedVideoItem = observer(
  ({ video, isInteractable = true, isTile = false }: VideoItemProps) => {
    const { appState, videoStore } = useStore()
    const navigation = useReelistNavigation()

    if (!video) return null

    let bottomRow

    // TODO: this whole section REALLY needs tests
    if (video.isCompleted) {
      bottomRow = (
        <View flexDirection="row-reverse">
          <Text alignSelf="flex-end">Completed</Text>
        </View>
      )
    } else if (!video.isTv) {
      bottomRow = (
        <View flexDirection="row-reverse">
          <AppButton
            icon={<MaterialCommunityIcons name="eye-plus" />}
            onPress={() => video.toggleWatched()}
          />
        </View>
      )
    } else {
      if (video.isLatestEpisodeWatched) {
        bottomRow = (
          <View flexDirection="row-reverse">
            <Column>
              <Text alignSelf="flex-end">Currently Live</Text>

              {video.nextEpisodeToAir && (
                <Text alignSelf="flex-end">
                  {/* Friday, Aug 19th 22 */}
                  Next Air Date:
                  {moment(video.nextEpisodeToAir.airDate).format(' dddd, MMM Do')}
                </Text>
              )}
            </Column>
          </View>
        )
      } else if (!isInteractable || isTile) {
        if (!video.lastWatchedSeasonNumber && !video.lastWatchedEpisodeNumber) {
          bottomRow = (
            <View flexDirection="row-reverse">
              <Text>Not started</Text>
            </View>
          )
        } else if (isTile) {
          bottomRow = (
            <View>
              <Text>Last watched:</Text>

              <Text>
                S: {video.lastWatchedSeasonNumber} Ep: {video.lastWatchedEpisodeNumber}
              </Text>
            </View>
          )
        } else {
          bottomRow = (
            <View flexDirection="row-reverse">
              <View>
                <Text>Last watched Season: {video.lastWatchedSeasonNumber}</Text>

                <Text>Last watched Episode: {video.lastWatchedEpisodeNumber}</Text>
              </View>
            </View>
          )
        }
      } else {
        bottomRow = (
          <View flexDirection="row" justifyContent="space-between" alignItems="center">
            <View>
              <Text>Season: {video.nextEpisode?.seasonNumber}</Text>

              <Text>Episode: {video.nextEpisode?.episodeNumber}</Text>
            </View>

            <AppButton
              icon={<MaterialCommunityIcons name="eye-plus" />}
              onPress={video.watchNextEpisode}
            />
          </View>
        )
      }
    }

    const goToMediaPage = () => {
      navigation.push('videoScreen', { videoId: video.videoId })
    }

    // only fade for YOUR videos that cant be interacted with.
    let faded = video.isWatched || video.isCompleted || (video.isTv && video.isLatestEpisodeWatched)

    if (!isInteractable) faded = false

    if (isTile) {
      const backgroundColor = faded ? 'light.400' : null

      return (
        <Pressable
          onPress={goToMediaPage}
          opacity={faded ? '50' : '100'}
          padding="3px"
          backgroundColor={backgroundColor}
          rounded="lg"
          onLongPress={() => appState.setActionSheetVideo(video)}
        >
          <Column>
            <VideoImage video={video} />

            <View>{bottomRow}</View>
          </Column>
        </Pressable>
      )
    }

    return (
      <Pressable
        flexDirection="row"
        margin="10px"
        onPress={goToMediaPage}
        opacity={faded ? '50' : '100'}
        onLongPress={() => appState.setActionSheetVideo(video)}
      >
        <View flexShrink={1}>
          <VideoImage
            video={video}
            containerProps={{ marginRight: '8px', maxHeight: '120px' }}
            backgroundColor="black"
          />
        </View>

        <View flex={1} backgroundColor={null} roundedLeft="sm" roundedRight="md">
          <Column flex={1}>
            <Text fontSize="lg" color={'black'}>
              {video.videoName}
            </Text>

            {video.videoOriginalName && (
              <Text fontSize="sm" color="light.500">
                {video.videoOriginalName}
              </Text>
            )}

            {video.videoReleaseDate && (
              <Text fontSize="sm" color="light.500">
                {video.videoReleaseDate.format('MMM YYYY')}
              </Text>
            )}
          </Column>

          {bottomRow}
        </View>
      </Pressable>
    )
  },
)

export default TrackedVideoItem
