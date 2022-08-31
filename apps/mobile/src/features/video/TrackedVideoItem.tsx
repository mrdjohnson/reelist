import React, { useEffect, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import _ from 'lodash'
import Video from '~/models/Video'
import { useStore } from '~/hooks/useStore'
import { Button, Column, Icon, Image, Pressable, Row, Text, View } from 'native-base'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import moment from 'moment'
import { useReelistNavigation } from '~/utils/navigation'

const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500'

type VideoItemProps = {
  video: Video | null
  isInteractable?: boolean
}

const TrackedVideoItem = observer(({ video, isInteractable = true }: VideoItemProps) => {
  const { videoListStore, appState, videoStore } = useStore()
  const navigation = useReelistNavigation()

  if (!video) return null

  const name = video.name || video.title
  const imageSource = video.posterPath || video.backdropPath
  const inPlaylist = false // add to play list somehow

  let bottomRow

  if (video.isCompleted) {
    bottomRow = (
      <View flexDirection="row-reverse">
        <Text alignSelf="flex-end">Completed</Text>
      </View>
    )
  } else if (video.isLatestEpisodeWatched) {
    bottomRow = (
      <View flexDirection="row-reverse">
        <Column>
          <Text alignSelf="flex-end">Currently Live</Text>

          {video.nextEpisodeToAir && (
            <Text alignSelf="flex-end">
              {/* Friday, Aug 19th 22 */}
              Next Air Date:
              {moment(video.nextEpisodeToAir.airDate).format(' dddd, MMM Do')}
            </Text>
          )}
        </Column>
      </View>
    )
  } else if (!isInteractable) {
    bottomRow = (
      <View flexDirection="row-reverse">
        <View>
          <Text>Season: {video.nextEpisode?.seasonNumber}</Text>

          <Text>Episode: {video.nextEpisode?.episodeNumber}</Text>
        </View>
      </View>
    )
  } else if (video.mediaType === 'movie') {
    bottomRow = (
      <View flexDirection="row-reverse">
        <Button onPress={() => video.toggleWatched()} size="lg">
          <Icon as={<MaterialCommunityIcons name="eye-plus" />} color="white" />
        </Button>
      </View>
    )
  } else {
    bottomRow = (
      <View flexDirection="row" justifyContent="space-between" alignItems="center">
        <View>
          <Text>Season: {video.nextEpisode?.seasonNumber}</Text>

          <Text>Episode: {video.nextEpisode?.episodeNumber}</Text>
        </View>

        <Button onPress={video.watchNextEpisode} size="lg">
          <Icon as={<MaterialCommunityIcons name="eye-plus" />} color="white" />
        </Button>
      </View>
    )
  }

  const goToMediaPage = () => {
    videoStore.setCurrentVideoId(video.videoId)
    navigation.navigate('videoScreen')
  }

  // only fade for YOUR videos that cant be interacted with.
  let faded = video.isWatched || video.isCompleted || video.isLatestEpisodeWatched

  if (!isInteractable) faded = false

  return (
    <Pressable
      flexDirection="row"
      margin="10px"
      onPress={goToMediaPage}
      opacity={faded ? '50' : '100'}
    >
      <View flexShrink={1}>
        {imageSource && (
          <Image
            source={{ uri: IMAGE_PATH + imageSource }}
            alt={imageSource}
            minWidth="80px"
            minHeight="120px"
            flex={1}
            marginRight="8px"
            resizeMode="contain"
            backgroundColor="black"
            rounded="sm"
          />
        )}
      </View>

      <View flex={1} backgroundColor={null} roundedLeft="sm" roundedRight="md">
        <Column flex={1}>
          <Text fontSize="lg" color={'black'}>
            {name}
          </Text>

          {video.originalName && (
            <Text fontSize="sm" color="light.500">
              {video.originalName}
            </Text>
          )}

          {video.releaseDate && (
            <Text fontSize="sm" color="light.500">
              {video.releaseDate}
            </Text>
          )}
        </Column>

        {bottomRow}
      </View>
    </Pressable>
  )
})

export default TrackedVideoItem
