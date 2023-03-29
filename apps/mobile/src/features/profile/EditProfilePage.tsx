import React, { useEffect, useMemo, useState } from 'react'
import { Input, FormControl, View, Avatar, Icon, Row, useToast, Switch } from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '@reelist/utils/hooks/useStore'
import _ from 'lodash'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import { BackHandler } from 'react-native'
import AppButton from '~/shared/components/AppButton'
import ActionButton from '@reelist/components/ActionButton'

const CAN_GO_BACK = false
const CANNOT_GO_BACK = true

const missingIconOptions = [
  'user-astronaut',
  'user-shield',
  'user-md',
  'user-injured',
  'user-ninja',
  'user-ninja',
  'user-secret',
  'user-secret',
  'user-secret',
]

const EditProfilePage = observer(() => {
  const { auth, appState } = useStore()
  const user = auth.user
  const [loading, setLoading] = useState(false)

  const toast = useToast()

  const missingUserIcon = useMemo(() => {
    return _.sample(missingIconOptions) || 'user-secret'
  }, [])

  const userViewModel = user.viewModel

  const save = async () => {
    setLoading(true)

    const errorMessage = await user.save()

    const description = errorMessage || 'Saved'

    toast.show({
      description,
      duration: 3000,
    })

    setLoading(false)
  }

  useEffect(() => {
    const onBackButtonPressed = () => {
      if (appState.profileScreen.editing) {
        appState.setProfileScreenEditing(false)

        return CANNOT_GO_BACK
      }

      return CAN_GO_BACK
    }

    BackHandler.addEventListener('hardwareBackPress', onBackButtonPressed)

    return () => BackHandler.removeEventListener('hardwareBackPress', onBackButtonPressed)
  }, [appState, appState.profileScreen.editing])

  const toggleNotifications = () => {
    // todo
  }

  return (
    <View flex={1} paddingTop="20px" paddingX="10px">
      <Avatar
        height="100px"
        width="100px"
        alignSelf="center"
        alignItems="center"
        source={{ uri: userViewModel.avatarUrl }}
        backgroundColor="gray.400"
        display="flex"
      >
        <Icon
          as={
            <FontAwesome5
              name={missingUserIcon}
              size={60}
              style={{ color: 'white', padding: 0, margin: 0 }}
            />
          }
        />
      </Avatar>

      <FormControl marginBottom="8px" isDisabled={loading}>
        <FormControl.Label>Avatar Url</FormControl.Label>

        <Input
          value={userViewModel.avatarUrl}
          onChangeText={url => (userViewModel.avatarUrl = url)}
          marginX="8px"
        />
      </FormControl>

      <FormControl marginBottom="15px" isDisabled={loading}>
        <FormControl.Label>Name</FormControl.Label>

        <Input
          value={userViewModel.name}
          onChangeText={name => (userViewModel.name = name)}
          marginX="8px"
        />
      </FormControl>

      <Row alignItems="center" space="8px" marginBottom="15px">
        <FormControl.Label>Allow Notifications</FormControl.Label>

        <Switch
          isChecked={!!userViewModel.notificationId}
          onValueChange={toggleNotifications}
          marginX="8px"
        />
      </Row>

      <Row marginTop="15px">
        <AppButton
          onPress={save}
          flex={1}
          disabled={loading || !userViewModel.isDirty}
          isLoading={loading}
          isLoadingText="Saving"
        >
          Save
        </AppButton>

        <ActionButton
          onPress={userViewModel.reset}
          marginLeft="10px"
          disabled={loading || !userViewModel.isDirty}
        >
          Reset
        </ActionButton>
      </Row>
    </View>
  )
})

export default EditProfilePage
