import React, { useState } from 'react'
import { Button, FormControl, Row, Input, Switch, View, Popover, AlertDialog } from 'native-base'
import { observer } from 'mobx-react-lite'
import VideoList from '~/models/VideoList'
import { useReelistNavigation } from '~/utils/navigation'
import { useStore } from '~/hooks/useStore'

type EditVideoListPageProps = {
  currentVideoList: VideoList
  onFinishEditing: () => void
  onCancelEditing: () => void
  editingErrorMessage: string | null
}

const EditVideoListPage = observer(
  ({
    currentVideoList,
    onFinishEditing,
    onCancelEditing,
    editingErrorMessage,
  }: EditVideoListPageProps) => {
    const navigation = useReelistNavigation()

    const [videoListName, setVideoListName] = useState<string>(currentVideoList.name)
    const [videoListIsPublic, setVideoListIsPublic] = useState(currentVideoList.isPublic)
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false)

    const cancelRef = React.useRef(null)

    const handleDelete = () => {
      currentVideoList.destroy()

      navigation.navigate('videoListsHome')
    }

    return (
      <View flex={1} backgroundColor="light.100">
        <View margin="10px" flex={1}>
          <FormControl isInvalid={!!editingErrorMessage} marginBottom="8px">
            <FormControl.Label>Enter List Name</FormControl.Label>

            <Input value={videoListName} onChangeText={setVideoListName} marginLeft="5px" />

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
                value={videoListIsPublic}
                onToggle={() => setVideoListIsPublic(!videoListIsPublic)}
              />
            </Row>

            <FormControl.HelperText marginLeft="10px">
              Can the list be viewed by everyone?
            </FormControl.HelperText>
          </FormControl>

          <Button onPress={onFinishEditing} marginBottom="10px">
            Save
          </Button>

          <Button onPress={onCancelEditing}>Cancel</Button>
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
