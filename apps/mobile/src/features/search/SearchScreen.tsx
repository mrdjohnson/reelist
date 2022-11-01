import React, { useState } from 'react'
import { ScrollView, Text, View } from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '~/hooks/useStore'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Video from '~/models/Video'
import { callTmdb } from '~/api/api'
import _ from 'lodash'
import VideoItem from '~/features/video/VideoItem'
import SearchBar from '~/shared/components/SearchBar'
import { ReelistScreen } from '~/utils/navigation'
import useAsyncState from '~/hooks/useAsyncState'

const SearchScreen = observer(({ navigation }: ReelistScreen) => {
  const [searchText, setSearchText] = useState('')
  const { auth, videoStore } = useStore()
  const [searchErrors, setSearchError] = useState<string>('')

  const [videos, search, loadingVideos] = useAsyncState([], async () => {
    const searchResults = await callTmdb('/search/multi', searchText)
      .then(item => _.get(item, 'data.data.results') as Video[] | null)
      .catch(e => {
        setSearchError(JSON.stringify(e))
      })

    if (!searchResults) return []

    return searchResults
      .filter(searchResult => ['movie', 'tv'].includes(searchResult.mediaType))
      .map(video => {
        return new Video(video, auth, videoStore)
      })
  })

  return (
    <View flex={1}>
      <SearchBar
        placeholder="Search Shows & Movies"
        leftIcon={<MaterialIcons name="search" />}
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
