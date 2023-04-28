import {
  AspectRatio,
  Row,
  View,
  Text,
  Column,
  ScrollView,
  Pressable,
  Center,
  Spacer,
} from 'native-base'
import React, { useMemo, useState } from 'react'
import Video from '@reelist/models/Video'
import _ from 'lodash'
import VideoImage from '~/features/video/VideoImage'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { useReelistNavigation } from '~/utils/navigation'
import { useStore } from '@reelist/utils/hooks/useStore'
import LinkButton from '~/shared/components/LinkButton'
import { IViewProps } from 'native-base/lib/typescript/components/basic/View/types'
import useAsyncState from '@reelist/utils/hooks/useAsyncState'
import User from '@reelist/models/User'
import ProfileIcon from './ProfileIcon'

type NamedTileRowProps = IViewProps & {
  videos?: Video[]
  label: string
  size?: number
  showMoreText?: string
  onShowMore?: () => void
  loadVideos?: () => Promise<Video[]>
  loadUsers?: () => Promise<User[]>
  userId?: string
}

const NamedTileRow = ({
  label,
  videos,
  size = 10,
  showMoreText,
  onShowMore,
  loadVideos,
  loadUsers,
  userId,
  ...props
}: NamedTileRowProps) => {
  const { appState, videoStore } = useStore()

  const navigation = useReelistNavigation()
  const [localVideos] = useAsyncState([], loadVideos)
  const [localUsers] = useAsyncState([], loadUsers)

  const displayVideos = useMemo(() => {
    return videos || localVideos
  }, [localVideos, videos])

  if (_.isEmpty(displayVideos) && _.isEmpty(localUsers)) return null

  const navigateToVideoScreen = (video: Video) => {
    navigation.navigate('videoScreen', {videoId: video.videoId})
  }

  const navigateToProfileScreen = (user: User) => {
    appState.setProfileScreenUser(user)
    navigation.navigate('profile')
  }

  const handleShowMore = () => {
    if (onShowMore) {
      onShowMore()
    } else {
      navigation.navigate('videosModal', {
        title: label,
        loadVideos: async () => displayVideos,
      })
    }
  }

  return (
    <Column marginX="10px" paddingBottom="5px" {...props}>
      <Text paddingBottom="4px" fontSize="md">
        {label}
      </Text>

      <ScrollView horizontal>
        <Row space="8px" flex={1} paddingLeft="10px">
          {_.take(displayVideos, size).map(video => (
            <Pressable
              key={video.videoId}
              onPress={() => navigateToVideoScreen(video)}
              onLongPress={() => appState.setActionSheetVideo(video)}
            >
              <VideoImage video={video} containerProps={{ height: '120px', width: 'auto' }} />
            </Pressable>
          ))}

          {_.take(localUsers, size).map(user => (
            <Pressable key={user.id} onPress={() => navigateToProfileScreen(user)}>
              <AspectRatio ratio={{ base: 2 / 3 }} height="120px" width="auto">
                <Center>
                  <ProfileIcon user={user} marginBottom="10px" />
                  <Text numberOfLines={1} adjustsFontSizeToFit>
                    {user.name}
                  </Text>
                </Center>
              </AspectRatio>
            </Pressable>
          ))}

          <Pressable backgroundColor="blue.300:alpha.20" rounded="sm" onPress={handleShowMore}>
            <AspectRatio ratio={{ base: 2 / 3 }} width="100%" height="120px">
              <View textAlign="center" alignItems="center" justifyContent="center">
                <MaterialCommunityIcons
                  size={30}
                  name="chevron-double-right"
                  style={{ color: 'black', marginVertical: 'auto' }}
                />
              </View>
            </AspectRatio>
          </Pressable>
        </Row>
      </ScrollView>

      {showMoreText && (
        <LinkButton alignSelf="flex-end" onPress={handleShowMore}>
          {showMoreText}
        </LinkButton>
      )}
    </Column>
  )
}

export default NamedTileRow
