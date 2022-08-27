import React, { useEffect, useMemo, useState } from 'react'
import { Button, Input, Pressable, ScrollView, SectionList, Text, View, Icon } from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '~/hooks/useStore'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import VideoList from '~/models/VideoList'
import {
  NativeSyntheticEvent,
  SectionListData,
  TextInputChangeEventData,
  TextInputSubmitEditingEventData,
} from 'react-native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Video from '~/models/Video'
import { callTmdb } from '~/api/api'
import _ from 'lodash'
import VideoItem from '~/features/video/VideoItem'
import SearchBar from '~/shared/components/SearchBar'

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

const SearchScreen = observer(({ navigation }: NativeStackScreenProps<any>) => {
  const [searchText, setSearchText] = useState('')
  const [videos, setVideos] = useState<Video[]>([])
  const [loadingVideos, setLoadingVideos] = useState(false)
  const { auth } = useStore()
  const [searchErrors, setSearchError] = useState<string>('')

  const search = async (event: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
    console.log('Searched for:', event.nativeEvent.text)

    setLoadingVideos(true)
    setVideos([])

    const searchResults = await callTmdb('/search/multi', event.nativeEvent.text)
      .then(item => _.get(item, 'data.data.results') as Video[] | null)
      .catch(e => {
        setSearchError(JSON.stringify(e))
      })
      .finally(() => {
        setLoadingVideos(false)
      })

    if (!searchResults) return

    const nextVideos = searchResults
      .filter(searchResult => ['movie', 'tv'].includes(searchResult.mediaType))
      .map(video => {
        return new Video(video, auth)
      })

    setVideos(nextVideos)
  }

  const handleSearchBarRightIconPressed = (isFocused?: boolean) => {
    if (isFocused) {
      setSearchText('')
    }
  }

  return (
    <View flex={1} backgroundColor="white">
      <SearchBar
        placeholder="Search Shows & Movies"
        leftIcon={<MaterialIcons name="search" />}
        rightIconUnFocused={<MaterialIcons name="settings" />}
        onRightIconPress={handleSearchBarRightIconPressed}
        value={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={search}
        returnKeyType="search"
        autoFocus
      />

      <ScrollView flex={1} color="white">
        {loadingVideos && <Text>Loading Videos</Text>}
        {searchErrors && <Text>{searchErrors}</Text>}

        {videos.map(video => (
          <VideoItem video={video} key={video.id} />
        ))}
      </ScrollView>
    </View>
  )
})

export default SearchScreen
