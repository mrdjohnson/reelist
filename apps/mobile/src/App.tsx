/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { useEffect, useRef, type PropsWithChildren } from 'react'
import { Animated, Linking, StatusBar, StyleSheet, useColorScheme, View } from 'react-native'
import { Notifications } from 'react-native-notifications'
import SafeAreaView from 'react-native-safe-area-view'
import LinearGradient from 'react-native-linear-gradient'

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen'

import { NativeBaseProvider, Text, Box, ScrollView, Button, extendTheme } from 'native-base'
import AnimatedHeader from './AnimatedHeader'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useStore } from '~/hooks/useStore'
import User, { LoggedOutUser } from '@reelist/models/User'
import { observer } from 'mobx-react-lite'
import { AppNavigator } from '../from_ignite_template/app-navigator'
import WelcomeScreen from '~/features/welcome/WelcomeScreen'
import { useNavigationPersistence } from '../from_ignite_template/navigation-utilities'
import InAppBrowser from 'react-native-inappbrowser-reborn'

const Section: React.FC<
  PropsWithChildren<{
    title: string
  }>
> = ({ children, title }) => {
  const isDarkMode = useColorScheme() === 'dark'

  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}
      >
        {children}
      </Text>
    </View>
  )
}
export const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE'

const config = {
  dependencies: {
    'linear-gradient': LinearGradient,
  },
}

const App = observer(() => {
  const { auth, userStore, supabase, storage } = useStore()
  const offset = useRef(new Animated.Value(0)).current
  const isDarkMode = useColorScheme() === 'dark'
  const {
    initialNavigationState,
    onNavigationStateChange,
    isRestored: isNavigationStateRestored,
  } = useNavigationPersistence(storage, NAVIGATION_PERSISTENCE_KEY)

  const initialUrl = Linking.getInitialURL()

  initialUrl && console.log('initialUrl: ', initialUrl)

  useEffect(() => {
    const logInUser = async (authId: string) => {
      const user = await userStore.getOrCreateUser(authId)

      auth.setUser(user)
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      console.log('auth event: ', event)
      if (event !== 'SIGNED_IN') return

      if (nextSession?.user) {
        logInUser(nextSession.user.id)
      } else {
        auth.setUser(LoggedOutUser)
      }
    })

    return () => authListener?.unsubscribe()
  }, [auth, auth.user])

  //   inAppUrl:  reelist://refresh/L5I-_F6sXgVj937pQWYILw
  //  LOG  browser result:  {"url":"reelist://refresh/L5I-_F6sXgVj937pQWYILw","type":"success"}

  useEffect(() => {
    const signIn = async (refreshToken: string) => {
      const { user, session, error } = await supabase.auth.signIn({
        refreshToken,
      })

      console.log('signed in?')
      console.log('user', JSON.stringify(user))
      console.log('session', JSON.stringify(session))
      console.log('error', JSON.stringify(error))
    }

    const { remove } = Linking.addEventListener('url', ({ url }) => {
      console.log('got linking event for: ', url)
      if (!url.includes('reelist://refresh/')) return

      const refreshToken = url.replace('reelist://refresh/', '')

      console.log('Linking.addEventListener url: ', url)
      console.log('refreshToken: ', refreshToken)

      InAppBrowser.close()

      signIn(refreshToken)
    })

    return remove
  }, [])

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  }

  console.log('__dev__', __DEV__)

  useEffect(() => {
    Notifications.registerRemoteNotifications()

    Notifications.events().registerRemoteNotificationsRegistered(event => {
      // TODO: Send the token to my server so it could send back push notifications...
      console.log('Device Token Received', event.deviceToken)
    })
    Notifications.events().registerRemoteNotificationsRegistrationFailed(event => {
      console.error(event)
    })

    Notifications.events().registerNotificationReceivedForeground((notification, completion) => {
      // note that .title and .body do not work, add a helper later to grab the correct information
      console.log(
        `Notification received in foreground: ${notification.title} : ${notification.body}`,
      )
      completion({ alert: false, sound: false, badge: false })
    })

    Notifications.events().registerNotificationOpened((notification, completion) => {
      console.log(`Notification opened: ${notification.payload}`)
      completion()
    })
  }, [])

  const theme = extendTheme({
    colors: {
      // reelist scheme
      reelist: {
        // 50: '#3b82f6CC',
        // 100: '#3b82f6CC',
        // 200: '#3b82f6CC',
        // 300: '#3b82f6CC',
        // 400: '#3b82f6CC',
        // 500: '#3b82f6CC',
        600: '#3b82f6CC',
        // 700: '#3b82f6CC',
        // 800: '#3b82f6CC',
        // 900: '#3b82f6CC',
      },
    },
  })

  return (
    <NativeBaseProvider config={config} theme={theme}>
      <SafeAreaProvider>
        <AppNavigator
          initialState={initialNavigationState}
          onStateChange={onNavigationStateChange}
        />
      </SafeAreaProvider>
    </NativeBaseProvider>
  )
})

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
})

export default App
