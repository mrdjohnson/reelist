import React, { useMemo, useState } from 'react'
import {
  Button,
  Input,
  Image,
  FormControl,
  View,
  Avatar,
  Icon,
  Center,
  Row,
  useToast,
  Switch,
  Text,
} from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '~/hooks/useStore'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import _ from 'lodash'
import supabase from '~/supabase'
import { NavigatorParamList } from '../../../from_ignite_template/app-navigator'
import { createViewModel } from 'mobx-utils'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import User from '~/models/User'

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

const ProfileScreen = observer(({ navigation }: NativeStackScreenProps<NavigatorParamList>) => {
  const { auth } = useStore()
  const user = auth.user
  const [loading, setLoading] = useState(false)

  const toast = useToast()

  const missingUserIcon = useMemo(() => {
    return _.sample(missingIconOptions) || 'user-secret'
  }, [])

  const userViewModel = useMemo(() => {
    return createViewModel(user)
  }, [user])

  const save = async () => {
    setLoading(true)

    const errorMessage = await User.save(userViewModel)

    const description = errorMessage || 'Saved'

    toast.show({
      description,
      duration: 3000,
    })

    setLoading(false)
  }

  const toggleNotifications = () => {
    // todo
  }

  return (
    <View flex={1} backgroundColor="white" paddingTop="20px" paddingX="10px">
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
        <Button
          onPress={save}
          color="white"
          flex={1}
          disabled={loading || !userViewModel.isDirty}
          isLoading={loading}
          isLoadingText="Saving"
        >
          Save
        </Button>

        <Button
          onPress={userViewModel.reset}
          color="white"
          marginLeft="10px"
          variant="outline"
          disabled={loading || !userViewModel.isDirty}
        >
          Reset
        </Button>
      </Row>

      <Button onPress={auth.logout} marginTop="30px" backgroundColor="error.500" color="white">
        Logout
      </Button>
    </View>
  )
})

export default ProfileScreen
