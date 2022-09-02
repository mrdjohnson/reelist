import React, { useEffect, useMemo, useState } from 'react'
import {
  Actionsheet,
  Badge,
  Button,
  Center,
  FlatList,
  Flex,
  IBadgeProps,
  IconButton,
  Pressable,
  Row,
  Text,
  useDisclose,
  useToast,
  View,
} from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '~/hooks/useStore'
import { BackHandler, RefreshControl } from 'react-native'
import VideoItem, { videoItemSkeleton } from '~/features/video/VideoItem'
import Clipboard from '@react-native-clipboard/clipboard'
import User from '~/models/User'
import { ReelistScreen } from '~/utils/navigation'
import EditVideoListPage from './EditVideoListPage'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Video from '~/models/Video'
import _ from 'lodash'
import TrackedVideoItem from '../video/TrackedVideoItem'

const CAN_GO_BACK = false
const CANNOT_GO_BACK = true

type TabProps = {
  activeTabKey: string | null
  onPress: (id: string | null) => void
  text: string
  id: string | null
}

const Tab = ({ activeTabKey, onPress, text, id }: TabProps) => {
  if (!text) return null

  const badgeProps: IBadgeProps = {}

  if (activeTabKey === id) {
    // for dark mode, try subtle?
    badgeProps.variant = 'solid'
    badgeProps.colorScheme = 'info'
  } else {
    badgeProps.variant = 'outline'
    badgeProps.colorScheme = null
  }

  return (
    <Pressable onPress={() => onPress(id)}>
      <Badge {...badgeProps}>{text}</Badge>
    </Pressable>
  )
}

const VideoListScreen = observer(({ navigation }: ReelistScreen) => {
  const { videoListStore, auth, appState, videoStore } = useStore()
  const toast = useToast()

  const currentVideoList = videoListStore.currentVideoList

  const [videoListName, setVideoListName] = useState<string>('')
  const [videoListIsPublic, setVideoListIsPublic] = useState(false)
  const [editing, setEditing] = useState<boolean>(false)
  const [editingErrorMessage, setEditingErrorMessage] = useState<string | null>(null)
  const [showMembers, setShowMembers] = useState(false)
  const [activeTabKey, setActiveTabKey] = useState<string | null>(null)
  const [loadingUserVideos, setLoadingUserVideos] = useState(false)
  const [trackedVideos, setTrackedVideos] = useState<Video[]>([])

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
    currentVideoList?.fetchAdmins()
  }, [appState.videoListShareId, videoListStore])

  useEffect(() => {
    currentVideoList?.getVideos()
  }, [currentVideoList])

  const loadVideosForUser = async () => {
    setLoadingUserVideos(true)

    const videos = await videoStore.getVideoProgressesForUser(
      activeTabKey,
      currentVideoList?.videoIds,
    )

    setLoadingUserVideos(false)
    setTrackedVideos(videos)
  }

  useEffect(() => {
    if (!activeTabKey) return _.noop

    loadVideosForUser()

    return () => {
      setLoadingUserVideos(false)
      setTrackedVideos([])
    }
  }, [activeTabKey, currentVideoList])

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
      <Row marginY="10px">
        <Center flex={1}>
          <Text fontSize="2xl">{currentVideoList.name}</Text>
        </Center>

        <Center>
          <Pressable alignSelf="center" marginRight="10px" onPress={openMembership}>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={23}
              style={{ color: 'black', padding: 0, margin: 0 }}
            />
          </Pressable>
        </Center>
      </Row>

      <Row marginLeft="10px" space="8px">
        <Tab text="Overview" id={null} activeTabKey={activeTabKey} onPress={setActiveTabKey} />

        {currentVideoList.admins.map(admin => (
          <Tab
            key={admin.id}
            text={admin.name}
            id={admin.id}
            activeTabKey={activeTabKey}
            onPress={setActiveTabKey}
          />
        ))}
      </Row>

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

      {!activeTabKey ? (
        <FlatList
          data={currentVideoList.videos}
          keyExtractor={video => video.videoId}
          renderItem={({ item: video }) => <VideoItem video={video} />}
        />
      ) : (
        <FlatList
          data={trackedVideos}
          keyExtractor={video => video.videoId}
          refreshControl={
            <RefreshControl refreshing={loadingUserVideos} onRefresh={loadVideosForUser} />
          }
          renderItem={({ item: video }) => (
            <TrackedVideoItem video={video} isInteractable={false} />
          )}
        />
      )}

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
