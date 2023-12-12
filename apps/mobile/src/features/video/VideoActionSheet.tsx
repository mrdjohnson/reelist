import React, { useEffect, useState } from 'react'
import { Actionsheet, Column, Row } from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '@reelist/utils/hooks/useStore'
import { useReelistNavigation } from '~/utils/navigation'
import AppButton from '~/components/AppButton'
import VideoItem from './VideoItem'
import ToggleButton from '~/shared/components/ToggleButton'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import SegmentButton from '~/shared/components/SegmentButton'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import VideoWatchedStatusRow from '~/shared/components/VideoWatchedStatusRow'
import { UserVideoType } from '@reelist/models/UserVideo'

const VideoActionSheet = observer(() => {
  const { appState, videoStore } = useStore()
  const navigation = useReelistNavigation()

  const [video, setVideo] = useState<UserVideoType | null>(null)

  const { isOpen, videoId } = appState.actionSheets.video

  const closeSheet = appState.clearActionSheetVideo

  const openVideoListManagementModal = () => {
    closeSheet()

    appState.setCurrentVideo(video)
    navigation.navigate('videoListManagementModal')
  }

  useEffect(() => {
    if (!videoId) return

    setVideo(null)

    videoStore.getVideoProgressForUser(videoId).then(setVideo)
  }, [videoId])

  useEffect(() => {
    if (!video?.isTv) return

    video.fetchSeasons()
  }, [video])

  return (
    <Actionsheet isOpen={isOpen} onClose={closeSheet}>
      {video && (
        <Actionsheet.Content>
          <VideoItem video={video} margin="0" onPress={closeSheet} />

          <Column space="10px" marginY="20px" width="100%">
            <Row alignItems="center" space="8px" justifyContent="space-between">
              <AppButton flex={1} onPress={openVideoListManagementModal} size="sm">
                Manage Lists
              </AppButton>

              <ToggleButton
                size="sm"
                flex={1}
                active={video.tracked}
                icon={<MaterialCommunityIcons name="bookmark-plus" />}
                activeIcon={<MaterialCommunityIcons name="bookmark-check" />}
                content="Add to Bookmarks"
                activeContent="Added to Bookmarks"
                onPress={() => video.toggleTracked()}
              />
            </Row>

            <VideoWatchedStatusRow video={video} onModalOpen={closeSheet} />

            <SegmentButton
              selectedSegmentIndex={video.allowInHistory ? 0 : 1}
              onPress={() => video.toggleHistoryVisibility()}
              segments={[
                {
                  icon: <MaterialIcons name="public" />,
                  content: 'History visible to all',
                },
                {
                  icon: <MaterialIcons name="public-off" />,
                  content: 'History is private',
                },
              ]}
              size="sm"
            />
          </Column>
        </Actionsheet.Content>
      )}
    </Actionsheet>
  )
})

export default VideoActionSheet
