import React, { useEffect, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import _ from 'lodash'
import Video from '~/models/Video'
import { useStore } from '~/hooks/useStore'
import { useReelistNavigation } from '~/utils/navigation'
import { Column, Divider, HStack, Image, Pressable, Row, Skeleton, Text, View } from 'native-base'

const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500'

type VideoItemProps = {
  video: Video | null
}

const VideoItem = observer(({ video }: VideoItemProps) => {
  const { videoListStore, appState, videoStore } = useStore()
  const navigation = useReelistNavigation()

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
            rounded="sm"
          />
        )}
      </View>

      <View flex={1}>
        <Text fontSize="lg" color={'black'} adjustsFontSizeToFit numberOfLines={1}>
          {name}
        </Text>

        <Text fontSize="sm" color="light.500" adjustsFontSizeToFit numberOfLines={1}>
          {video.originalName}

          {video.originalName && video.videoReleaseDate && <Text color="light.700">{'  |  '}</Text>}

          {video.videoReleaseDate}
        </Text>

        <Text numberOfLines={4} ellipsizeMode="tail">
          {video.overview}
        </Text>
      </View>
    </Pressable>
  )
})

export const videoItemSkeleton = (
  <Row margin="10px">
    <Column marginRight="8px">
      <Skeleton minWidth="80px" height="110px" rounded="sm" endColor="light.300" flexShrink={1} />
    </Column>

    <Column flex={1}>
      <Skeleton.Text size="sm" endColor="light.600" lines={4} paddingY="4px" />
    </Column>
  </Row>
)

export default VideoItem
