import React, { useEffect, useMemo, useState } from 'react'
import { View, Avatar, Icon, Center, Column, Text, ScrollView, Spinner, Badge } from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '~/hooks/useStore'
import _ from 'lodash'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import EditProfilePage from './EditProfilePage'
import { ReelistScreen } from '~/utils/navigation'
import Video from '~/models/Video'
import TrackedVideoItem from '~/features/video/TrackedVideoItem'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { Pressable } from 'react-native'

const missingIconOptions = [
  'user-astronaut',
  'user-shield',
  'user-md',
  'user-injured',
  'user-ninja',
  'user-ninja',
  'user-secret',
  'user-secret',
  'user-secret',
]

const ProfileScreen = observer(({ navigation }: ReelistScreen) => {
  const { auth, appState, videoStore } = useStore()
  const user = appState.profileScreen.user || auth.user
  const isCurrentUser = user.id === auth.user.id
  const [trackedVideos, setTrackedVideos] = useState<Video[]>([])
  const [loadingTrackedVideos, setLoadingTrackedVideos] = useState(false)

  const missingUserIcon = useMemo(() => {
    return _.sample(missingIconOptions) || 'user-secret'
  }, [])

  const startEditing = () => appState.setProfileScreenEditing(true)

  useEffect(() => {
    return () => appState.setProfileScreenUser(null)
  }, [appState])

  useEffect(() => {
    setLoadingTrackedVideos(true)

    videoStore
      .getTrackedVideos(user.id)
      .then(setTrackedVideos)
      .then(() => setLoadingTrackedVideos(false))
  }, [user.id])

  if (appState.profileScreen.editing) {
    return <EditProfilePage />
  }

  const content = loadingTrackedVideos ? (
    <Spinner size="lg" />
  ) : (
    <ScrollView flex={1}>
      <Text>Tracked Videos:</Text>

      {trackedVideos.map(video => (
        <TrackedVideoItem video={video} key={video.id} isInteractable={isCurrentUser} />
      ))}
    </ScrollView>
  )

  return (
    <View flex={1} backgroundColor="white" paddingTop="20px" paddingX="10px">
      <Column space={4} backgroundColor="blue">
        <Avatar
          height="100px"
          width="100px"
          alignSelf="center"
          alignItems="center"
          source={{ uri: user.avatarUrl }}
          backgroundColor="gray.400"
          display="flex"
        >
          <Icon
            as={
              <FontAwesome5
                name={missingUserIcon}
                size={60}
                style={{ color: 'white', padding: 0, margin: 0 }}
              />
            }
          />
        </Avatar>

        <Center>
          <Pressable onPress={isCurrentUser ? startEditing : null}>
            <Column>
              {isCurrentUser && (
                <Badge
                  backgroundColor={'transparent'}
                  marginBottom={-4}
                  marginRight={-5}
                  zIndex={1}
                  alignSelf="flex-end"
                >
                  <Icon as={<MaterialIcons name="edit" size={10} style={{ color: 'black' }} />} />
                </Badge>
              )}

              <Text
                mx={{
                  base: 'auto',
                  md: 0,
                }}
                fontSize="xl"
              >
                {user.name}
              </Text>
            </Column>
          </Pressable>
        </Center>
      </Column>

      {content}
    </View>
  )
})

export default ProfileScreen
