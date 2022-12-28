import { useNavigation } from '@react-navigation/native'
import { NativeStackScreenProps, NativeStackNavigationProp } from '@react-navigation/native-stack'

export type NavigatorParamList = {
  welcome: undefined
  videoListsHome: undefined
  videoListScreen: undefined
  videoListScreenSettingsModal: undefined
  search?: { initialSearchValue?: string }
  videoScreen: undefined
  videoListManagementModal: undefined
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

export const useReelistNavigation = () => {
  const navigation = useNavigation<NativeStackNavigationProp<NavigatorParamList>>()

  return navigation
}
