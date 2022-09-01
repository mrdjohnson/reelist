import React, { useEffect, useMemo, useState } from 'react'
import {
  Button,
  HStack,
  Input,
  Pressable,
  ScrollView,
  SectionList,
  Switch,
  Text,
  View,
  Icon,
} from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '~/hooks/useStore'
import VideoList from '~/models/VideoList'
import { BackHandler, RefreshControl, SectionListData } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import _ from 'lodash'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import SearchBar from '~/shared/components/SearchBar'
import { ReelistScreen } from '~/utils/navigation'

const VideoListListItem = observer(
  ({
    videoList,
    currentVideoListId,
    onVideoListPress,
  }: {
    videoList: VideoList
    currentVideoListId: string | undefined
    onVideoListPress: (videoList: VideoList) => void
  }) => {
    return (
      <Pressable
        onPress={() => onVideoListPress(videoList)}
        backgroundColor={currentVideoListId === videoList.id ? 'amber.200' : undefined}
        flexDirection="row"
        alignItems="center"
      >
        <Icon name="playlist-star" color="#4F8EF7" size={30} />

        <Text margin={'10px'} fontSize="md" height="auto">
          {videoList.name}
        </Text>
      </Pressable>
    )
  },
)

const CAN_GO_BACK = false
const CANNOT_GO_BACK = true

const VideoListsHomeScreen = observer(({ navigation }: ReelistScreen) => {
  const { videoListStore } = useStore()
  const publicVideoLists = videoListStore.publicVideoLists
  const adminVideoLists = videoListStore.adminVideoLists
  const currentVideoListId = videoListStore.currentVideoList?.id

  const [creatingList, setCreatingList] = useState<boolean>(false)
  const [nextListName, setNextListName] = useState('')
  const [nextListIsPublic, setListIsPublic] = useState(true)
  const [filterText, setfilterText] = useState('')
  const [refreshing, setRefreshing] = useState(true)

  const [filteredAdminLists, filteredPublicLists] = useMemo(() => {
    const lowerFilterCase = filterText.toLowerCase()
    const containsFilterText = (videoList: VideoList) => {
      return videoList.name.toLowerCase().includes(lowerFilterCase)
    }

    const filteredAdmin = _.filter(adminVideoLists, containsFilterText)
    const filteredPublic = _.filter(publicVideoLists, containsFilterText)

    return [filteredAdmin, filteredPublic]
  }, [adminVideoLists, publicVideoLists, filterText])

  const refreshVideoLists = async () => {
    videoListStore.clearVideoLists()

    try {
      await Promise.race([
        videoListStore.getAdminVideoLists(),
        videoListStore.getPublicVideoLists(),
      ])
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (refreshing) {
      refreshVideoLists()
    }
  }, [refreshing])

  useEffect(() => {
    const onBackButtonPressed = () => {
      if (creatingList) {
        setCreatingList(false)

        return CANNOT_GO_BACK
      }

      return CAN_GO_BACK
    }

    BackHandler.addEventListener('hardwareBackPress', onBackButtonPressed)

    return () => BackHandler.removeEventListener('hardwareBackPress', onBackButtonPressed)
  }, [creatingList])

  const data = []

  if (adminVideoLists.length > 0) {
    data.push({
      title: 'Admin Lists',
      data: filteredAdminLists,
    })
  }

  data.push({
    title: 'Public Lists',
    data: filteredPublicLists,
  })

  const handleVideoListPress = (videoList: VideoList) => {
    console.log('open video list: ', videoList.name)
    videoListStore.setCurrentVideoList(videoList)
    navigation.navigate('videoListScreen')
  }

  const handleCreateList = () => {
    videoListStore
      .createVideoList(nextListName, nextListIsPublic)
      .then(() => setCreatingList(false))
  }

  const renderSectionHeader = ({ section: { title } }: SectionListData<VideoList>) => {
    return <Text fontSize="lg">{title}</Text>
  }

  return (
    <View flex={1} justifyContent="space-between" backgroundColor="white">
      {creatingList ? (
        <>
          <Text>Create List</Text>

          <Input placeholder="List name" onChangeText={setNextListName} value={nextListName} />

          <HStack>
            <Text>Is List Public?</Text>

            <Switch value={nextListIsPublic} onToggle={() => setListIsPublic(!nextListIsPublic)} />
          </HStack>

          <Button onPress={handleCreateList}>Create List</Button>

          <Button onPress={() => setCreatingList(false)}>Cancel</Button>
        </>
      ) : (
        <>
          <SearchBar
            placeholder="Filter Lists"
            leftIcon={<MaterialCommunityIcons name="filter-outline" />}
            value={filterText}
            onChangeText={setfilterText}
            returnKeyType="search"
            autoCapitalize="none"
          />

          <SectionList
            padding="10px"
            sections={data}
            keyExtractor={(item, index) => item.id}
            renderItem={({ item: videoList }) => (
              <VideoListListItem
                videoList={videoList}
                currentVideoListId={currentVideoListId}
                onVideoListPress={handleVideoListPress}
              />
            )}
            renderSectionHeader={({ section: { title } }) => (
              <View backgroundColor="light.300">
                <Text fontSize="xl">{title} title</Text>
              </View>
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} />
            }
          />

          <Button onPress={() => setCreatingList(true)}>Create List</Button>
        </>
      )}
    </View>
  )
})

export default VideoListsHomeScreen
