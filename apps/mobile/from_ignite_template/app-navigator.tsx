/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { navigationRef, useBackButtonHandler } from './navigation-utilities'
import WelcomeScreen from '~/features/welcome/WelcomeScreen'
import VideoListsHomeScreen from '~/features/videoLists/VideoListsHomeScreen'
import VideoListScreen from '~/features/videoLists/VideoListScreen'
import DiscoverScreen from '~/features/discover/DiscoverScreen'
import VideoScreen from '~/features/video/VideoScreen'
import AppFooter from '~/shared/components/AppFooter'
import TrackingScreen from '~/features/tracking/TrackingScreen'
import { AppEventHandler } from '~/utils/AppEventHandler'
import ProfileScreen from '~/features/profile/ProfileScreen'
import SettingsScreen from '~/features/settings/SettingsScreen'
import { NavigatorParamList, ReelistTabParamList } from '~/utils/navigation'
import SplashScreen from '~/features/splash/SplashScreen'
import HomeScreen from '~/features/videoLists/HomeScreen'
import EditVideoListPage from '~/features/videoLists/EditVideoListPage'
import VideoListManagementModal from '~/features/video/VideoListManagementModal'
import AppActionSheets from '~/shared/components/AppActionSheets'
import VideosModal from '~/features/videos/VideosModal'
import VideoSeasonModal from '~/features/video/VideoSeasonModal'
import VideoUpdateWatchedModal from '~/features/video/VideoUpdateWatchedModal'

const Tab = createBottomTabNavigator<ReelistTabParamList>()

// this is one way to allow us to access common tabs from any screen
const createSubStack = (
  componentName: keyof NavigatorParamList,
  component: React.ComponentType<any>,
) => {
  const Stack = createNativeStackNavigator<NavigatorParamList>()

  return (
    <>
      <Stack.Navigator
        initialRouteName={componentName}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name={componentName} component={component} />

        <Stack.Group screenOptions={{ animation: 'slide_from_right' }}>
          <Stack.Screen name="videoListsHome" component={VideoListsHomeScreen} />

          <Stack.Screen name="videoListScreen" component={VideoListScreen} />

          <Stack.Screen name="videoScreen" component={VideoScreen} />

          <Stack.Screen name="profile" component={ProfileScreen} />

          <Stack.Screen name="settings" component={SettingsScreen} />
        </Stack.Group>

        {/* modals here */}
        <Stack.Group screenOptions={{ animation: 'slide_from_bottom' }}>
          <Stack.Screen name="videoListScreenSettingsModal" component={EditVideoListPage} />

          <Stack.Screen name="videoListManagementModal" component={VideoListManagementModal} />

          <Stack.Screen name="videoSeasonModal" component={VideoSeasonModal} />

          <Stack.Screen name="videoUpdateWatchedModal" component={VideoUpdateWatchedModal} />

          <Stack.Screen name="videosModal" component={VideosModal} />
        </Stack.Group>
      </Stack.Navigator>

      <AppActionSheets />
    </>
  )
}

const TrackingTabs = () => createSubStack('tracking', TrackingScreen)
const HomeTabs = () => createSubStack('home', HomeScreen)
const DiscoverTabs = () => createSubStack('discover', DiscoverScreen)

const AppTabs = () => {
  return (
    <Tab.Navigator
      tabBar={props => <AppFooter {...props} />}
      initialRouteName="discoverTab"
      screenOptions={() => ({
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="trackingTab"
        component={TrackingTabs}
        options={{
          tabBarLabel: 'Bookmarks',
        }}
      />

      <Tab.Screen
        name="homeTab"
        component={HomeTabs}
        options={{
          tabBarLabel: 'Home',
        }}
      />

      <Tab.Screen
        name="discoverTab"
        component={DiscoverTabs}
        options={{
          tabBarLabel: 'Discover',
        }}
      />
    </Tab.Navigator>
  )
}

type NavigationProps = Partial<React.ComponentProps<typeof NavigationContainer>>

export const AppNavigator = (props: NavigationProps) => {
  useBackButtonHandler(canExit)

  return (
    <NavigationContainer ref={navigationRef} {...props}>
      <AppTabs />

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
