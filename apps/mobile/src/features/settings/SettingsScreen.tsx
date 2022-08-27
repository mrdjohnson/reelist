import React from 'react'
import { Button, Column, Icon, ScrollView, Text, useToast, View } from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '~/hooks/useStore'
import supabase from '~/supabase'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { ReelistScreen } from '~/utils/navigation'

const SettingsScreen = observer(({ navigation }: ReelistScreen) => {
  const { auth } = useStore()
  const toast = useToast()

  const logout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast.show({
        description: 'Unable to logout at this time, please try again later',
      })
    }
  }

  return (
    <ScrollView flex={1} paddingX="10px">
      <Column space="8px">
        <Text>SETTINGS SCREEN </Text>

        <Button
          leftIcon={<Icon as={<MaterialCommunityIcons name="account-edit-outline" />} />}
          onPress={() => navigation.navigate('profile')}
        >
          Edit Profile
        </Button>

        <Button onPress={logout} marginY="30px" backgroundColor="error.500" color="white">
          Logout
        </Button>
      </Column>
    </ScrollView>
  )
})

export default SettingsScreen
