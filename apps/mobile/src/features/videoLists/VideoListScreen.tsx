import React, { useEffect, useMemo, useState } from 'react'
import {
  Actionsheet,
  Button,
  Center,
  FlatList,
  Text,
  useDisclose,
  useToast,
  View,
} from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '~/hooks/useStore'
import { BackHandler } from 'react-native'
import VideoItem, { videoItemSkeleton } from '~/features/video/VideoItem'
import Clipboard from '@react-native-clipboard/clipboard'
import User from '~/models/User'
import { ReelistScreen } from '~/utils/navigation'
import EditVideoListPage from './EditVideoListPage'

const CAN_GO_BACK = false
const CANNOT_GO_BACK = true

const VideoListScreen = observer(({ navigation }: ReelistScreen) => {
  const { videoListStore, auth, appState } = useStore()
  const toast = useToast()

  const currentVideoList = videoListStore.currentVideoList

  const [videoListName, setVideoListName] = useState<string>('')
  const [videoListIsPublic, setVideoListIsPublic] = useState(false)
  const [editing, setEditing] = useState<boolean>(false)
  const [editingErrorMessage, setEditingErrorMessage] = useState<string | null>(null)
  const [showMembers, setShowMembers] = useState(false)

  const {
    isOpen: isMembershipOpen,
    onOpen: openMembership,
    onClose: onMemebershipClose,
  } = useDisclose()

  useEffect(() => {
    videoListStore.setCurrentVideoListFromShareId(appState.videoListShareId)
    currentVideoList?.fetchAdmins()
  }, [appState.videoListShareId, videoListStore])

  useEffect(() => {
    currentVideoList?.getVideos()
  }, [currentVideoList])

  useEffect(() => {
    const onBackButtonPressed = () => {
      if (editing) {
        setEditing(false)
        setEditingErrorMessage(null)

        return CANNOT_GO_BACK
      }

      return CAN_GO_BACK
    }

    BackHandler.addEventListener('hardwareBackPress', onBackButtonPressed)

    return () => BackHandler.removeEventListener('hardwareBackPress', onBackButtonPressed)
  }, [editing])

  const isUserListAdmin = useMemo(() => {
    return currentVideoList?.adminIds.includes(auth.user.id)
  }, [currentVideoList?.adminIds])

  if (!currentVideoList) return null

  const join = () => {
    currentVideoList.join()
    onMemebershipClose()
  }

  const leave = () => {
    currentVideoList.leave()
    closeMemberShipActionSheet()
  }

  const startEditing = () => {
    setVideoListName(currentVideoList.name)
    setVideoListIsPublic(currentVideoList.isPublic)

    setEditing(true)
    closeMemberShipActionSheet()
  }

  const finishEditing = () => {
    currentVideoList
      .update(videoListName, videoListIsPublic)
      .then(() => {
        closeMemberShipActionSheet()
        setEditing(false)
        setEditingErrorMessage(null)
      })
      .catch((e: Error) => {
        setEditingErrorMessage(e.message)
      })
  }

  const shareList = async () => {
    const uniqueId = await currentVideoList.getShareUniqId()
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

  const closeMemberShipActionSheet = () => {
    setShowMembers(false)
    onMemebershipClose()
  }

  const openProfile = (user: User) => {
    appState.setProfileScreenUser(user)

    navigation.push('profile')
  }

  if (editing)
    return (
      <EditVideoListPage
        currentVideoList={currentVideoList}
        onFinishEditing={finishEditing}
        editingErrorMessage={editingErrorMessage}
        onCancelEditing={() => setEditing(false)}
      />
    )

  return (
    <View flex={1} backgroundColor="light.100">
      <View backgroundColor="amber.200" flexDirection="row">
        <Button onPress={() => navigation.navigate('videoListsHome')}>Go Home</Button>

        <Text fontSize="2xl">{currentVideoList.name}</Text>
      </View>

      <Button onPress={openMembership} margin="10px">
        Membership
      </Button>

      {currentVideoList.videoIds.length === 0 && (
        <Center>
          <Text>Nothing has been added here yet</Text>
        </Center>
      )}

      {currentVideoList.videos.length === 0 && (
        <FlatList
          data={currentVideoList.videoIds}
          keyExtractor={videoId => videoId}
          renderItem={() => videoItemSkeleton}
        />
      )}

      <FlatList
        data={currentVideoList.videos}
        keyExtractor={video => video.videoId}
        renderItem={({ item: video }) => <VideoItem video={video} />}
      />

      {/* hidden */}

      <Actionsheet isOpen={isMembershipOpen} onClose={closeMemberShipActionSheet}>
        <Actionsheet.Content display={showMembers ? 'none' : null}>
          {!isUserListAdmin && <Actionsheet.Item onPress={join}>Join</Actionsheet.Item>}

          <Actionsheet.Item onPress={() => setShowMembers(true)}>Members</Actionsheet.Item>

          {currentVideoList.adminIds.length > 1 && isUserListAdmin && (
            <Actionsheet.Item onPress={leave}>Leave</Actionsheet.Item>
          )}

          {isUserListAdmin && <Actionsheet.Item onPress={startEditing}>Edit</Actionsheet.Item>}

          <Actionsheet.Item onPress={shareList}>Copy Shareable link</Actionsheet.Item>

          <Actionsheet.Item onPress={onMemebershipClose}>Cancel</Actionsheet.Item>
        </Actionsheet.Content>

        <Actionsheet.Content display={showMembers ? null : 'none'}>
          {currentVideoList.admins.map(admin => (
            <Actionsheet.Item key={admin.id} onPress={() => openProfile(admin)}>
              {admin.name}
            </Actionsheet.Item>
          ))}
        </Actionsheet.Content>
      </Actionsheet>
    </View>
  )
})

export default VideoListScreen
