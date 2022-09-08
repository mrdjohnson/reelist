import React, { useMemo, useState } from 'react'
import { Button, FormControl, Row, Input, Switch, View, AlertDialog } from 'native-base'
import { observer } from 'mobx-react-lite'
import VideoList from '~/models/VideoList'
import { useReelistNavigation } from '~/utils/navigation'
import { createViewModel } from 'mobx-utils'
import ToggleButton from '~/shared/components/ToggleButton'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { useStore } from '~/hooks/useStore'
import AppButton from '~/shared/components/AppButton'
import SegmentButton from '~/shared/components/SegmentButton'

type EditVideoListPageProps = {
  currentVideoList: VideoList
  closeEditPage: () => void
}

const EditVideoListPage = observer(
  ({ currentVideoList, closeEditPage }: EditVideoListPageProps) => {
    const navigation = useReelistNavigation()
    const { videoListStore } = useStore()

    const [editingErrorMessage, setEditingErrorMessage] = useState<string | null>(null)
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false)

    const cancelRef = React.useRef(null)

    const handleDelete = () => {
      currentVideoList.destroy()

      navigation.navigate('videoListsHome')
    }

    const handleSave = () => {
      if (currentVideoList.id) {
        VideoList.save(videoListViewModel)
          .then(closeEditPage)
          .catch((e: Error) => {
            setEditingErrorMessage(e.message)
          })
      } else {
        videoListStore.createVideoList(videoListViewModel).then(closeEditPage)
      }
    }

    const videoListViewModel = useMemo(() => {
      return createViewModel(currentVideoList)
    }, [currentVideoList])

    return (
      <View flex={1} backgroundColor="light.100">
        <View margin="10px" flex={1}>
          <FormControl isInvalid={!!editingErrorMessage} marginBottom="8px">
            <FormControl.Label>Name</FormControl.Label>

            <Input
              value={videoListViewModel.name}
              onChangeText={nextName => (videoListViewModel.name = nextName)}
              marginLeft="5px"
            />

            <FormControl.ErrorMessage marginLeft="5px">
              {editingErrorMessage}
            </FormControl.ErrorMessage>
          </FormControl>

          <FormControl marginBottom="10px">
            <FormControl.Label>Is List Public?</FormControl.Label>

            <SegmentButton
              size="sm"
              selectedSegmentId={videoListViewModel.isPublic ? 'left' : 'right'}
              containerProps={{
                marginLeft: '5px',
              }}
              leftSegment={{
                icon: <MaterialIcons name="public" />,
                content: 'Public',
              }}
              rightSegment={{
                icon: <MaterialIcons name="public-off" />,
                content: 'Private',
              }}
              onPress={segmentId => {
                videoListViewModel.isPublic = segmentId === 'left'
              }}
            />

            <FormControl.HelperText marginLeft="5px">
              Can the list be viewed / followed by everyone?
            </FormControl.HelperText>
          </FormControl>

          <FormControl marginBottom="10px">
            <FormControl.Label>Is List Joinable?</FormControl.Label>

            <SegmentButton
              size="sm"
              selectedSegmentId={videoListViewModel.isJoinable ? 'left' : 'right'}
              containerProps={{
                marginLeft: '5px',
              }}
              leftSegment={{
                icon: <MaterialIcons name="public" />,
                content: 'Joinable',
              }}
              rightSegment={{
                icon: <MaterialIcons name="public-off" />,
                content: 'Not Joinable',
              }}
              onPress={() => {
                videoListViewModel.isJoinable = !videoListViewModel.isJoinable
              }}
            />

            <FormControl.HelperText marginLeft="5px">
              Can the list be joined by everyone with a link to it?
            </FormControl.HelperText>
          </FormControl>

          <AppButton onPress={handleSave} marginBottom="10px">
            {currentVideoList.isNewVideoList ? 'Create' : 'Save'}
          </AppButton>

          <AppButton onPress={closeEditPage}>Cancel</AppButton>
        </View>

        {currentVideoList.adminIds.length === 1 && (
          <AppButton
            onPress={() => setIsDeleteConfirmationOpen(true)}
            margin="10px"
            color="red.600"
          >
            Delete
          </AppButton>
        )}

        {/* hidden */}
        <AlertDialog
          leastDestructiveRef={cancelRef}
          isOpen={isDeleteConfirmationOpen}
          onClose={() => setIsDeleteConfirmationOpen(false)}
          closeOnOverlayClick
        >
          <AlertDialog.Content>
            <AlertDialog.CloseButton />
            <AlertDialog.Header>{`Delete: ${currentVideoList.name}?`}</AlertDialog.Header>

            <AlertDialog.Body>This will not be recoverable in the future.</AlertDialog.Body>

            <AlertDialog.Footer>
              <Button.Group space={2}>
                <Button
                  colorScheme="coolGray"
                  variant="outline"
                  onPress={() => setIsDeleteConfirmationOpen(false)}
                  ref={cancelRef}
                >
                  Cancel
                </Button>

                <Button colorScheme="danger" onPress={handleDelete}>
                  Delete
                </Button>
              </Button.Group>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog>
      </View>
    )
  },
)

export default EditVideoListPage
