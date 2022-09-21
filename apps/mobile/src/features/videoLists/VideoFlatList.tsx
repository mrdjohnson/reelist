import React, { useEffect, useMemo, useState } from 'react'
import { Center, Column, Divider, FlatList, Icon, Menu, Pressable, Row, Text } from 'native-base'
import { useStore } from '~/hooks/useStore'
import { ListRenderItem, RefreshControl } from 'react-native'
import VideoItem, { videoItemSkeleton } from '~/features/video/VideoItem'
import User from '~/models/User'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Video from '~/models/Video'
import _ from 'lodash'
import TrackedVideoItem from '../video/TrackedVideoItem'
import SegmentButton from '~/shared/components/SegmentButton'
import TileRow, { VideoChunk } from '~/shared/components/TileRow'
import ActionButton from '~/shared/components/ActionButton'
import TotalTimeDetailsPanel from '~/shared/components/TotalTimeDetailsPanel'
import VideoList from '~/models/VideoList'
import { observer } from 'mobx-react-lite'

type ListViewTypes = 'list' | 'grid'
type SortTypes = null | 'alphaAsc' | 'alphaDesc' | 'releaseAsc' | 'releaseDesc'

type VideoFlatListProps = {
  videoList?: VideoList | null
  activeUser?: User | null
  onProgressPressed: () => void
}

const VideoFlatList = observer(
  ({ videoList, activeUser, onProgressPressed }: VideoFlatListProps) => {
    const { videoListStore, videoStore } = useStore()

    const [trackedVideos, setTrackedVideos] = useState<Video[]>([])
    const [isLoadingVideos, setIsLoadingVideos] = useState(false)
    const [listViewType, setListViewType] = useState<ListViewTypes>('list')
    const [sortType, setSortType] = useState<SortTypes>(null)

    const refreshVideoList = async () => {
      setIsLoadingVideos(true)

      videoList?.clearVideos()

      videoListStore.refreshCurrentVideoList()

      setIsLoadingVideos(false)
    }

    const formatVideos = (videos: Video[] | null | undefined): Video[] => {
      if (!videos) return []

      if (sortType === null) return videos

      if (sortType === 'alphaAsc') return _.orderBy(videos, 'videoName', 'asc')

      if (sortType === 'alphaDesc') return _.orderBy(videos, 'videoName', 'desc')

      if (sortType === 'releaseAsc') return _.orderBy(videos, 'videoReleaseDate', 'asc')

      return _.orderBy(videos, 'videoReleaseDate', 'desc')
    }

    const formattedVideos = useMemo(() => {
      return formatVideos(videoList?.videos)
    }, [videoList?.videos, sortType])

    const formattedTrackedVideos = useMemo(() => {
      return formatVideos(trackedVideos)
    }, [trackedVideos, sortType])

    const videoChunks = useMemo(() => {
      return _.chunk(formattedVideos, 3) as VideoChunk[]
    }, [formattedVideos])

    const trackedVideoChunks = useMemo(() => {
      return _.chunk(formattedTrackedVideos, 3) as VideoChunk[]
    }, [formattedTrackedVideos])

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
      <TileRow videos={videos} />
    )

    const renderTrackedVideo: ListRenderItem<Video> = ({ item: video }) => (
      <TrackedVideoItem video={video} isInteractable={false} />
    )

    const renderTrackedVideoRow: ListRenderItem<VideoChunk> = ({ item: videos }) => (
      <TileRow videos={videos} isTracked />
    )

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
                onPress={onProgressPressed}
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

    if (activeUser) {
      if (listViewType === 'list') {
        // user - list
        return (
          <FlatList
            data={formattedTrackedVideos}
            keyExtractor={video => video.videoId}
            renderItem={renderTrackedVideo}
            ListHeaderComponent={ListHeaderComponent}
            refreshControl={refreshControl}
          />
        )
      }

      // user - grid
      return (
        <FlatList
          data={trackedVideoChunks}
          renderItem={renderTrackedVideoRow}
          ListHeaderComponent={ListHeaderComponent}
          refreshControl={refreshControl}
        />
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
          ListHeaderComponent={ListHeaderComponent}
          refreshControl={refreshControl}
        />
      )
    }

    //overview - grid
    return (
      <FlatList
        data={videoChunks}
        renderItem={renderVideoRow}
        key={listViewType}
        ListHeaderComponent={ListHeaderComponent}
        refreshControl={refreshControl}
      />
    )
  },
)

export default VideoFlatList
