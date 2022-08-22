import React, { useEffect } from 'react'
import { Button, Center, Text, View } from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '~/hooks/useStore'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { InAppBrowser } from 'react-native-inappbrowser-reborn'
import { NavigatorParamList } from '../../../from_ignite_template/app-navigator'

const WelcomeScreen = observer(({ navigation }: NativeStackScreenProps<NavigatorParamList>) => {
  const { auth } = useStore()
  const { loggedIn } = auth.user

  useEffect(() => {
    if (loggedIn) {
      navigation.navigate('tracking')
    }
  }, [loggedIn, navigation])

  const login = async () => {
    const result = await InAppBrowser.openAuth('https://reelist.app/login', 'reelist://refresh')

    if ('url' in result) {
      console.log('browser result: ', JSON.stringify(result))
    }

    InAppBrowser.close()
  }

  return (
    <View backgroundColor="white" flex={1}>
      <Center>
        <Text fontSize="5xl" marginBottom="20px">
          Reelist
        </Text>
      </Center>

      {!loggedIn && (
        <Button onPress={login} marginTop="20px" marginX="10px">
          Login
        </Button>
      )}
    </View>
  )
})

export default WelcomeScreen
