import React, { useEffect, useMemo, useState } from 'react'
import {
  Actionsheet,
  Box,
  Button,
  Center,
  Column,
  FlatList,
  FormControl,
  HStack,
  Input,
  Pressable,
  Row,
  ScrollView,
  SectionList,
  Skeleton,
  Switch,
  Text,
  useDisclose,
  useToast,
  View,
} from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '~/hooks/useStore'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import VideoList from '~/models/VideoList'
import { BackHandler, SectionListData } from 'react-native'
import Video from '~/models/Video'
import VideoItem, { videoItemSkeleton } from '~/features/video/VideoItem'
import Clipboard from '@react-native-clipboard/clipboard'
import { NavigatorParamList } from '../../../from_ignite_template/app-navigator'

// const VideoItem = observer(
//   ({
//     video,
//     currentVideoListId,
//     onVideoListPress,
//   }: {
//     videoList: VideoList
//     currentVideoListId: string | undefined
//     onVideoListPress: (videoList: VideoList) => void
//   }) => {
//     return (
//       <Pressable
//         onPress={() => onVideoListPress(videoList)}
//         backgroundColor={currentVideoListId === videoList.id ? 'amber.200' : undefined}
//       >
//         <Text margin={'10px'} fontSize="md">
//           {videoList.name}
//         </Text>
//       </Pressable>
//     )
//   },
// )
const CAN_GO_BACK = false
const CANNOT_GO_BACK = true

const VideoListScreen = observer(({ navigation }: NativeStackScreenProps<NavigatorParamList>) => {
  const { videoListStore, auth, appState } = useStore()
  const toast = useToast()

  const currentVideoList = videoListStore.currentVideoList

  const [videoListName, setVideoListName] = useState<string>('')
  const [videoListIsPublic, setVideoListIsPublic] = useState(false)
  const [editing, setEditing] = useState<boolean>(false)
  const [editingErrorMessage, setEditingErrorMessage] = useState<string | null>(null)

  const {
    isOpen: isMembershipOpen,
    onOpen: openMembership,
    onClose: onMemebershipClose,
  } = useDisclose()

  useEffect(() => {
    videoListStore.setCurrentVideoListFromShareId(appState.videoListShareId)
  }, [appState.videoListShareId, videoListStore])

  useEffect(() => {
    currentVideoList?.getVideos()
  }, [currentVideoList])

  useEffect(() => {
    const onBackButtonPressed = () => {
      if (editing) {
        setEditing(false)
        setEditingErrorMessage(null)

        return CANNOT_GO_BACK
      }

      return CAN_GO_BACK
    }

    BackHandler.addEventListener('hardwareBackPress', onBackButtonPressed)

    return () => BackHandler.removeEventListener('hardwareBackPress', onBackButtonPressed)
  }, [editing])

  const isUserListAdmin = useMemo(() => {
    return currentVideoList?.adminIds.includes(auth.user.id)
  }, [currentVideoList?.adminIds])

  if (!currentVideoList) return null

  const join = () => {
    currentVideoList.join()
    onMemebershipClose()
  }

  const leave = () => {
    currentVideoList.leave()
    onMemebershipClose()
  }

  const startEditing = () => {
    setVideoListName(currentVideoList.name)
    setVideoListIsPublic(currentVideoList.isPublic)

    setEditing(true)
    onMemebershipClose()
  }

  const finishEditing = () => {
    currentVideoList
      .update(videoListName, videoListIsPublic)
      .then(() => {
        onMemebershipClose()
        setEditing(false)
        setEditingErrorMessage(null)
      })
      .catch((e: Error) => {
        setEditingErrorMessage(e.message)
      })
  }

  const shareList = async () => {
    const uniqueId = await currentVideoList.getShareUniqId()
    let description = 'Unable to generate a unique id for ' + currentVideoList.name

    if (uniqueId !== null) {
      const url = 'reelist.app/share/list/' + uniqueId

      Clipboard.setString(url)

      description = url + ' copied to clipboard!'
    }

    toast.show({
      description,
      duration: 3000,
    })

    onMemebershipClose()
  }

  return (
    <View flex={1} backgroundColor="light.100">
      {editing ? (
        <View margin="10px">
          <FormControl isInvalid={!!editingErrorMessage} marginBottom="8px">
            <FormControl.Label>Enter List Name</FormControl.Label>

            <Input value={videoListName} onChangeText={setVideoListName} marginLeft="5px" />

            <FormControl.HelperText marginLeft="10px">Example helper text</FormControl.HelperText>

            <FormControl.ErrorMessage marginLeft="10px">
              {editingErrorMessage}
            </FormControl.ErrorMessage>
          </FormControl>

          <FormControl marginBottom="10px">
            <HStack>
              <FormControl.Label>Is List Public?</FormControl.Label>

              <Switch
                size="sm"
                value={videoListIsPublic}
                onToggle={() => setVideoListIsPublic(!videoListIsPublic)}
              />
            </HStack>

            <FormControl.HelperText marginLeft="10px">
              Can the list be viewed by everyone?
            </FormControl.HelperText>
          </FormControl>

          <Button onPress={finishEditing} marginBottom="10px">
            Save
          </Button>

          <Button onPress={() => setEditing(false)}>Cancel</Button>
        </View>
      ) : (
        <>
          <View backgroundColor="amber.200" flexDirection="row">
            <Button onPress={() => navigation.navigate('videoListsHome')}>Go Home</Button>

            <Text fontSize="2xl">{currentVideoList.name}</Text>
          </View>

          <Button onPress={openMembership} margin="10px">
            Membership
          </Button>

          {currentVideoList.videoIds.length === 0 && (
            <Center>
              <Text>Nothing has been added here yet</Text>
            </Center>
          )}

          {currentVideoList.videos.length === 0 && (
            <FlatList
              data={currentVideoList.videoIds}
              keyExtractor={videoId => videoId}
              renderItem={() => videoItemSkeleton}
            />
          )}

          <FlatList
            data={currentVideoList.videos}
            keyExtractor={video => video.videoId}
            renderItem={({ item: video }) => <VideoItem video={video} />}
          />
        </>
      )}

      {/* hidden */}

      <Actionsheet isOpen={isMembershipOpen} onClose={onMemebershipClose}>
        <Actionsheet.Content>
          {!isUserListAdmin && <Actionsheet.Item onPress={join}>Join</Actionsheet.Item>}

          {currentVideoList.adminIds.length > 1 && isUserListAdmin && (
            <Actionsheet.Item onPress={leave}>Leave</Actionsheet.Item>
          )}

          {isUserListAdmin && <Actionsheet.Item onPress={startEditing}>Edit</Actionsheet.Item>}

          <Actionsheet.Item onPress={shareList}>Copy Shareable link</Actionsheet.Item>

          <Actionsheet.Item onPress={onMemebershipClose}>Cancel</Actionsheet.Item>
        </Actionsheet.Content>
      </Actionsheet>
    </View>
  )
})

export default VideoListScreen
