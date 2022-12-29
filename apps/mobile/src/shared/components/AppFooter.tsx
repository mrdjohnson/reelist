import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { observer } from 'mobx-react-lite'
import { Center, Row, Icon, IIconProps, Pressable, Text } from 'native-base'
import React, { useEffect, useState } from 'react'
import { Keyboard } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { ReelistTabParamList } from '~/utils/navigation'

type FooterButtonProps = {
  routeName: string
  name: keyof ReelistTabParamList
  icon: IIconProps['as']
  text: string
  iconSize?: number
  navigation: BottomTabBarProps['navigation']
}

const FooterButton = observer(
  ({ routeName, name, icon, text, iconSize = 5, navigation }: FooterButtonProps) => {
    const [isPressed, setIsPressed] = useState(false)

    return (
      <Pressable
        opacity={routeName === name ? 1 : 0.5}
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name }],
          })
        }
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

const AppFooter = observer(({ navigation, state }: BottomTabBarProps) => {
  const [isVisible, setIsVisible] = useState(true)

  const routeName = state.routeNames[state.index]

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
        routeName={routeName}
        name="tracking"
        icon={<MaterialCommunityIcons name="bookmark-multiple" />}
        text="Bookmarks"
        iconSize={4}
        navigation={navigation}
      />

      <FooterButton
        routeName={routeName}
        name="home"
        icon={<MaterialCommunityIcons name="home-roof" />}
        text="Home"
        navigation={navigation}
      />

      <FooterButton
        routeName={routeName}
        name="search"
        icon={<MaterialIcons name="search" />}
        text="Search"
        iconSize={4}
        navigation={navigation}
      />
    </Row>
  )
})

export default AppFooter
