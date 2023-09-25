import React from 'react'
import { Text, View, Row, Column } from 'native-base'
import { observer } from 'mobx-react-lite'
import Video from '@reelist/models/Video'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import moment from 'moment'
import ToggleButton from '~/shared/components/ToggleButton'
import AppButton from '~/components/AppButton'
import ActionButton from '~/components/ActionButton'
import _ from 'lodash'
import { ViewProps } from 'react-native'
import { useReelistNavigation } from '~/utils/navigation'
import { useStore } from '@reelist/utils/hooks/useStore'

const sectionDivider = <View borderBottomColor="light.300" borderBottomWidth={1} />

type VideoWatchedStatusRowProps = ViewProps & {
  video: Video
  onModalOpen?: () => void
}

const VideoWatchedStatusRow = observer(
  ({ video, onModalOpen, ...props }: VideoWatchedStatusRowProps) => {
    const { appState } = useStore()
    const navigation = useReelistNavigation()

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
        <ActionButton
          onPress={video.watchNextEpisode}
          endIcon={<MaterialCommunityIcons name="eye-plus" />}
          flex={1}
        >
          <Text color="blue.500" numberOfLines={1}>
            Season: {video.nextEpisode?.seasonNumber} Episode: {video.nextEpisode?.episodeNumber}
          </Text>
        </ActionButton>
      )
    }

    const openVideoWatchModal = () => {
      appState.setCurrentVideo(video)
      navigation.push('videoUpdateWatchedModal', { videoId: video.id })

      onModalOpen?.()
    }

    return (
      <Column {...props} space="2">
        {sectionDivider}

        <Row justifyContent="space-between" alignItems="center" space="2">
          {video.isMovie ? (
            <ToggleButton
              marginY="10px"
              active={video.isWatched}
              color="blue.500"
              activeColor="gray.600"
              icon={<MaterialCommunityIcons name="eye-plus" />}
              activeIcon={<MaterialCommunityIcons name="eye-check" />}
              content="Watch"
              activeContent="Watched"
              onPress={() => video.toggleWatched()}
              width="100%"
            />
          ) : (
            <>
              {videoStatus}

              <AppButton
                icon={<MaterialCommunityIcons name="eye-settings" />}
                onPress={openVideoWatchModal}
              />
            </>
          )}
        </Row>

        {sectionDivider}
      </Column>
    )
  },
)

export default VideoWatchedStatusRow
