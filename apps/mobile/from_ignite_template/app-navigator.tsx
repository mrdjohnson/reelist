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
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { navigationRef, useBackButtonHandler } from './navigation-utilities'
import WelcomeScreen from '~/features/welcome/WelcomeScreen'
import VideoListsHomeScreen from '~/features/videoLists/VideoListsHomeScreen'
import VideoListScreen from '~/features/videoLists/VideoListScreen'
import SearchScreen from '~/features/search/SearchScreen'
import VideoScreen from '~/features/video/VideoScreen'
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

const Stack = createNativeStackNavigator<NavigatorParamList>()
const Tab = createBottomTabNavigator<NavigatorParamList>()

// this is one way to allow us to access common tabs from any screen
const createSubStack = (name: string, component: React.ComponentType<any>) => {
  const Stack = createNativeStackNavigator()

  return (
    <Stack.Navigator
      initialRouteName={name}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name={name} component={component} />

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
      </Stack.Group>
    </Stack.Navigator>
  )
}

const TrackingTabs = () => createSubStack('tracking', TrackingScreen)
const HomeTabs = () => createSubStack('home', HomeScreen)
const SearchTabs = () => createSubStack('search', SearchScreen)

const AppTabs = () => {
  return (
    <Tab.Navigator
      tabBar={props => <AppFooter {...props} />}
      initialRouteName="home"
      screenOptions={() => ({
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="tracking"
        component={TrackingTabs}
        options={{
          tabBarLabel: 'Bookmarks',
        }}
      />

      <Tab.Screen
        name="home"
        component={HomeTabs}
        options={{
          tabBarLabel: 'Home',
        }}
      />

      <Tab.Screen
        name="search"
        component={SearchTabs}
        options={{
          tabBarLabel: 'Search',
        }}
      />
    </Tab.Navigator>
  )
}

// no tabs here
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

      <Stack.Screen name="home" component={AppTabs} />
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
