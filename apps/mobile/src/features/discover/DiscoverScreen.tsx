import React, { useEffect, useState } from 'react'
import { ScrollView, Text, View } from 'native-base'
import { observer } from 'mobx-react-lite'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import VideoItem from '~/features/video/VideoItem'
import SearchBar from '~/shared/components/SearchBar'
import { ReelistScreenFrom } from '~/utils/navigation'
import useAsyncState from '@reelist/utils/hooks/useAsyncState'
import { RefreshControl } from 'react-native'
import useVideoSearch from '@reelist/utils/hooks/useVideoSearch'
import useVideoDiscover from '@reelist/utils/hooks/useVideoDiscover'
import NamedTileRow from '~/shared/components/NamedTileRow'
import _ from 'lodash'

const DiscoverScreen = observer(({ route }: ReelistScreenFrom<'discover'>) => {
  const [searchText, setSearchText] = useState(route.params?.initialSearchValue || '')
  const [searchErrors, setSearchError] = useState<string>('')

  const {
    selectStatesLoaded,
    clearHomepageVideos,
    homepageSections,
    fetchHomepageVideos,
    isLoadingHomepageSections,
  } = useVideoDiscover()

  const videoSearch = useVideoSearch()

  const [videos, search, loadingVideos] = useAsyncState([], async () => {
    try {
      return await videoSearch(searchText)
    } catch (e) {
      setSearchError(JSON.stringify(e))

      return []
    }
  })

  useEffect(() => {
    if (selectStatesLoaded) {
      fetchHomepageVideos()
    }
  }, [selectStatesLoaded])

  const onRefresh = () => {
    if (searchText) {
      search()
    } else {
      clearHomepageVideos()
      fetchHomepageVideos()
    }
  }

  return (
    <View flex={1}>
      <ScrollView
        flex={1}
        color="white"
        refreshControl={
          <RefreshControl
            refreshing={loadingVideos || isLoadingHomepageSections}
            onRefresh={onRefresh}
          />
        }
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
        />

        {searchErrors && <Text>{searchErrors}</Text>}

        {searchText
          ? videos.map(video => <VideoItem video={video} key={video.id} />)
          : _.keys(popularGenereTitleByName).map(name => (
              <NamedTileRow
                key={name}
                label={popularGenereTitleByName[name]}
                videos={homepageSections[name]}
                showMoreText={'See more ' + popularGenereTitleByName[name]}
                allowFiltering={false}
              />
            ))}
      </ScrollView>
    </View>
  )
})

// hard coded popular generes
const popularGeneresIdsByName = {
  base: [],
  comedy: ['shared:35'],
  actionAndAdventure: ['tv:10759', 'movie:28', 'movie:12'],
  drama: ['shared:18'],
  horror: ['shared:9648'],
  scifi: ['tv:10765', 'movie:878', 'movie:14'],
}

const popularGenereTitleByName = {
  base: '',
  comedy: 'Comedy',
  actionAndAdventure: 'Action & Adventure',
  drama: 'Drama',
  horror: 'Mystery',
  scifi: 'Sci-fi & Fantasy',
}

export default DiscoverScreen
