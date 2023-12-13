import React, { useEffect, useMemo, useState } from 'react'
import { ScrollView, Text, View } from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '@reelist/utils/hooks/useStore'
import _ from 'lodash'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import TrackedVideoItem from '~/features/video/TrackedVideoItem'
import SearchBar from '~/shared/components/SearchBar'
import { ReelistScreen } from '~/utils/navigation'
import { RefreshControl } from 'react-native'
import useAsyncState from '@reelist/utils/hooks/useAsyncState'
import useVideoSearch from '@reelist/utils/hooks/useVideoSearch'
import NamedTileRow from '~/shared/components/NamedTileRow'
import { TmdbVideoPartialType } from '@reelist/interfaces/tmdb/TmdbVideoPartialType'
import LoginButton from '~/components/LoginButton'

const TrackingScreen = observer(({ navigation }: ReelistScreen) => {
  const [filterText, setfilterText] = useState('')
  const { auth, videoStore } = useStore()
  const videoSearch = useVideoSearch()

  const [videos, refresh, loadingVideos] = useAsyncState([], () => videoStore.getTrackedVideos())
  const [searchedVideos, setSearchedVideos] = useState<TmdbVideoPartialType[]>([])

  const sortedVideos = useMemo(() => {
    const lowerCaseText = _.toLower(filterText)
    const filteredVideos = _.filter(videos, video =>
      _.toLower(video.videoName).includes(lowerCaseText),
    )

    return filteredVideos.sort((videoA, videoB) => {
      return videoB.compareCompletionTo(videoA)
    })
  }, [videos, filterText])

  useEffect(() => {
    setSearchedVideos([])
    videoSearch(filterText).then(setSearchedVideos)
  }, [filterText])

  if (!auth.loggedIn) {
    return (
      <View flex={1}>
        <Text fontSize="xl" margin="10px" textAlign="center">
          {' '}
          Login to see Book marks, Public and private lists, and other users!
        </Text>

        <LoginButton />
      </View>
    )
  }

  return (
    <View flex={1}>
      <ScrollView
        flex={1}
        color="white"
        refreshControl={<RefreshControl refreshing={loadingVideos} onRefresh={refresh} />}
        stickyHeaderIndices={[0]}
        stickyHeaderHiddenOnScroll
        keyboardShouldPersistTaps="handled"
      >
        <SearchBar
          placeholder="Filter Tracked Shows & Movies"
          leftIcon={<MaterialCommunityIcons name="filter-outline" />}
          value={filterText}
          onChangeText={setfilterText}
          returnKeyType="search"
        />

        {sortedVideos.map(video => (
          <TrackedVideoItem video={video} key={video.videoId} />
        ))}

        {filterText && (
          <NamedTileRow
            label={`Videos related to ${filterText}:`}
            videos={searchedVideos}
            showMoreText="See more"
            onShowMore={() =>
              navigation.navigate('discover', {
                // @ts-ignore
                screen: 'discoverTab',
                params: { initialSearchValue: filterText },
              })
            }
          />
        )}
      </ScrollView>
    </View>
  )
})

export default TrackingScreen
