import React, { useState } from 'react'
import { ScrollView, Text, View } from 'native-base'
import { observer } from 'mobx-react-lite'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import VideoItem from '~/features/video/VideoItem'
import SearchBar from '~/shared/components/SearchBar'
import { ReelistScreenFrom } from '~/utils/navigation'
import useAsyncState from '@reelist/utils/hooks/useAsyncState'
import { RefreshControl } from 'react-native'
import useVideoSearch from '@reelist/utils/hooks/useVideoSearch'

const SearchScreen = observer(({ route, navigation }: ReelistScreenFrom<'search'>) => {
  const [searchText, setSearchText] = useState(route.params?.initialSearchValue || '')
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
        keyboardShouldPersistTaps="handled"
      >
        <SearchBar
          placeholder="Search Shows & Movies"
          leftIcon={<MaterialIcons name="search" />}
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={search}
          returnKeyType="search"
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
