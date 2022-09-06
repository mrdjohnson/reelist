import React, { useMemo, useState } from 'react'
import { Button, FormControl, Row, Input, Switch, View, AlertDialog } from 'native-base'
import { observer } from 'mobx-react-lite'
import VideoList from '~/models/VideoList'
import { useReelistNavigation } from '~/utils/navigation'
import { createViewModel } from 'mobx-utils'
import ToggleButton from '~/shared/components/ToggleButton'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { useStore } from '~/hooks/useStore'

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

            <ToggleButton
              size="sm"
              marginLeft="5px"
              active={videoListViewModel.isPublic}
              color="gray.600"
              activeColor="blue.600"
              content="Private"
              activeContent="Public"
              icon={<MaterialIcons name="public-off" />}
              activeIcon={<MaterialIcons name="public" />}
              onPress={() => {
                videoListViewModel.isPublic = !videoListViewModel.isPublic
              }}
            />

            <FormControl.HelperText marginLeft="5px">
              Can the list be viewed / followed by everyone?
            </FormControl.HelperText>
          </FormControl>

          <FormControl marginBottom="10px">
            <FormControl.Label>Is List Joinable?</FormControl.Label>

            <ToggleButton
              size="sm"
              marginLeft="5px"
              active={videoListViewModel.isJoinable}
              color="gray.600"
              activeColor="blue.600"
              content="Not Joinable"
              activeContent="Joinable"
              icon={<MaterialIcons name="public-off" />}
              activeIcon={<MaterialIcons name="public" />}
              onPress={() => {
                videoListViewModel.isJoinable = !videoListViewModel.isJoinable
              }}
            />

            <FormControl.HelperText marginLeft="5px">
              Can the list be joined by everyone with a link to it?
            </FormControl.HelperText>
          </FormControl>

          <Button onPress={handleSave} marginBottom="10px">
            {currentVideoList.isNewVideoList ? 'Create' : 'Save'}
          </Button>

          <Button onPress={closeEditPage}>Cancel</Button>
        </View>

        {currentVideoList.adminIds.length === 1 && (
          <Button
            onPress={() => setIsDeleteConfirmationOpen(true)}
            variant="outline"
            colorScheme="red"
            borderColor="red.300"
            margin="10px"
          >
            Delete
          </Button>
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
