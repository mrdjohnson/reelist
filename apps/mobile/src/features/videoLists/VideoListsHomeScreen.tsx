import React, { useEffect, useMemo, useState } from 'react'
import {
  Button,
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
import EditVideoListPage from './EditVideoListPage'
import AppButton from '~/shared/components/AppButton'

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
  const followedVideoLists = videoListStore.followedVideoLists

  const [nextVideoList, setNextVideoList] = useState<VideoList | null>(null)
  const [filterText, setfilterText] = useState('')

  const [filteredAdminLists, filteredPublicLists, filteredFollowedLists] = useMemo(() => {
    const lowerFilterCase = filterText.toLowerCase()
    const containsFilterText = (videoList: VideoList) => {
      return videoList.name.toLowerCase().includes(lowerFilterCase)
    }

    const filteredAdmin = _.filter(adminVideoLists, containsFilterText)
    const filteredPublic = _.filter(publicVideoLists, containsFilterText)
    const filteredFollowed = _.filter(followedVideoLists, containsFilterText)

    return [filteredAdmin, filteredPublic, filteredFollowed]
  }, [adminVideoLists, publicVideoLists, followedVideoLists, filterText])

  const [refreshing, refresh] = useRefresh(async () => {
    videoListStore.clearVideoLists()

    await videoListStore.getAdminVideoLists()

    await videoListStore.getfollowedVideoLists()
    await videoListStore.getPublicVideoLists()
  })

  useEffect(() => {
    const onBackButtonPressed = () => {
      if (nextVideoList) {
        setNextVideoList(null)

        return CANNOT_GO_BACK
      }

      return CAN_GO_BACK
    }

    BackHandler.addEventListener('hardwareBackPress', onBackButtonPressed)

    return () => BackHandler.removeEventListener('hardwareBackPress', onBackButtonPressed)
  }, [nextVideoList])

  const data = []

  if (adminVideoLists.length > 0) {
    data.push({
      title: 'Admin Lists',
      data: filteredAdminLists,
    })
  }

  if (!refreshing) {
    if (followedVideoLists.length > 0) {
      data.push({
        title: 'Followed Lists',
        data: filteredFollowedLists,
      })
    }

    data.push({
      title: 'Public Lists',
      data: filteredPublicLists,
    })
  }

  const handleVideoListPress = (videoList: VideoList) => {
    console.log('open video list: ', videoList.name)
    videoListStore.setCurrentVideoList(videoList)
    navigation.navigate('videoListScreen')
  }

  const renderSectionHeader = ({ section: { title } }: SectionListData<VideoList>) => {
    return <Text fontSize="lg">{title}</Text>
  }

  if (nextVideoList) {
    return (
      <EditVideoListPage
        currentVideoList={nextVideoList}
        closeEditPage={() => setNextVideoList(null)}
      />
    )
  }

  return (
    <View flex={1} justifyContent="space-between">
      <SearchBar
        placeholder="Filter Lists"
        leftIcon={<MaterialCommunityIcons name="filter-outline" />}
        value={filterText}
        onChangeText={setfilterText}
        returnKeyType="search"
        autoCapitalize="none"
      />

      <SectionList
        paddingY="5px"
        paddingX="10px"
        sections={data}
        keyExtractor={(item, index) => item.id}
        renderItem={({ item: videoList }) => (
          <VideoListListItem videoList={videoList} onVideoListPress={handleVideoListPress} />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View backgroundColor="light.300">
            <Text fontSize="xl" marginLeft="10px">
              {title}
            </Text>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      />

      <AppButton
        onPress={() => setNextVideoList(videoListStore.createBlankVideoList())}
        margin="10px"
      >
        Create List
      </AppButton>
    </View>
  )
})

export default VideoListsHomeScreen
