import React, { useEffect, useMemo, useState } from 'react'
import {
  Actionsheet,
  Center,
  Column,
  Divider,
  FlatList,
  Icon,
  Menu,
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
import ActionButton from '~/shared/components/ActionButton'
import VideoListDetailsSection from './VideoListDetailsSection'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import DetailsPanel from '~/shared/components/DetailsPanel'
import TotalTimeDetailsPanel from '~/shared/components/TotalTimeDetailsPanel'

const CAN_GO_BACK = false
const CANNOT_GO_BACK = true

type ListViewTypes = 'list' | 'grid'
type SortTypes = null | 'alphaAsc' | 'alphaDesc' | 'releaseAsc' | 'releaseDesc'

const VideoListScreen = observer(({ navigation }: ReelistScreen) => {
  const { videoListStore, auth, appState, videoStore } = useStore()
  const toast = useToast()

  const currentVideoList = videoListStore.currentVideoList

  const [editing, setEditing] = useState<boolean>(false)
  const [showMembers, setShowMembers] = useState(false)
  const [activeUser, setActiveUser] = useState<User | null>(null)
  const [isLoadingVideos, setIsLoadingVideos] = useState(false)
  const [trackedVideos, setTrackedVideos] = useState<Video[]>([])
  const [listViewType, setListViewType] = useState<ListViewTypes>('list')
  const [sortType, setSortType] = useState<SortTypes>(null)
  const [isSelectingProgress, setIsSelectingProgress] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const {
    isOpen: isMembershipOpen,
    onOpen: openMembership,
    onClose: onMemebershipClose,
  } = useDisclose()

  const formatVideos = (videos: Video[] | null | undefined): Video[] => {
    if (!videos) return []

    if (sortType === null) return videos

    if (sortType === 'alphaAsc') return _.orderBy(videos, 'videoName', 'asc')

    if (sortType === 'alphaDesc') return _.orderBy(videos, 'videoName', 'desc')

    if (sortType === 'releaseAsc') return _.orderBy(videos, 'videoReleaseDate', 'asc')

    return _.orderBy(videos, 'videoReleaseDate', 'desc')
  }

  const formattedVideos = useMemo(() => {
    return formatVideos(currentVideoList?.videos)
  }, [currentVideoList?.videos, sortType])

  const formattedTrackedVideos = useMemo(() => {
    return formatVideos(trackedVideos)
  }, [trackedVideos, sortType])

  const videoChunks = useMemo(() => {
    return _.chunk(formattedVideos, 3) as VideoChunk[]
  }, [formattedVideos])

  const trackedVideoChunks = useMemo(() => {
    return _.chunk(formattedTrackedVideos, 3) as VideoChunk[]
  }, [formattedTrackedVideos])

  const renderVideo: ListRenderItem<Video> = ({ item: video }: { item: Video }) => (
    <VideoItem video={video} />
  )

  const renderVideoRow: ListRenderItem<VideoChunk> = ({ item: videos }: { item: VideoChunk }) => (
    <TileRow videos={videos} />
  )

  const renderTrackedVideo: ListRenderItem<Video> = ({ item: video }: { item: Video }) => (
    <TrackedVideoItem video={video} isInteractable={false} />
  )

  const renderTrackedVideoRow: ListRenderItem<VideoChunk> = ({
    item: videos,
  }: {
    item: VideoChunk
  }) => <TileRow videos={videos} isTracked />

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
    setIsLoadingVideos(true)

    const videos = await videoStore.getVideoProgressesForUser(
      activeUser,
      currentVideoList?.videoIds,
    )

    setIsLoadingVideos(false)
    setTrackedVideos(videos)
  }

  useEffect(() => {
    if (!activeUser) return _.noop

    loadVideosForUser()

    return () => {
      setIsLoadingVideos(false)
      setTrackedVideos([])
    }
  }, [activeUser, currentVideoList])

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

  const ListHeaderComponent = useMemo(() => {
    let iconName: string
    if (sortType === null) {
      iconName = 'sort-variant'
    } else if (sortType === 'alphaAsc') {
      iconName = 'sort-alphabetical-ascending'
    } else if (sortType === 'alphaDesc') {
      iconName = 'sort-alphabetical-descending'
    } else if (sortType === 'releaseAsc') {
      iconName = 'sort-calendar-ascending'
    } else {
      iconName = 'sort-calendar-descending'
    }

    return (
      <Column>
        <Row
          marginBottom="10px"
          display="flex"
          justifyContent="space-between"
          width="100%"
          paddingX="10px"
        >
          <Row>
            <Menu
              trigger={triggerProps => {
                return (
                  <Pressable {...triggerProps} alignSelf="center" rounded="full">
                    <Icon as={<MaterialCommunityIcons name={iconName} />} />
                  </Pressable>
                )
              }}
              placement="bottom left"
            >
              <Menu.Item textAlign="center" onPress={() => setSortType(null)}>
                <Icon as={<MaterialCommunityIcons name={'sort-variant-remove'} />} />
                <Text>Clear Sort</Text>
              </Menu.Item>

              <Divider mt="3" w="100%" />

              <Menu.Group title="Name">
                <Menu.Item onPress={() => setSortType('alphaAsc')}>
                  <Icon as={<MaterialCommunityIcons name={'sort-alphabetical-ascending'} />} />
                  <Text>Ascending</Text>
                </Menu.Item>

                <Menu.Item onPress={() => setSortType('alphaDesc')}>
                  <Icon as={<MaterialCommunityIcons name={'sort-alphabetical-descending'} />} />
                  <Text>Descending</Text>
                </Menu.Item>
              </Menu.Group>

              <Divider mt="3" w="100%" />

              <Menu.Group title="Release Date">
                <Menu.Item onPress={() => setSortType('releaseAsc')}>
                  <Icon as={<MaterialCommunityIcons name={'sort-calendar-ascending'} />} />
                  <Text>Ascending</Text>
                </Menu.Item>

                <Menu.Item onPress={() => setSortType('releaseDesc')}>
                  <Icon as={<MaterialCommunityIcons name={'sort-calendar-descending'} />} />
                  <Text>Descending</Text>
                </Menu.Item>
              </Menu.Group>
            </Menu>

            <ActionButton
              marginLeft="10px"
              size="sm"
              icon={
                <MaterialCommunityIcons
                  name={activeUser ? 'account-details' : 'account-question-outline'}
                />
              }
              onPress={() => {
                setShowMembers(true)
                setIsSelectingProgress(true)
                openMembership()
              }}
            >
              {activeUser ? activeUser?.name || 'Nobody' : 'See Progress'}
            </ActionButton>
          </Row>

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

        {activeUser && (
          <TotalTimeDetailsPanel marginX="10px" user={activeUser} videos={trackedVideos} />
        )}
      </Column>
    )
  }, [listViewType, sortType, activeUser, trackedVideos])

  if (!currentVideoList) return null

  const refreshVideoList = async () => {
    setIsLoadingVideos(true)

    currentVideoList.clearVideos()

    videoListStore.refreshCurrentVideoList()

    setIsLoadingVideos(false)
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

  if (editing)
    return (
      <EditVideoListPage
        currentVideoList={currentVideoList}
        closeEditPage={() => setEditing(false)}
      />
    )

  let content

  if (showDetails) {
    content = <VideoListDetailsSection videoList={currentVideoList} />
  } else {
    content = (
      <>
        {currentVideoList.videoIds.length === 0 && (
          <Center>
            <Text>Nothing has been added here yet</Text>
          </Center>
        )}

        {formattedVideos.length === 0 && (
          <FlatList
            data={currentVideoList.videoIds}
            keyExtractor={videoId => videoId}
            renderItem={() => videoItemSkeleton}
          />
        )}

        {!activeUser ? (
          listViewType === 'list' ? (
            <FlatList
              data={formattedVideos}
              keyExtractor={(video: Video) => video.videoId}
              renderItem={renderVideo}
              key={listViewType}
              ListHeaderComponent={ListHeaderComponent}
              refreshControl={
                <RefreshControl refreshing={isLoadingVideos} onRefresh={refreshVideoList} />
              }
            />
          ) : (
            <FlatList
              data={videoChunks}
              renderItem={renderVideoRow}
              key={listViewType}
              ListHeaderComponent={ListHeaderComponent}
              refreshControl={
                <RefreshControl refreshing={isLoadingVideos} onRefresh={refreshVideoList} />
              }
            />
          )
        ) : listViewType === 'list' ? (
          <FlatList
            data={formattedTrackedVideos}
            keyExtractor={video => video.videoId}
            renderItem={renderTrackedVideo}
            ListHeaderComponent={ListHeaderComponent}
            refreshControl={
              <RefreshControl refreshing={isLoadingVideos} onRefresh={loadVideosForUser} />
            }
          />
        ) : (
          <FlatList
            data={trackedVideoChunks}
            renderItem={renderTrackedVideoRow}
            ListHeaderComponent={ListHeaderComponent}
            refreshControl={
              <RefreshControl refreshing={isLoadingVideos} onRefresh={loadVideosForUser} />
            }
          />
        )}
      </>
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

          {showDetails || <Actionsheet.Item onPress={openDetailsPanel}>Details</Actionsheet.Item>}

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
          {isSelectingProgress && (
            <>
              <Actionsheet.Item
                onPress={() => {
                  setActiveUser(null)
                  closeMemberShipActionSheet()
                }}
                backgroundColor={activeUser === null ? 'light.300:alpha.40' : null}
              >
                None (video overview)
              </Actionsheet.Item>

              <Actionsheet.Item
                onPress={() => {
                  setActiveUser(auth.user)
                  closeMemberShipActionSheet()
                }}
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
              onPress={() => {
                if (isSelectingProgress) {
                  setActiveUser(admin)
                  closeMemberShipActionSheet()
                  return
                }

                openProfile(admin)
              }}
            >
              {admin.name}
            </Actionsheet.Item>
          ))}
        </Actionsheet.Content>
      </Actionsheet>
    </View>
  )
})

export default VideoListScreen
