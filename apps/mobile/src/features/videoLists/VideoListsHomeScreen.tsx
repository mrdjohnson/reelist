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
import useRefresh from '~/hooks/useRefresh'

const VideoListListItem = observer(
  ({
    videoList,
    onVideoListPress,
  }: {
    videoList: VideoList
    onVideoListPress: (videoList: VideoList) => void
  }) => {
    return (
      <Pressable
        onPress={() => onVideoListPress(videoList)}
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

  const [creatingList, setCreatingList] = useState<boolean>(false)
  const [nextListName, setNextListName] = useState('')
  const [nextListIsPublic, setListIsPublic] = useState(true)
  const [filterText, setfilterText] = useState('')

  const [filteredAdminLists, filteredPublicLists] = useMemo(() => {
    const lowerFilterCase = filterText.toLowerCase()
    const containsFilterText = (videoList: VideoList) => {
      return videoList.name.toLowerCase().includes(lowerFilterCase)
    }

    const filteredAdmin = _.filter(adminVideoLists, containsFilterText)
    const filteredPublic = _.filter(publicVideoLists, containsFilterText)

    return [filteredAdmin, filteredPublic]
  }, [adminVideoLists, publicVideoLists, filterText])

  const [refreshing, refresh] = useRefresh(async () => {
    videoListStore.clearVideoLists()

    videoListStore.getPublicVideoLists()
    return videoListStore.getAdminVideoLists()
  })

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
    <View flex={1} justifyContent="space-between">
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
              <VideoListListItem videoList={videoList} onVideoListPress={handleVideoListPress} />
            )}
            renderSectionHeader={({ section: { title } }) => (
              <View backgroundColor="light.300">
                <Text fontSize="xl">{title} title</Text>
              </View>
            )}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
          />

          <Button onPress={() => setCreatingList(true)}>Create List</Button>
        </>
      )}
    </View>
  )
})

export default VideoListsHomeScreen