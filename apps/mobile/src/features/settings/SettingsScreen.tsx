import React from 'react'
import { Center, Column, ScrollView, Text, useToast } from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '~/hooks/useStore'
import supabase from '~/supabase'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { ReelistScreen } from '~/utils/navigation'
import AppButton from '~/shared/components/AppButton'

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
        <Center>
          <Text fontSize="2xl">Settings</Text>
        </Center>

        <AppButton
          icon={<MaterialCommunityIcons name="account-outline" />}
          onPress={() => navigation.navigate('profile')}
        >
          Profile
        </AppButton>

        <AppButton
          icon={<MaterialCommunityIcons name="power" />}
          onPress={logout}
          marginY="30px"
          color="red.600"
        >
          Logout
        </AppButton>
      </Column>
    </ScrollView>
  )
})

export default SettingsScreen
