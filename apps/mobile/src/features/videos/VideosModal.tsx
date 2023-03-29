import React, { useEffect, useMemo, useState } from 'react'
import { Center, Pressable, Row, ScrollView, View, Text } from 'native-base'
import { observer } from 'mobx-react-lite'
import _ from 'lodash'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import TrackedVideoItem from '~/features/video/TrackedVideoItem'
import SearchBar from '~/shared/components/SearchBar'
import { ReelistScreenFrom } from '~/utils/navigation'
import { RefreshControl } from 'react-native'
import useAsyncState from '@reelist/utils/hooks/useAsyncState'
import useVideoSearch from '~/hooks/useVideoSearch'
import NamedTileRow from '~/shared/components/NamedTileRow'
import Video from '@reelist/models/Video'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { useStore } from '@reelist/utils/hooks/useStore'

const VideosModal = observer(({ route, navigation }: ReelistScreenFrom<'videosModal'>) => {
  const {auth} = useStore()
  
  const videoSearch = useVideoSearch()
  
  const title = route.params.title
  const userId = route.params.userId || auth.user.id
  const isCurrentUser = userId === auth.user.id

  const [videos, refresh, loadingVideos] = useAsyncState([], route.params.loadVideos)
  const [searchedVideos, setSearchedVideos] = useState<Video[]>([])
  const [filterText, setfilterText] = useState('')

  const sortedVideos = useMemo(() => {
    const lowerCaseText = _.toLower(filterText)
    const filteredVideos = _.filter(videos, video =>
      _.toLower(video.videoName).includes(lowerCaseText),
    )

    return filteredVideos
  }, [videos, filterText])

  useEffect(() => {
    setSearchedVideos([])
    videoSearch(filterText).then(setSearchedVideos)
  }, [filterText])

  return (
    <View flex={1}>
      <Row margin="10px" marginBottom="5px">
        <Center>
          <Pressable alignSelf="center" onPress={navigation.goBack}>
            <MaterialIcons
              name="arrow-back"
              size={20}
              style={{ color: 'black', padding: 0, margin: 0 }}
            />
          </Pressable>
        </Center>

        <Center flex={1} marginX="4px">
          <Text fontSize="2xl" adjustsFontSizeToFit numberOfLines={1}>
            {title}
          </Text>
        </Center>

        <Center />
      </Row>

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
          <TrackedVideoItem video={video} key={video.id} isInteractable={isCurrentUser} />
        ))}

        <NamedTileRow
          label={`Videos related to ${filterText}:`}
          videos={searchedVideos}
          showMoreText="See more"
          onShowMore={() =>
            navigation.navigate('search', {
              screen: 'search',
              params: { initialSearchValue: filterText },
            })
          }
        />
      </ScrollView>
    </View>
  )
})

export default VideosModal