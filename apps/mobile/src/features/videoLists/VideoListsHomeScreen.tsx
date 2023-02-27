import React, { useMemo, useState } from 'react'
import { Pressable, SectionList, Text, View } from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '@reelist/utils/hooks/useStore'
import VideoList from '@reelist/models/VideoList'
import { RefreshControl, SectionListData } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import _ from 'lodash'
import SearchBar from '~/shared/components/SearchBar'
import { ReelistScreen } from '~/utils/navigation'
import useRefresh from '~/hooks/useRefresh'
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

const VideoListsHomeScreen = observer(({ navigation }: ReelistScreen) => {
  const { videoListStore } = useStore()
  const publicVideoLists = videoListStore.publicVideoLists
  const adminVideoLists = videoListStore.adminVideoLists
  const followedVideoLists = videoListStore.followedVideoLists

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

  const isAdminVideoListsEmpty = _.isEmpty(filteredAdminLists)
  const isFollowedListsEmpty = _.isEmpty(filteredFollowedLists)
  const isPublicListsEmpty = _.isEmpty(filteredPublicLists)

  const data = []

  if (!isAdminVideoListsEmpty) {
    data.push({
      title: 'Admin Lists',
      data: filteredAdminLists,
    })
  }

  if (!refreshing) {
    if (!isFollowedListsEmpty) {
      data.push({
        title: 'Followed Lists',
        data: filteredFollowedLists,
      })
    }

    if (!isPublicListsEmpty) {
      data.push({
        title: 'Public Lists',
        data: filteredPublicLists,
      })
    }
  }

  const handleVideoListPress = (videoList: VideoList) => {
    console.log('open video list: ', videoList.name)
    videoListStore.setCurrentVideoList(videoList)
    navigation.navigate('videoListScreen')
  }

  const openCreatePage = () => {
    const nextVideoList = videoListStore.createBlankVideoList()
    videoListStore.setCurrentVideoList(nextVideoList)

    navigation.push('videoListScreenSettingsModal')
  }

  const renderSectionHeader = ({ section: { title } }: SectionListData<VideoList>) => {
    return <Text fontSize="lg">{title}</Text>
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

      {isAdminVideoListsEmpty && isFollowedListsEmpty && isPublicListsEmpty && (
        <Text fontSize="lg" textAlign="center">
          There are no lists to show
        </Text>
      )}

      <SectionList
        paddingY="5px"
        paddingX="10px"
        sections={data}
        keyExtractor={(item, index) => item.id}
        renderItem={({ item: videoList }) => (
          <VideoListListItem videoList={videoList} onVideoListPress={handleVideoListPress} />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View backgroundColor="light.300:alpha.70" rounded="sm">
            <Text fontSize="xl" marginLeft="10px">
              {title}
            </Text>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      />

      <AppButton onPress={openCreatePage} margin="10px">
        Create List
      </AppButton>
    </View>
  )
})

export default VideoListsHomeScreen
