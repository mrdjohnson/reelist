import React from 'react'
import { Row, Column } from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '@reelist/utils/hooks/useStore'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { ReelistNavigation } from '~/utils/navigation'
import ToggleButton from '~/shared/components/ToggleButton'
import AppButton from '~/components/AppButton'
import TotalTimeDetailsPanel from '~/shared/components/TotalTimeDetailsPanel'
import VideoWatchedStatusRow from '~/shared/components/VideoWatchedStatusRow'
import SegmentButton from '~/shared/components/SegmentButton'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { UserVideoType } from '@reelist/models/UserVideo'

const VideoDashboardTab = observer(
  ({ video, navigation }: { video: UserVideoType; navigation: ReelistNavigation }) => {
    const { auth, appState } = useStore()

    const openVideoListManagementModal = () => {
      appState.setCurrentVideo(video)
      navigation.navigate('videoListManagementModal')
    }

    return (
      <Column padding="10px" space="10px">
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

        <VideoWatchedStatusRow video={video} />

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

        <TotalTimeDetailsPanel user={auth.user} videos={[video]} marginX="0" />
      </Column>
    )
  },
)

export default VideoDashboardTab
