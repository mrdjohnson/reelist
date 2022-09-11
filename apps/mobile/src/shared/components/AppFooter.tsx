import { NavigationProp, RouteProp, useRoute } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import { Center, Row, Icon, IIconProps, Pressable, Text } from 'native-base'
import React, { useEffect, useState } from 'react'
import { Keyboard } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { NavigatorParamList, useReelistNavigation } from '~/utils/navigation'

type FooterButtonProps = {
  routeName: keyof NavigatorParamList
  name: keyof NavigatorParamList
  icon: IIconProps['as']
  navigation: NavigationProp<NavigatorParamList>
  text: string
  iconSize?: number
}

const FooterButton = observer(
  ({ routeName, name, icon, navigation, text, iconSize = 5 }: FooterButtonProps) => {
    const [isPressed, setIsPressed] = useState(false)

    return (
      <Pressable
        opacity={routeName === name ? 1 : 0.5}
        onPress={() => navigation.navigate(name)}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        flex={1}
        justifyContent="center"
        alignItems="center"
        rounded="full"
        paddingY="3px"
        marginY="3px"
        backgroundColor={isPressed ? 'blue.600:alpha.30' : undefined}
      >
        <Center>
          <Icon as={icon} color="white" size={iconSize} />

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

  const [isVisible, setIsVisible] = useState(true)

  if (route.name === 'welcome') return null

  useEffect(() => {
    const onKeyboardDidShow = () => {
      setIsVisible(false)
    }

    const onKeyboardDidHide = () => {
      setIsVisible(true)
    }

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', onKeyboardDidShow)
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', onKeyboardDidHide)

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

  return (
    <Row
      bg="blue.500"
      alignItems="center"
      safeAreaBottom
      shadow={6}
      justifyContent="space-between"
      paddingX="30px"
      display={isVisible ? null : 'none'}
    >
      <FooterButton
        routeName={route.name}
        name="tracking"
        icon={<MaterialCommunityIcons name="bookmark-multiple" />}
        navigation={navigation}
        text="Bookmarks"
        iconSize={4}
      />

      <FooterButton
        routeName={route.name}
        name="home"
        icon={<MaterialCommunityIcons name="home-roof" />}
        navigation={navigation}
        text="Home"
      />

      <FooterButton
        routeName={route.name}
        name="search"
        icon={<MaterialIcons name="search" />}
        navigation={navigation}
        text="Search"
        iconSize={4}
      />
    </Row>
  )
})

export default AppFooter
