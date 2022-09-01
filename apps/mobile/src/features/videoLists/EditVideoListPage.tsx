import React, { useState } from 'react'
import { Button, FormControl, Row, Input, Switch, View } from 'native-base'
import { observer } from 'mobx-react-lite'
import VideoList from '~/models/VideoList'

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
    const [videoListName, setVideoListName] = useState<string>(currentVideoList.name)
    const [videoListIsPublic, setVideoListIsPublic] = useState(currentVideoList.isPublic)

    return (
      <View flex={1} backgroundColor="light.100">
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
      </View>
    )
  },
)

export default EditVideoListPage
