import React, { useEffect, useMemo, useState } from 'react'
import { Input, Pressable, ScrollView, Text, View, Icon } from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '~/hooks/useStore'
import Video from '~/models/Video'
import _ from 'lodash'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import TrackedVideoItem from '~/features/video/TrackedVideoItem'
import SearchBar from '~/shared/components/SearchBar'
import { ReelistScreen } from '~/utils/navigation'
import { RefreshControl } from 'react-native'
import useRefresh from '~/hooks/useRefresh'

const TrackingScreen = observer(({ navigation }: ReelistScreen) => {
  const [filterText, setfilterText] = useState('')
  const [videos, setVideos] = useState<Video[]>([])
  const { auth, videoStore } = useStore()

  const filteredVideos = useMemo(() => {
    return _.filter(videos, video => video.videoName.includes(filterText))
  }, [videos, filterText])

  const [loadingVideos, refresh] = useRefresh(async () => {
    setVideos([])
    await videoStore.getTrackedVideos().then(setVideos)
  })

  return (
    <View flex={1} backgroundColor="white">
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
        {filteredVideos.map(video => (
          <TrackedVideoItem video={video} key={video.id} />
        ))}
      </ScrollView>
    </View>
  )
})

export default TrackingScreen
