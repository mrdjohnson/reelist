import React, { useEffect } from 'react'
import { Button, ScrollView, Text, View, Center, Checkbox } from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '~/hooks/useStore'
import Video from '~/models/Video'

type VideoListManagementSectionProps = {
  video: Video
  closeManageListsSection: () => void
}
const VideoListManagementSection = observer(
  ({ video, closeManageListsSection }: VideoListManagementSectionProps) => {
    const { videoListStore } = useStore()

    useEffect(() => {
      videoListStore.getAdminVideoLists()
    }, [])

    return (
      <View flex={1} padding="10px" paddingTop="0">
        <Center>
          <Text>Manage Lists: </Text>

          <Button onPress={closeManageListsSection}>Go Back</Button>
        </Center>

        <ScrollView>
          {videoListStore.adminVideoLists.map(videoList => (
            <View flexDirection="row" marginTop="10px" key={videoList.id}>
              <Text flex={1} fontSize="lg">
                {videoList.name}
              </Text>

              <Checkbox
                value={videoList.id}
                isChecked={videoList.includes(video)}
                onChange={() => videoList.addOrRemoveVideo(video)}
                accessibilityLabel={'VideoList: ' + videoList.name}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    )
  },
)

export default VideoListManagementSection
