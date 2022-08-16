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

  return (
    <View flex={1} backgroundColor="white">
      <Input
        placeholder="Filter Tracked Shows & Movies"
        borderRadius="8"
        color={'gray.600'}
        margin="10px"
        py="2"
        px="1"
        fontSize="14"
        InputLeftElement={
          <Icon
            m="2"
            ml="3"
            size={6}
            color="gray.400"
            as={<MaterialCommunityIcons name="filter-outline" />}
          />
        }
        InputRightElement={
          <Pressable onPress={() => setfilterText('')}>
            <Icon m="2" ml="3" size={5} color="gray.400" as={<MaterialIcons name="clear" />} />
          </Pressable>
        }
        value={filterText}
        onChangeText={setfilterText}
        // onSubmitEditing={filter}
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
