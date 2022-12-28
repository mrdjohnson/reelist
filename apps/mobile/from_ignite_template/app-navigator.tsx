/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import React from 'react'
import { useColorScheme } from 'react-native'
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { navigationRef, useBackButtonHandler } from './navigation-utilities'
import WelcomeScreen from '~/features/welcome/WelcomeScreen'
import VideoListsHomeScreen from '~/features/videoLists/VideoListsHomeScreen'
import VideoListScreen from '~/features/videoLists/VideoListScreen'
import SearchScreen from '~/features/search/SearchScreen'
import VideoScreen from '~/features/video/VideoScreen'
import { View } from 'native-base'
import AppFooter from '~/shared/components/AppFooter'
import TrackingScreen from '~/features/tracking/TrackingScreen'
import { AppEventHandler } from '~/utils/AppEventHandler'
import ProfileScreen from '~/features/profile/ProfileScreen'
import SettingsScreen from '~/features/settings/SettingsScreen'
import { NavigatorParamList } from '~/utils/navigation'
import SplashScreen from '~/features/splash/SplashScreen'
import HomeScreen from '~/features/videoLists/HomeScreen'
import EditVideoListPage from '~/features/videoLists/EditVideoListPage'
import VideoListManagementModal from '~/features/video/VideoListManagementModal'

/**
 * This type allows TypeScript to know what routes are defined in this navigator
 * as well as what properties (if any) they might take when navigating to them.
 *
 * If no params are allowed, pass through `undefined`. Generally speaking, we
 * recommend using your MobX-State-Tree store(s) to keep application state
 * rather than passing state through navigation params.
 *
 * For more information, see this documentation:
 *   https://reactnavigation.org/docs/params/
 *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
 */

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<NavigatorParamList>()

const withAppFooterHoc = (Component: React.ComponentType<any>) => {
  const ScreenWithFooter = (props: any) => (
    <View flex={1} backgroundColor="white">
      <View flex={1}>
        <Component {...props} />
      </View>

      <View flexShrink={1}>
        <AppFooter />
      </View>
    </View>
  )

  return ScreenWithFooter
}

const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="splash"
    >
      <Stack.Screen name="splash" component={SplashScreen} />

      <Stack.Screen name="welcome" component={WelcomeScreen} />

      <Stack.Screen name="home" component={withAppFooterHoc(HomeScreen)} />

      <Stack.Group screenOptions={{ animation: 'slide_from_right' }}>
        <Stack.Screen name="videoListsHome" component={withAppFooterHoc(VideoListsHomeScreen)} />

        <Stack.Screen name="videoListScreen" component={withAppFooterHoc(VideoListScreen)} />

        <Stack.Screen name="search" component={withAppFooterHoc(SearchScreen)} />

        <Stack.Screen name="videoScreen" component={withAppFooterHoc(VideoScreen)} />

        <Stack.Screen name="tracking" component={withAppFooterHoc(TrackingScreen)} />

        <Stack.Screen name="profile" component={withAppFooterHoc(ProfileScreen)} />

        <Stack.Screen name="settings" component={withAppFooterHoc(SettingsScreen)} />
      </Stack.Group>

      {/* modals here */}
      <Stack.Group screenOptions={{ animation: 'slide_from_bottom' }}>
        <Stack.Screen
          name="videoListScreenSettingsModal"
          component={withAppFooterHoc(EditVideoListPage)}
        />

        <Stack.Screen
          name="videoListManagementModal"
          component={withAppFooterHoc(VideoListManagementModal)}
        />
      </Stack.Group>
    </Stack.Navigator>
  )
}

type NavigationProps = Partial<React.ComponentProps<typeof NavigationContainer>>

export const AppNavigator = (props: NavigationProps) => {
  const colorScheme = useColorScheme()
  useBackButtonHandler(canExit)

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
      {...props}
    >
      <AppStack />

      <AppEventHandler />
    </NavigationContainer>
  )
}

AppNavigator.displayName = 'AppNavigator'

/**
 * A list of routes from which we're allowed to leave the app when
 * the user presses the back button on Android.
 *
 * Anything not on this list will be a standard `back` action in
 * react-navigation.
 *
 * `canExit` is used in ./app/app.tsx in the `useBackButtonHandler` hook.
 */
const exitRoutes = ['welcome', 'home']
export const canExit = (routeName: string) => exitRoutes.includes(routeName)
