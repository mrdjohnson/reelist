import { NavigationProp, useNavigation } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'

export type NavigatorParamList = {
  welcome: undefined
  videoListsHome: undefined
  videoListScreen: undefined
  search: undefined
  videoScreen: undefined
  tracking: undefined
  profile: undefined
  settings: undefined
  splash: undefined
}

export type ReelistScreen = NativeStackScreenProps<NavigatorParamList>

export const useReelistNavigation = () => {
  const navigation = useNavigation<NavigationProp<NavigatorParamList>>()

  return navigation
}
