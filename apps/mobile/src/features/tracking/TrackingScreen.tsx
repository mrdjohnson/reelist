import React, { useEffect, useMemo, useState } from 'react'
import { Input, Pressable, ScrollView, Text, View, Icon } from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '~/hooks/useStore'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Video from '~/models/Video'
import _ from 'lodash'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import TrackedVideoItem from '~/features/video/TrackedVideoItem'
import SearchBar from '~/shared/components/SearchBar'

const TrackingScreen = observer(({ navigation }: NativeStackScreenProps<any>) => {
  const [filterText, setfilterText] = useState('')
  const [videos, setVideos] = useState<Video[]>([])
  const [loadingVideos, setLoadingVideos] = useState(false)
  const [loadingSeasons, setLoadingSeasons] = useState(false)
  const { auth, videoStore } = useStore()

  const filteredVideos = useMemo(() => {
    return _.filter(videos, video => video.videoName.includes(filterText))
  }, [videos, filterText])

  useEffect(() => {
    const getVideosAndSeasons = async () => {
      setLoadingVideos(true)
      const localVideos = await videoStore.getTrackedVideos()

      setLoadingVideos(false)
      setLoadingSeasons(true)

      try {
        await Promise.allSettled(localVideos.map(video => video.fetchSeasons()))
      } catch (e) {
        console.error(e)
      }

      setLoadingSeasons(false)
      setVideos(localVideos)
    }

    getVideosAndSeasons()
  }, [])

  const handleSearchBarRightIconPressed = (isFocused?: boolean) => {
    if (isFocused) {
      setfilterText('')
    }
  }

  return (
    <View flex={1} backgroundColor="white">
      <SearchBar
        placeholder="Filter Tracked Shows & Movies"
        leftIcon={<MaterialCommunityIcons name="filter-outline" />}
        onRightIconPress={handleSearchBarRightIconPressed}
        value={filterText}
        onChangeText={setfilterText}
        returnKeyType="search"
      />

      <ScrollView flex={1} color="white">
        {loadingVideos && <Text>Loading each video!</Text>}

        {loadingSeasons && <Text>Loading each season!</Text>}

        <Text>Tracking screen!!!</Text>

        {filteredVideos.map(video => (
          <TrackedVideoItem video={video} key={video.id} />
        ))}
      </ScrollView>
    </View>
  )
})

export default TrackingScreen
