import React, { useMemo, useState } from 'react'
import { ScrollView, View } from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '~/hooks/useStore'
import _ from 'lodash'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import TrackedVideoItem from '~/features/video/TrackedVideoItem'
import SearchBar from '~/shared/components/SearchBar'
import { ReelistScreen } from '~/utils/navigation'
import { RefreshControl } from 'react-native'
import useAsyncState from '~/hooks/useAsyncState'

const TrackingScreen = observer(({ navigation }: ReelistScreen) => {
  const [filterText, setfilterText] = useState('')
  const { auth, videoStore } = useStore()

  const [videos, refresh, loadingVideos] = useAsyncState([], videoStore.getTrackedVideos)

  const sortedVideos = useMemo(() => {
    const filteredVideos = _.filter(videos, video => video.videoName.includes(filterText))

    return filteredVideos.sort((videoA, videoB) => {
      return videoB.compareCompletionTo(videoA)
    })
  }, [videos, filterText])

  return (
    <View flex={1}>
      <SearchBar
        placeholder="Filter Tracked Shows & Movies"
        leftIcon={<MaterialCommunityIcons name="filter-outline" />}
        value={filterText}
        onChangeText={setfilterText}
        returnKeyType="search"
      />

      <ScrollView
        flex={1}
        color="white"
        refreshControl={<RefreshControl refreshing={loadingVideos} onRefresh={refresh} />}
      >
        {sortedVideos.map(video => (
          <TrackedVideoItem video={video} key={video.id} />
        ))}
      </ScrollView>
    </View>
  )
})

export default TrackingScreen
