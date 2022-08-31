import React, { useEffect, useMemo, useState } from 'react'
import { Input, Pressable, ScrollView, Text, View, Icon } from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '~/hooks/useStore'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Video from '~/models/Video'
import _ from 'lodash'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import TrackedVideoItem from '~/features/video/TrackedVideoItem'
import SearchBar from '~/shared/components/SearchBar'
import { ReelistScreen } from '~/utils/navigation'

const TrackingScreen = observer(({ navigation }: ReelistScreen) => {
  const [filterText, setfilterText] = useState('')
  const [videos, setVideos] = useState<Video[]>([])
  const [loadingVideos, setLoadingVideos] = useState(false)
  const { auth, videoStore } = useStore()

  const filteredVideos = useMemo(() => {
    return _.filter(videos, video => video.videoName.includes(filterText))
  }, [videos, filterText])

  useEffect(() => {
    const getVideosAndSeasons = async () => {
      setLoadingVideos(true)
      const localVideos = await videoStore.getTrackedVideos()

      setVideos(localVideos)
      setLoadingVideos(false)
    }

    getVideosAndSeasons()
  }, [])

  return (
    <View flex={1} backgroundColor="white">
      <SearchBar
        placeholder="Filter Tracked Shows & Movies"
        leftIcon={<MaterialCommunityIcons name="filter-outline" />}
        value={filterText}
        onChangeText={setfilterText}
        returnKeyType="search"
      />

      <ScrollView flex={1} color="white">
        {loadingVideos && <Text>Loading videos!</Text>}

        <Text>Tracking screen!!!</Text>

        {filteredVideos.map(video => (
          <TrackedVideoItem video={video} key={video.id} />
        ))}
      </ScrollView>
    </View>
  )
})

export default TrackingScreen
