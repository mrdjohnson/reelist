import React, { useMemo } from 'react'
import { Pressable, Text, View, Row, Box, IBoxProps, IPressableProps, useToast } from 'native-base'
import { observer } from 'mobx-react-lite'
import { ReelistScreen, useReelistNavigation } from '~/utils/navigation'
import useIsPressed from '~/hooks/useIsPressed'
import ProfileIcon from '~/shared/components/ProfileIcon'
import { useStore } from '~/hooks/useStore'

type HomeScreenTileProps = IBoxProps & {
  start: number[]
  end: number[]
  onPress: IPressableProps['onPress']
}

const HomeScreenTile = ({ start, end, onPress, children, ...props }: HomeScreenTileProps) => {
  const { isPressed, ...pressedProps } = useIsPressed()

  const linearGradientColors = useMemo(() => {
    if (isPressed) {
      return ['blue.300:alpha.40', 'blue.300:alpha.30', 'blue.300:alpha.30']
    }

    return ['blue.300:alpha.20', 'blue.300:alpha.30', 'blue.300:alpha.30']
  }, [isPressed])

  return (
    <Pressable {...pressedProps} height="100px" onPress={onPress} flex={1}>
      <Box
        justifyContent="center"
        alignItems="center"
        rounded="lg"
        background={{
          linearGradient: {
            colors: linearGradientColors,
            start,
            end,
          },
        }}
        flex={1}
        {...props}
      >
        <Text>{children}</Text>
      </Box>
    </Pressable>
  )
}

const PressableProfileIcon = () => {
  const { auth } = useStore()
  const navigation = useReelistNavigation()
  const { isPressed, ...isPressedProps } = useIsPressed()

  return (
    <Pressable
      onPress={() => navigation.push('profile')}
      {...isPressedProps}
      opacity={isPressed ? 0.6 : 1}
    >
      <ProfileIcon user={auth.user} size="sm" />
    </Pressable>
  )
}

const HomeScreen = observer(({ navigation }: ReelistScreen) => {
  const toast = useToast()

  const alertMissingFavoritesScreen = () => {
    toast.show({
      description: 'Coming soon',
    })
  }

  return (
    <View flex={1} paddingX="3">
      <Row justifyContent="space-between" paddingTop="10px">
        <View />

        <PressableProfileIcon />
      </Row>

      <Row space={3} paddingTop="20px">
        <HomeScreenTile
          roundedRight="none"
          start={[1, 0]}
          end={[0.5, 0.5]}
          onPress={() => navigation.navigate('tracking', { screen: 'tracking' })}
        >
          My Bookmarks
        </HomeScreenTile>

        <HomeScreenTile
          rounded="none"
          start={[0, 0]}
          end={[0, 1]}
          onPress={() => navigation.push('videoListsHome')}
        >
          My Lists
        </HomeScreenTile>

        <HomeScreenTile
          roundedLeft="none"
          start={[0, 0]}
          end={[0.5, 0.5]}
          onPress={alertMissingFavoritesScreen}
        >
          My Favorites
        </HomeScreenTile>
      </Row>
    </View>
  )
})

export default HomeScreen
