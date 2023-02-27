import React, { useEffect, useMemo, useState } from 'react'
import {
  Center,
  Column,
  Divider,
  FlatList,
  Icon,
  Menu,
  Pressable,
  Row,
  Text,
  View,
} from 'native-base'
import { useStore } from '@reelist/utils/hooks/useStore'
import { ListRenderItem, RefreshControl } from 'react-native'
import VideoItem, { videoItemSkeleton } from '~/features/video/VideoItem'
import User from '@reelist/models/User'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Video from '@reelist/models/Video'
import _ from 'lodash'
import TrackedVideoItem from '../video/TrackedVideoItem'
import SegmentButton from '~/shared/components/SegmentButton'
import ThreeTileRow, { VideoChunk } from '~/shared/components/ThreeTileRow'
import ActionButton from '~/shared/components/ActionButton'
import TotalTimeDetailsPanel from '~/shared/components/TotalTimeDetailsPanel'
import VideoList from '@reelist/models/VideoList'
import { observer } from 'mobx-react-lite'

type ListViewTypes = 'list' | 'grid'
type SortTypes = 'none' | 'alphaAsc' | 'alphaDesc' | 'releaseAsc' | 'releaseDesc'

const iconNameBySortType: Record<SortTypes, string> = {
  none: 'sort-variant',

  alphaAsc: 'sort-alphabetical-ascending',
  alphaDesc: 'sort-alphabetical-descending',

  releaseAsc: 'sort-calendar-ascending',
  releaseDesc: 'sort-calendar-descending',
}

type VideoFlatListProps = {
  videoList?: VideoList | null
  activeUser?: User | null
  onProgressPressed: () => void
}

const formatVideos = (videos: Video[] | null | undefined, sortType: SortTypes): Video[] => {
  if (!videos) return []

  if (sortType === 'none') return videos

  if (sortType === 'alphaAsc') return _.orderBy(videos, 'videoName', 'asc')

  if (sortType === 'alphaDesc') return _.orderBy(videos, 'videoName', 'desc')

  if (sortType === 'releaseAsc') return _.orderBy(videos, 'videoReleaseDate', 'asc')

  return _.orderBy(videos, 'videoReleaseDate', 'desc')
}

const VideoFlatList = observer(
  ({ videoList, activeUser, onProgressPressed }: VideoFlatListProps) => {
    const { videoListStore, videoStore, auth } = useStore()

    const [trackedVideos, setTrackedVideos] = useState<Video[]>([])
    const [isLoadingVideos, setIsLoadingVideos] = useState(false)
    const [listViewType, setListViewType] = useState<ListViewTypes>('list')
    const [sortType, setSortType] = useState<SortTypes>('none')

    const useInteractibleTiles = activeUser?.id === auth.user.id

    const refreshVideoList = async () => {
      setIsLoadingVideos(true)

      videoList?.clearVideos()

      videoListStore.refreshCurrentVideoList()

      setIsLoadingVideos(false)
    }

    const formattedVideos = useMemo(() => {
      return formatVideos(videoList?.videos, sortType)
    }, [videoList?.videos, sortType])

    const formattedTrackedVideos = useMemo(() => {
      return formatVideos(trackedVideos, sortType)
    }, [trackedVideos, sortType])

    const videoChunks = useMemo(() => {
      if (listViewType !== 'grid') return []

      return _.chunk(formattedVideos, 3) as VideoChunk[]
    }, [formattedVideos, listViewType])

    const trackedVideoChunks = useMemo(() => {
      if (listViewType !== 'grid') return []

      return _.chunk(formattedTrackedVideos, 3) as VideoChunk[]
    }, [formattedTrackedVideos, listViewType])

    const loadVideosForUser = async () => {
      setIsLoadingVideos(true)

      const videos = await videoStore.getVideoProgressesForUser(
        activeUser || null,
        videoList?.videoIds,
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
    }, [activeUser, videoList])

    const renderVideo: ListRenderItem<Video> = ({ item: video }) => <VideoItem video={video} />

    const renderVideoRow: ListRenderItem<VideoChunk> = ({ item: videos }) => (
      <ThreeTileRow videos={videos} />
    )

    const renderTrackedVideo: ListRenderItem<Video> = ({ item: video }) => (
      <TrackedVideoItem video={video} isInteractable={useInteractibleTiles} />
    )

    const renderTrackedVideoRow: ListRenderItem<VideoChunk> = ({ item: videos }) => (
      <ThreeTileRow videos={videos} isTracked />
    )

    const ListHeaderComponent = useMemo(() => {
      const iconName = iconNameBySortType[sortType]

      return (
        <Column>
          <Row
            paddingBottom="10px"
            display="flex"
            justifyContent="space-between"
            width="100%"
            paddingX="10px"
            backgroundColor="light.100"
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
                <Menu.Item textAlign="center" onPress={() => setSortType('none')}>
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
                onPress={onProgressPressed}
              >
                {activeUser ? activeUser?.name || 'Nobody' : 'See Progress'}
              </ActionButton>
            </Row>

            <SegmentButton
              containerProps={{ width: '75px', height: 'auto' }}
              selectedSegmentIndex={listViewType === 'list' ? 0 : 1}
              segments={[
                { icon: <MaterialCommunityIcons name="view-list" /> },
                { icon: <MaterialCommunityIcons name="view-grid" /> },
              ]}
              size="sm"
              onPress={segmentId => {
                setListViewType(segmentId === 0 ? 'list' : 'grid')
              }}
            />
          </Row>

          {activeUser && (
            <View backgroundColor="light.100" paddingBottom="10px">
              <TotalTimeDetailsPanel marginX="10px" user={activeUser} videos={trackedVideos} />
            </View>
          )}
        </Column>
      )
    }, [listViewType, sortType, activeUser, trackedVideos])

    if (videoList?.videoIds.length === 0) {
      return (
        <Center>
          <Text>Nothing has been added here yet</Text>
        </Center>
      )
    }

    if (formattedVideos.length === 0) {
      return (
        <FlatList
          data={videoList?.videoIds}
          keyExtractor={videoId => videoId}
          renderItem={() => videoItemSkeleton}
        />
      )
    }

    const refreshControl = (
      <RefreshControl refreshing={isLoadingVideos} onRefresh={refreshVideoList} />
    )

    const flatListProps = {
      ListHeaderComponent,
      refreshControl,
      stickyHeaderHiddenOnScroll: true,
      stickyHeaderIndices: [0],
    }

    if (activeUser) {
      if (listViewType === 'list') {
        // user - list
        return (
          <FlatList
            data={formattedTrackedVideos}
            keyExtractor={video => video.videoId}
            renderItem={renderTrackedVideo}
            {...flatListProps}
          />
        )
      }

      // user - grid
      return (
        <FlatList data={trackedVideoChunks} renderItem={renderTrackedVideoRow} {...flatListProps} />
      )
    }

    if (listViewType === 'list') {
      // overview - list
      return (
        <FlatList
          data={formattedVideos}
          keyExtractor={(video: Video) => video.videoId}
          renderItem={renderVideo}
          key={listViewType}
          {...flatListProps}
        />
      )
    }

    //overview - grid
    return (
      <FlatList
        data={videoChunks}
        renderItem={renderVideoRow}
        key={listViewType}
        {...flatListProps}
      />
    )
  },
)

export default VideoFlatList
