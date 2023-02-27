import React from 'react'
import { ScrollView, Text, View, Center, Pressable, Row, Column } from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '@reelist/utils/hooks/useStore'
import VideoList from '@reelist/models/VideoList'
import { useReelistNavigation } from '~/utils/navigation'
import User from '@reelist/models/User'
import ProfileIcon from '~/shared/components/ProfileIcon'
import DetailsPanel from '~/shared/components/DetailsPanel'

type VideoListDetailsSectionProps = {
  videoList: VideoList
}

const VideoListDetailsSection = observer(({ videoList }: VideoListDetailsSectionProps) => {
  const { appState } = useStore()
  const navigation = useReelistNavigation()

  const navigateToUser = (user: User) => {
    appState.setProfileScreenUser(user)

    navigation.push('profile')
  }

  return (
    <View flex={1} padding="10px" paddingTop="0">
      <Center paddingBottom="6px">
        <Text adjustsFontSizeToFit numberOfLines={1} fontSize={'lg'}>
          Details:
        </Text>
      </Center>

      <ScrollView>
        <Column space="6px">
          <DetailsPanel text="Members">
            {videoList.admins.map(admin => (
              <Pressable onPress={() => navigateToUser(admin)} key={admin.id}>
                <Row alignItems="center" space="4px">
                  <ProfileIcon user={admin} height="40px" width="40px" />
                  <Text adjustsFontSizeToFit numberOfLines={1} fontSize="xl">
                    {admin.name}
                  </Text>
                </Row>
              </Pressable>
            ))}
          </DetailsPanel>

          <DetailsPanel text="Approximate Total Run time">
            <Text adjustsFontSizeToFit numberOfLines={1}>
              {videoList ? videoList.totalDuration : 'calculating total time'}
            </Text>
          </DetailsPanel>
        </Column>
      </ScrollView>
    </View>
  )
})

export default VideoListDetailsSection
