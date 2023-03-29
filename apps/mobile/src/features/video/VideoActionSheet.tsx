import React from 'react'
import { Actionsheet, Column } from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '@reelist/utils/hooks/useStore'
import { useReelistNavigation } from '~/utils/navigation'
import AppButton from '@reelist/components/AppButton'
import VideoItem from './VideoItem'
import ToggleButton from '~/shared/components/ToggleButton'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import SegmentButton from '~/shared/components/SegmentButton'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

const VideoActionSheet = observer(() => {
  const { appState } = useStore()
  const navigation = useReelistNavigation()

  const { isOpen, video } = appState.actionSheets.video

  const closeSheet = appState.clearActionSheetVideo

  const openVideoListManagementModal = () => {
    closeSheet()

    appState.setCurrentVideo(video)
    navigation.navigate('videoListManagementModal')
  }

  return (
    <Actionsheet isOpen={isOpen} onClose={closeSheet}>
      {video && (
        <Actionsheet.Content>
          <VideoItem video={video} margin="0" onPress={closeSheet} />

          <Column space="10px" marginY="20px" width="100%">
            <ToggleButton
              active={video.tracked}
              content="Add to Bookmarks?"
              icon={<MaterialCommunityIcons name="bookmark-plus" />}
              activeContent="Added to Bookmarks"
              activeIcon={<MaterialCommunityIcons name="bookmark-check" />}
              onPress={() => video.toggleTracked()}
            />

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
            />

            <AppButton onPress={openVideoListManagementModal}>Manage Lists</AppButton>
          </Column>
        </Actionsheet.Content>
      )}
    </Actionsheet>
  )
})

export default VideoActionSheet
