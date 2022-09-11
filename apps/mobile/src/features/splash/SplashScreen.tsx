import React, { useEffect } from 'react'
import { Center, Spinner, View } from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '~/hooks/useStore'
import { NavigatorParamList, ReelistScreen as ReelistScreenProps } from '~/utils/navigation'
import { load } from '~/utils/storage'
import supabase from '~/supabase'

const SplashScreen = observer(({ navigation }: ReelistScreenProps) => {
  const { auth } = useStore()
  const { loggedIn } = auth.user

  const resetNavigationTo = (name: keyof NavigatorParamList) => {
    navigation.reset({
      index: 0,
      routes: [{ name }],
    })
  }

  useEffect(() => {
    if (loggedIn) {
      resetNavigationTo('home')
    }
  }, [loggedIn, navigation])

  // if the user is signed out, navigate to welcome screen
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: string) => {
      if (event !== 'SIGNED_OUT') return

      console.log('signed out')

      auth.logout()

      resetNavigationTo('welcome')
    })

    return () => authListener?.unsubscribe()
  }, [])

  // if the user has not been signed in before, nav to welcome screen
  useEffect(() => {
    load<boolean>('has_signed_in').then(value => {
      if (!value) {
        resetNavigationTo('welcome')
      }
    })
  }, [])

  // if nothing has happened after X seconds, navigate to welcome screen
  useEffect(() => {
    const seconds = 5

    const loginTimeout = setTimeout(() => {
      resetNavigationTo('welcome')
    }, seconds * 1000)

    return () => clearTimeout(loginTimeout)
  }, [])

  return (
    <View backgroundColor="white" flex={1} justifyContent="center">
      <Center>
        <Spinner size="lg" />
      </Center>
    </View>
  )
})

export default SplashScreen
