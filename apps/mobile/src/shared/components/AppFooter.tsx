import { NavigationProp, RouteProp, useRoute } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import { Box, Button, Center, HStack, Icon, Pressable, Text, View } from 'native-base'
import React, { ReactElement } from 'react'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { NavigatorParamList, useReelistNavigation } from '~/utils/navigation'

type FooterButtonProps = {
  routeName: keyof NavigatorParamList
  name: keyof NavigatorParamList
  selectedIcon: ReactElement
  unSelectedIcon?: ReactElement
  navigation: NavigationProp<NavigatorParamList>
  text: string
}

const FooterButton = observer(
  ({ routeName, name, selectedIcon, unSelectedIcon, navigation, text }: FooterButtonProps) => {
    let icon = selectedIcon

    if (unSelectedIcon && routeName !== name) {
      icon = unSelectedIcon
    }

    return (
      <Pressable
        opacity={routeName === name ? 1 : 0.5}
        py="3"
        flex={1}
        onPress={() => navigation.navigate(name)}
      >
        <Center>
          <Icon mb="1" as={icon} color="white" size={5} />

          <Text color="white" fontSize="12">
            {text}
          </Text>
        </Center>
      </Pressable>
    )
  },
)

const AppFooter = observer(() => {
  const navigation = useReelistNavigation()
  const route = useRoute<RouteProp<NavigatorParamList>>()

  if (route.name === 'welcome') return null

  return (
    <HStack bg="indigo.600" alignItems="center" safeAreaBottom shadow={6}>
      <FooterButton
        routeName={route.name}
        name="tracking"
        selectedIcon={<MaterialIcons name="track-changes" />}
        navigation={navigation}
        text="Tracked"
      />

      <FooterButton
        routeName={route.name}
        name="videoListsHome"
        selectedIcon={<MaterialCommunityIcons name="format-list-text" />}
        unSelectedIcon={<MaterialCommunityIcons name="playlist-star" />}
        navigation={navigation}
        text="Home"
      />

      <FooterButton
        routeName={route.name}
        name="search"
        selectedIcon={<MaterialIcons name="search" />}
        navigation={navigation}
        text="Search"
      />
    </HStack>
  )
})

export default AppFooter
