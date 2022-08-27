import React, { useState } from 'react'
import { Button, Flex, ScrollView, Text, useToast, View } from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '~/hooks/useStore'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import Video from '~/models/Video'
import { callTmdb } from '~/api/api'
import _ from 'lodash'
import { NavigatorParamList } from '../../../from_ignite_template/app-navigator'
import supabase from '~/supabase'

const SettingsScreen = observer(({ navigation }: NativeStackScreenProps<NavigatorParamList>) => {
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
      <Text>SETTINGS SCREEN </Text>

      <Button onPress={logout} marginY="30px" backgroundColor="error.500" color="white">
        Logout
      </Button>
    </ScrollView>
  )
})

export default SettingsScreen
