import React, { useEffect } from 'react'
import { ScrollView, Text, View, Checkbox, Row, Pressable, Icon } from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '@reelist/utils/hooks/useStore'
import { ReelistScreen } from '~/utils/navigation'
import FormSection from '~/shared/components/FormSection'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

const VideoListManagementModal = observer(({ navigation }: ReelistScreen) => {
  const { videoListStore, appState } = useStore()

  const video = appState.currentVideo!

  useEffect(() => {
    videoListStore.getAdminVideoLists()
  }, [])

  if (!video) {
    navigation.navigate('home')

    return null
  }

  return (
    <View flex={1} padding="10px" paddingTop="0">
      <Row direction="row-reverse" marginTop="10px">
        <Pressable onPress={() => navigation.pop()} justifyContent="center">
          <Icon as={<MaterialCommunityIcons name="close" />} size={6} />
        </Pressable>
      </Row>

      <View justifyContent="center" margin="10px">
        <Text fontSize="2xl" adjustsFontSizeToFit numberOfLines={2} textAlign="center">
          {video.videoName}
        </Text>
      </View>

      <FormSection label="Manage Lists:">
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
                colorScheme="reelist"
              />
            </View>
          ))}
        </ScrollView>
      </FormSection>
    </View>
  )
})

export default VideoListManagementModal
