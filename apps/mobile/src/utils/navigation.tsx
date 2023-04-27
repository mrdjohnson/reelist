import { RouteProp, useNavigation } from '@react-navigation/native'
import { NativeStackScreenProps, NativeStackNavigationProp } from '@react-navigation/native-stack'
import Video from '@reelist/models/Video'

export type ReelistTabParamList = {
  tracking: undefined
  home: undefined
  search?: { initialSearchValue?: string }
}

export type NavigatorParamList = {
  welcome: undefined
  videoListsHome: undefined
  videoListScreen: undefined
  videoListScreenSettingsModal: undefined
  search?: { initialSearchValue?: string }
  videoScreen: { videoId: string }
  videoSeasonModal: { videoId: string; seasonNumber: number }
  videoListManagementModal: undefined
  videoUpdateWatchedModal: { videoId: string }
  videosModal: {
    title: string
    loadVideos: () => Promise<Video[]>
  }
  tracking: undefined
  profile: undefined
  settings: undefined
  splash: undefined
  home: undefined
}

export type ReelistScreenFrom<T extends keyof NavigatorParamList> = NativeStackScreenProps<
  NavigatorParamList,
  T
>

export type ReelistScreen = NativeStackScreenProps<NavigatorParamList>

export type ReelistNavigation = NativeStackNavigationProp<NavigatorParamList>
export type ReelistNavigationRoute = RouteProp<NavigatorParamList, keyof NavigatorParamList>
export const useReelistNavigation = () => {
  const navigation = useNavigation<ReelistNavigation>()

  return navigation
}
