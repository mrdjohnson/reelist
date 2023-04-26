import React, { useEffect } from 'react'
import { View, Icon, Center, Column, Text, ScrollView, Spinner, Badge } from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '@reelist/utils/hooks/useStore'
import EditProfilePage from './EditProfilePage'
import { ReelistScreen } from '~/utils/navigation'
import TrackedVideoItem from '~/features/video/TrackedVideoItem'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { Pressable, RefreshControl } from 'react-native'
import ProfileIcon from '~/shared/components/ProfileIcon'
import useAsyncState from '@reelist/utils/hooks/useAsyncState'
import NamedTileRow from '~/shared/components/NamedTileRow'
import ToggleButton from '~/shared/components/ToggleButton'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

const ProfileScreen = observer(({ navigation }: ReelistScreen) => {
  const { auth, appState, videoStore } = useStore()
  const user = appState.profileScreen.user || auth.user
  const isCurrentUser = user.id === auth.user.id

  const [trackedVideos, refresh, loadingTrackedVideos] = useAsyncState([], async () =>
    videoStore.getTrackedVideos({ userId: user.id }),
  )

  const startEditing = () => appState.setProfileScreenEditing(true)

  useEffect(() => {
    return () => appState.setProfileScreenUser(null)
  }, [appState])

  useEffect(() => {
    refresh()
  }, [user.id])

  if (appState.profileScreen.editing) {
    return <EditProfilePage />
  }

  const content = loadingTrackedVideos ? (
    <Spinner size="lg" />
  ) : (
    <ScrollView
      flex={1}
      refreshControl={<RefreshControl refreshing={loadingTrackedVideos} onRefresh={refresh} />}
    >
      {!isCurrentUser && (
        <ToggleButton
          active={auth.user.isFollowingUser(user)}
          content="Follow user?"
          activeContent="Following User"
          icon={<MaterialCommunityIcons name="star-outline" />}
          activeIcon={<MaterialCommunityIcons name="star-check" />}
          onPress={() => auth.user.toggleFollowingUser(user)}
        />
      )}

      <NamedTileRow
        label="History"
        loadVideos={() => videoStore.getHistoricVideos({ userId: user.id })}
        showMoreText="See History Page"
        userId={user.id}
      />

      <Text>Bookmarked Videos:</Text>

      {trackedVideos.map(video => (
        <TrackedVideoItem video={video} key={video.id} isInteractable={isCurrentUser} />
      ))}
    </ScrollView>
  )

  return (
    <View flex={1} paddingTop="20px" paddingX="10px">
      <Column space={4} backgroundColor="blue">
        <ProfileIcon user={user} height="100px" width="100px" />

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
