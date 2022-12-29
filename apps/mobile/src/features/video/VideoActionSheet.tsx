import React from 'react'
import { Actionsheet, Column } from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '~/hooks/useStore'
import { useReelistNavigation } from '~/utils/navigation'
import AppButton from '~/shared/components/AppButton'
import VideoItem from './VideoItem'
import ToggleButton from '~/shared/components/ToggleButton'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

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

            <AppButton onPress={openVideoListManagementModal}>Manage Lists</AppButton>
          </Column>
        </Actionsheet.Content>
      )}
    </Actionsheet>
  )
})

export default VideoActionSheet
