import React, { useMemo, useState } from 'react'
import { Button, FormControl, Row, Input, Switch, View, AlertDialog } from 'native-base'
import { observer } from 'mobx-react-lite'
import VideoList from '~/models/VideoList'
import { useReelistNavigation } from '~/utils/navigation'
import { createViewModel } from 'mobx-utils'

type EditVideoListPageProps = {
  currentVideoList: VideoList
  closeEditPage: () => void
}

const EditVideoListPage = observer(
  ({ currentVideoList, closeEditPage }: EditVideoListPageProps) => {
    const navigation = useReelistNavigation()

    const [editingErrorMessage, setEditingErrorMessage] = useState<string | null>(null)
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false)

    const cancelRef = React.useRef(null)

    const handleDelete = () => {
      currentVideoList.destroy()

      navigation.navigate('videoListsHome')
    }

    const handleSave = () => {
      VideoList.save(videoListViewModel)
        .then(closeEditPage)
        .catch((e: Error) => {
          setEditingErrorMessage(e.message)
        })
    }

    const videoListViewModel = useMemo(() => {
      return createViewModel(currentVideoList)
    }, [currentVideoList])

    return (
      <View flex={1} backgroundColor="light.100">
        <View margin="10px" flex={1}>
          <FormControl isInvalid={!!editingErrorMessage} marginBottom="8px">
            <FormControl.Label>Enter List Name</FormControl.Label>

            <Input
              value={videoListViewModel.name}
              onChangeText={nextName => (videoListViewModel.name = nextName)}
              marginLeft="5px"
            />

            <FormControl.HelperText marginLeft="10px">Example helper text</FormControl.HelperText>

            <FormControl.ErrorMessage marginLeft="10px">
              {editingErrorMessage}
            </FormControl.ErrorMessage>
          </FormControl>

          <FormControl marginBottom="10px">
            <Row>
              <FormControl.Label>Is List Public?</FormControl.Label>

              <Switch
                size="sm"
                value={videoListViewModel.isPublic}
                onToggle={() => (videoListViewModel.isPublic = !videoListViewModel.isPublic)}
              />
            </Row>

            <FormControl.HelperText marginLeft="10px">
              Can the list be viewed by everyone?
            </FormControl.HelperText>
          </FormControl>

          <Button onPress={handleSave} marginBottom="10px">
            Save
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
