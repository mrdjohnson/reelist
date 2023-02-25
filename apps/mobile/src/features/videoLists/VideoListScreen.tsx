import React, { useEffect, useMemo, useState } from 'react'
import { Actionsheet, Center, Pressable, Row, Text, useDisclose, useToast, View } from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '~/hooks/useStore'
import Clipboard from '@react-native-clipboard/clipboard'
import User from '@reelist/models/User'
import { ReelistScreen } from '~/utils/navigation'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import VideoListDetailsSection from './VideoListDetailsSection'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import VideoFlatList from './VideoFlatList'

const VideoListScreen = observer(({ navigation }: ReelistScreen) => {
  const { videoListStore, auth, appState } = useStore()
  const toast = useToast()

  const currentVideoList = videoListStore.currentVideoList

  const [showMembers, setShowMembers] = useState(false)
  const [activeUser, setActiveUser] = useState<User | null>(null)
  const [isSelectingProgress, setIsSelectingProgress] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const {
    isOpen: isMembershipOpen,
    onOpen: openMembership,
    onClose: onMemebershipClose,
  } = useDisclose()

  useEffect(() => {
    return () => videoListStore.setCurrentVideoList(null)
  }, [])

  useEffect(() => {
    videoListStore.setCurrentVideoListFromShareId(appState.videoListShareId)

    return () => appState.setVideoListShareId(null)
  }, [appState.videoListShareId, videoListStore])

  useEffect(() => {
    currentVideoList?.getVideos()
    currentVideoList?.fetchAdmins()
  }, [currentVideoList])

  const isUserListAdmin = useMemo(() => {
    return currentVideoList?.adminIds.includes(auth.user.id)
  }, [currentVideoList?.adminIds])

  if (!currentVideoList) return null

  const handleProgressPressed = () => {
    setShowMembers(true)
    setIsSelectingProgress(true)
    openMembership()
  }

  const join = () => {
    if (currentVideoList.isJoinable) {
      currentVideoList.join()
      onMemebershipClose()
    } else {
      toast.show({
        description: 'This list is not joinable.',
      })
    }
  }

  const leave = () => {
    if (currentVideoList.adminIds.length === 1) {
      toast.show({
        description: 'You are the only one in the list, please delete list instead.',
      })
    } else {
      currentVideoList.leave()
      navigation.pop()
      closeMemberShipActionSheet()
    }
  }

  const openEditPage = () => {
    navigation.push('videoListScreenSettingsModal')
    closeMemberShipActionSheet()
  }

  const shareList = async () => {
    const uniqueId = currentVideoList.uniqueId
    let description = 'Unable to generate a unique id for ' + currentVideoList.name

    if (uniqueId !== null) {
      const url = 'reelist.app/share/list/' + uniqueId

      Clipboard.setString(url)

      description = url + ' copied to clipboard!'
    }

    toast.show({
      description,
      duration: 3000,
    })

    closeMemberShipActionSheet()
  }

  const followOrUnfollowList = (follow: boolean) => {
    if (follow) {
      auth.user.followVideoList(currentVideoList)
      videoListStore.addToFollowedVideoList(currentVideoList)
    } else {
      auth.user.unFollowVideoList(currentVideoList)
      videoListStore.removeFromFollowedVideoList(currentVideoList)
    }

    closeMemberShipActionSheet()
  }

  const closeMemberShipActionSheet = () => {
    setShowMembers(false)
    onMemebershipClose()
  }

  const handleUserPress = (user: User | null) => {
    if (isSelectingProgress) {
      setActiveUser(user)
      closeMemberShipActionSheet()
      setIsSelectingProgress(false)

      return
    }

    appState.setProfileScreenUser(user)

    navigation.push('profile')
  }

  const openDetailsPanel = () => {
    setShowDetails(true)
    onMemebershipClose()
  }

  const handleBackButton = () => {
    if (showDetails) {
      setShowDetails(false)
    } else {
      navigation.goBack()
    }
  }

  let content

  if (showDetails) {
    content = <VideoListDetailsSection videoList={currentVideoList} />
  } else {
    content = (
      <VideoFlatList
        videoList={currentVideoList}
        activeUser={activeUser}
        onProgressPressed={handleProgressPressed}
      />
    )
  }

  return (
    <View flex={1} backgroundColor="light.100">
      <Row margin="10px">
        <Center>
          <Pressable alignSelf="center" onPress={handleBackButton}>
            <MaterialIcons
              name="arrow-back"
              size={20}
              style={{ color: 'black', padding: 0, margin: 0 }}
            />
          </Pressable>
        </Center>

        <Center flex={1} marginX="4px">
          <Text fontSize="2xl" adjustsFontSizeToFit numberOfLines={1}>
            {currentVideoList.name}
          </Text>
        </Center>

        <Center>
          <Pressable alignSelf="center" onPress={openMembership}>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={23}
              style={{ color: 'black', padding: 0, margin: 0 }}
            />
          </Pressable>
        </Center>
      </Row>

      {content}

      {/* hidden */}

      <Actionsheet isOpen={isMembershipOpen} onClose={closeMemberShipActionSheet}>
        <Actionsheet.Content>
          {showMembers ? (
            <>
              {isSelectingProgress && (
                <>
                  <Actionsheet.Item
                    onPress={() => handleUserPress(null)}
                    backgroundColor={activeUser === null ? 'light.300:alpha.40' : null}
                  >
                    None (video overview)
                  </Actionsheet.Item>

                  <Actionsheet.Item
                    onPress={() => handleUserPress(auth.user)}
                    backgroundColor={activeUser === auth.user ? 'light.300:alpha.40' : null}
                  >
                    {(auth.user.name || 'Me') + ' (self)'}
                  </Actionsheet.Item>
                </>
              )}

              {currentVideoList.admins.map(admin => (
                <Actionsheet.Item
                  key={admin.id}
                  backgroundColor={activeUser === admin ? 'light.300:alpha.40' : null}
                  onPress={() => handleUserPress(admin)}
                >
                  {admin.name}
                </Actionsheet.Item>
              ))}
            </>
          ) : (
            <>
              {!isUserListAdmin && currentVideoList.isJoinable && (
                <Actionsheet.Item
                  onPress={join}
                  _text={{ color: currentVideoList.isJoinable ? undefined : 'gray.600' }}
                >
                  Join
                </Actionsheet.Item>
              )}

              <Actionsheet.Item onPress={() => setShowMembers(true)}>Members</Actionsheet.Item>

              {showDetails || (
                <Actionsheet.Item onPress={openDetailsPanel}>Details</Actionsheet.Item>
              )}

              {isUserListAdmin && (
                <Actionsheet.Item
                  onPress={leave}
                  _text={{ color: currentVideoList.adminIds.length > 1 ? undefined : 'gray.600' }}
                >
                  Leave
                </Actionsheet.Item>
              )}

              {isUserListAdmin && <Actionsheet.Item onPress={openEditPage}>Edit</Actionsheet.Item>}

              {auth.user.isFollowingVideoList(currentVideoList) ? (
                <Actionsheet.Item onPress={() => followOrUnfollowList(false)}>
                  UnFollow
                </Actionsheet.Item>
              ) : (
                <Actionsheet.Item onPress={() => followOrUnfollowList(true)}>
                  Follow
                </Actionsheet.Item>
              )}

              <Actionsheet.Item onPress={shareList}>Copy Shareable link</Actionsheet.Item>

              <Actionsheet.Item onPress={onMemebershipClose}>Cancel</Actionsheet.Item>
            </>
          )}
        </Actionsheet.Content>
      </Actionsheet>
    </View>
  )
})

export default VideoListScreen
