import React, { useMemo, useState } from 'react'
import { View, Avatar, Icon, Center, Column, useToast, Text, Button } from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '~/hooks/useStore'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import _ from 'lodash'
import { NavigatorParamList } from '../../../from_ignite_template/app-navigator'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import EditProfilePage from './EditProfilePage'

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
  const { auth, appState } = useStore()
  const user = appState.profileScreen.user || auth.user

  const missingUserIcon = useMemo(() => {
    return _.sample(missingIconOptions) || 'user-secret'
  }, [])

  if (appState.profileScreen.editing) {
    return <EditProfilePage />
  }

  return (
    <View flex={1} backgroundColor="white" paddingTop="20px" paddingX="10px">
      <Column space={4} backgroundColor="blue">
        <Avatar
          height="100px"
          width="100px"
          alignSelf="center"
          alignItems="center"
          source={{ uri: user.avatarUrl }}
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

        <Center>
          <Text fontSize="xl">{user.name}</Text>
        </Center>

        <Center>
          {user === auth.user && (
            <Button
              leftIcon={<Icon as={<MaterialCommunityIcons name="account-edit-outline" />} />}
              onPress={() => appState.setProfileScreenEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </Center>
      </Column>
    </View>
  )
})

export default ProfileScreen
