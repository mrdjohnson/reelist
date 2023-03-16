import React, { useState } from 'react'
import { Button, Input, View, AlertDialog } from 'native-base'
import { observer } from 'mobx-react-lite'
import { AutoSortType } from '@reelist/models/VideoList'
import { ReelistScreen } from '~/utils/navigation'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { useStore } from '@reelist/utils/hooks/useStore'
import AppButton from '~/shared/components/AppButton'
import SegmentButton from '~/shared/components/SegmentButton'
import RadioButton from '~/shared/components/RadioButton'
import FormSection from '~/shared/components/FormSection'

const EditVideoListPage = observer(({ navigation }: ReelistScreen) => {
  const { videoListStore } = useStore()

  const currentVideoList = videoListStore.currentVideoList!

  const [editingErrorMessage, setEditingErrorMessage] = useState<string | null>(null)
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false)

  const cancelRef = React.useRef(null)

  const handleDelete = () => {
    currentVideoList.destroy()

    navigation.navigate('videoListsHome')
  }

  const closeEditPage = () => {
    navigation.pop()
  }

  const handleSave = () => {
    if (currentVideoList.id) {
      currentVideoList
        .save()
        .then(closeEditPage)
        .catch((e: Error) => {
          setEditingErrorMessage(e.message)
        })
    } else {
      videoListStore.createVideoList(videoListViewModel).then(closeEditPage)
    }
  }

  const videoListViewModel = currentVideoList.viewModel

  return (
    <View flex={1} backgroundColor="light.100">
      <View margin="10px" flex={1}>
        <FormSection
          label="Name"
          isInvalid={!!editingErrorMessage}
          errorMessage={editingErrorMessage}
        >
          <Input
            value={videoListViewModel.name}
            onChangeText={nextName => (videoListViewModel.name = nextName)}
          />
        </FormSection>

        <FormSection
          label="Is List Public?"
          helperText="Can the list be viewed / followed by everyone?"
        >
          <SegmentButton
            size="sm"
            selectedSegmentIndex={videoListViewModel.isPublic ? 0 : 1}
            segments={[
              {
                icon: <MaterialIcons name="public" />,
                content: 'Public',
              },
              {
                icon: <MaterialIcons name="public-off" />,
                content: 'Private',
              },
            ]}
            onPress={selectedSegmentIndex => {
              videoListViewModel.isPublic = selectedSegmentIndex === 0
            }}
          />
        </FormSection>

        <FormSection
          label="Is List Joinable?"
          helperText="Can the list be joined by everyone with a link to it?"
        >
          <SegmentButton
            size="sm"
            selectedSegmentIndex={videoListViewModel.isJoinable ? 0 : 1}
            marginBottom="0"
            segments={[
              {
                icon: <MaterialIcons name="public" />,
                content: 'Joinable',
              },
              {
                icon: <MaterialIcons name="public-off" />,
                content: 'Not Joinable',
              },
            ]}
            onPress={() => {
              videoListViewModel.isJoinable = !videoListViewModel.isJoinable
            }}
          />
        </FormSection>

        <FormSection label="Auto Sort Type" helperText="How should the list be sorted?">
          <RadioButton.Group
            name="auto-sort-type-group"
            value={videoListViewModel.autoSortType}
            onChange={value => (videoListViewModel.autoSortType = value as number)}
          >
            <RadioButton value={AutoSortType.NONE}>None</RadioButton>
            <RadioButton value={AutoSortType.NAME}>Name</RadioButton>
            <RadioButton value={AutoSortType.FIRST_AIRED}>First Aired</RadioButton>
            <RadioButton value={AutoSortType.LAST_AIRED}>Last Aired</RadioButton>
            <RadioButton value={AutoSortType.TOTAL_TIME}>Total Time</RadioButton>
          </RadioButton.Group>

          <SegmentButton
            size="sm"
            marginTop="10px"
            selectedSegmentIndex={videoListViewModel.autoSortIsAscending ? 0 : 1}
            disabled={videoListViewModel.autoSortType === 0}
            segments={[
              {
                content: 'Ascending',
                icon: createIconFromSortType(videoListViewModel.autoSortType, 'ascending'),
              },
              {
                content: 'Descending',
                icon: createIconFromSortType(videoListViewModel.autoSortType, 'descending'),
              },
            ]}
            onPress={(selectedSegmentIndex: number) => {
              console.log('selecting index: ', selectedSegmentIndex)
              videoListViewModel.autoSortIsAscending = selectedSegmentIndex === 0
            }}
          />
        </FormSection>

        <AppButton onPress={handleSave} marginBottom="10px">
          {currentVideoList.isNewVideoList ? 'Create' : 'Save'}
        </AppButton>

        <AppButton onPress={closeEditPage}>Cancel</AppButton>
      </View>

      {currentVideoList.adminIds.length === 1 && (
        <AppButton onPress={() => setIsDeleteConfirmationOpen(true)} margin="10px" color="red.600">
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
})

const createIconFromSortType = (autoSortType: number, namePostfix: 'ascending' | 'descending') => {
  if (autoSortType === 0) return undefined

  const name = autoSortType === 1 ? 'sort-alphabetical-' : 'sort-calendar-'

  return <MaterialCommunityIcons name={name + namePostfix} />
}

export default EditVideoListPage
