import React, { useState } from 'react'
import { ScrollView, Text, View } from 'native-base'
import { observer } from 'mobx-react-lite'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import VideoItem from '~/features/video/VideoItem'
import SearchBar from '~/shared/components/SearchBar'
import { ReelistScreen } from '~/utils/navigation'
import useAsyncState from '~/hooks/useAsyncState'
import { RefreshControl } from 'react-native'
import useVideoSearch from '~/hooks/useVideoSearch'

const SearchScreen = observer(({ navigation }: ReelistScreen) => {
  const [searchText, setSearchText] = useState('')
  const [searchErrors, setSearchError] = useState<string>('')
  const videoSearch = useVideoSearch()

  const [videos, search, loadingVideos] = useAsyncState([], async () => {
    try {
      return await videoSearch(searchText)
    } catch (e) {
      setSearchError(JSON.stringify(e))

      return []
    }
  })

  return (
    <View flex={1}>
      <ScrollView
        flex={1}
        color="white"
        refreshControl={<RefreshControl refreshing={loadingVideos} onRefresh={search} />}
        stickyHeaderIndices={[0]}
        stickyHeaderHiddenOnScroll
      >
        <SearchBar
          placeholder="Search Shows & Movies"
          leftIcon={<MaterialIcons name="search" />}
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={search}
          returnKeyType="search"
          backgroundColor="white"
          autoFocus
        />

        {searchErrors && <Text>{searchErrors}</Text>}

        {videos.map(video => (
          <VideoItem video={video} key={video.id} />
        ))}
      </ScrollView>
    </View>
  )
})

export default SearchScreen
