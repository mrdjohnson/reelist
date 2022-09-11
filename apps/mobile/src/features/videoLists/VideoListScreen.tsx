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
import { BackHandler, ListRenderItem, RefreshControl } from 'react-native'
import VideoItem, { videoItemSkeleton } from '~/features/video/VideoItem'
import Clipboard from '@react-native-clipboard/clipboard'
import User from '~/models/User'
import { ReelistScreen } from '~/utils/navigation'
import EditVideoListPage from './EditVideoListPage'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Video from '~/models/Video'
import _ from 'lodash'
import TrackedVideoItem from '../video/TrackedVideoItem'
import SegmentButton from '~/shared/components/SegmentButton'
import TileRow, { VideoChunk } from '~/shared/components/TileRow'

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

type ListViewTypes = 'list' | 'grid'

const VideoListScreen = observer(({ navigation }: ReelistScreen) => {
  const { videoListStore, auth, appState, videoStore } = useStore()
  const toast = useToast()

  const currentVideoList = videoListStore.currentVideoList

  const [editing, setEditing] = useState<boolean>(false)
  const [showMembers, setShowMembers] = useState(false)
  const [activeTabKey, setActiveTabKey] = useState<string | null>(null)
  const [loadingUserVideos, setLoadingUserVideos] = useState(false)
  const [trackedVideos, setTrackedVideos] = useState<Video[]>([])
  const [listViewType, setListViewType] = useState<ListViewTypes>('list')

  const {
    isOpen: isMembershipOpen,
    onOpen: openMembership,
    onClose: onMemebershipClose,
  } = useDisclose()

  const videoChunks = useMemo(() => {
    return _.chunk(currentVideoList?.videos, 3) as VideoChunk[]
  }, [currentVideoList?.videos])

  const renderVideo: ListRenderItem<Video> = ({ item: video }: { item: Video }) => (
    <VideoItem video={video} />
  )

  const renderVideoRow: ListRenderItem<VideoChunk> = ({ item: videos }: { item: VideoChunk }) => (
    <TileRow videos={videos} />
  )

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

  const ListHeaderComponent = useMemo(
    () => (
      <Row
        marginBottom="10px"
        display="flex"
        justifyContent="flex-end"
        width="100%"
        paddingX="10px"
      >
        <SegmentButton
          containerProps={{ width: '75px', height: 'auto' }}
          selectedSegmentId={listViewType === 'list' ? 'left' : 'right'}
          leftSegment={{ icon: <MaterialCommunityIcons name="view-list" /> }}
          rightSegment={{ icon: <MaterialCommunityIcons name="view-grid" /> }}
          size="sm"
          onPress={segmentId => {
            setListViewType(segmentId === 'left' ? 'list' : 'grid')
          }}
        />
      </Row>
    ),
    [listViewType],
  )

  if (!currentVideoList) return null

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

  const startEditing = () => {
    setEditing(true)
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

  const openProfile = (user: User) => {
    appState.setProfileScreenUser(user)

    navigation.push('profile')
  }

  if (editing)
    return (
      <EditVideoListPage
        currentVideoList={currentVideoList}
        closeEditPage={() => setEditing(false)}
      />
    )

  return (
    <View flex={1} backgroundColor="light.100">
      <Row marginY="10px">
        <Center flex={1}>
          <Text fontSize="2xl" adjustsFontSizeToFit numberOfLines={1}>
            {currentVideoList.name}
          </Text>
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
        listViewType === 'list' ? (
          <FlatList
            data={currentVideoList.videos}
            keyExtractor={(video: Video) => video.videoId}
            renderItem={renderVideo}
            key={listViewType}
            ListHeaderComponent={ListHeaderComponent}
          />
        ) : (
          <FlatList
            data={videoChunks}
            renderItem={renderVideoRow}
            key={listViewType}
            ListHeaderComponent={ListHeaderComponent}
          />
        )
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
          {!isUserListAdmin && currentVideoList.isJoinable && (
            <Actionsheet.Item
              onPress={join}
              _text={{ color: currentVideoList.isJoinable ? undefined : 'gray.600' }}
            >
              Join
            </Actionsheet.Item>
          )}

          <Actionsheet.Item onPress={() => setShowMembers(true)}>Members</Actionsheet.Item>

          {isUserListAdmin && (
            <Actionsheet.Item
              onPress={leave}
              _text={{ color: currentVideoList.adminIds.length > 1 ? undefined : 'gray.600' }}
            >
              Leave
            </Actionsheet.Item>
          )}

          {isUserListAdmin && <Actionsheet.Item onPress={startEditing}>Edit</Actionsheet.Item>}

          {auth.user.isFollowingVideoList(currentVideoList) ? (
            <Actionsheet.Item onPress={() => followOrUnfollowList(false)}>
              UnFollow
            </Actionsheet.Item>
          ) : (
            <Actionsheet.Item onPress={() => followOrUnfollowList(true)}>Follow</Actionsheet.Item>
          )}

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
