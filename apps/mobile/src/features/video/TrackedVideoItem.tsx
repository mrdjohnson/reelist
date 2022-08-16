import React, { useEffect, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import _ from 'lodash'
import Video from '~/models/Video'
import { useStore } from '~/hooks/useStore'
import { Button, Icon, Image, Pressable, Text, View } from 'native-base'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { NavigatorParamList } from '../../../from_ignite_template/app-navigator'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500'

type VideoItemProps = {
  video: Video | null
}

const TrackedVideoItem = observer(({ video }: VideoItemProps) => {
  const { videoListStore, appState, videoStore } = useStore()
  const navigation = useNavigation<NavigationProp<NavigatorParamList>>()

  if (!video) return null

  const name = video.name || video.title
  const imageSource = video.posterPath || video.backdropPath
  const inPlaylist = false // add to play list somehow

  // const handlePlayListButton = async () => {
  //   console.log('setting video:', video)
  //   videoListStore.setCurrentVideo(video)
  //   appState.openDialog('addToVideoList')
  //   console.log('video set:', video)
  //   // if (video.mediaType === 'movie') {
  //   //   let { data: videoResponse, error } = await supabase
  //   //     .from('videos')
  //   //     .insert({ movie_id: video.id, user_id: auth.user.id })
  //   //     .single()
  //   //   if (error) console.error('failed to create video', error.message)
  //   // }
  // }

  const goToMediaPage = () => {
    videoStore.setCurrentVideoId(video.videoId)
    navigation.navigate('videoScreen')
  }

  return (
    <Pressable flexDirection="row" margin="10px" onPress={goToMediaPage}>
      <View flexShrink={1}>
        {imageSource && (
          <Image
            source={{ uri: IMAGE_PATH + imageSource }}
            alt={imageSource}
            minWidth="80px"
            flex={1}
            marginRight="8px"
            resizeMode="contain"
            backgroundColor="black"
          />
        )}
      </View>

      <View flex={1}>
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

        <View flexDirection="row" justifyContent="space-between" alignItems="center">
          <View>
            <Text>Season: {video.nextEpisode?.seasonNumber}</Text>

            <Text>Episode: {video.nextEpisode?.episodeNumber}</Text>
          </View>

          <Button onPress={video.watchNextEpisode}>
            <Icon as={<MaterialCommunityIcons name="eye-plus" />} color="white" />
          </Button>
        </View>
      </View>
    </Pressable>
  )
})

export default TrackedVideoItem
