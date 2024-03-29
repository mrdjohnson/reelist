import React, { useEffect, useMemo, useState } from 'react'
import {
  Pressable,
  Text,
  View,
  Row,
  Box,
  IBoxProps,
  IPressableProps,
  useToast,
  ScrollView,
} from 'native-base'
import { observer } from 'mobx-react-lite'
import { ReelistScreen, useReelistNavigation } from '~/utils/navigation'
import useIsPressed from '~/hooks/useIsPressed'
import ProfileIcon from '~/shared/components/ProfileIcon'
import { useStore } from '@reelist/utils/hooks/useStore'
import NamedTileRow from '~/shared/components/NamedTileRow'
import LoginButton from '~/components/LoginButton'

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
  const { videoStore, userStore, auth } = useStore()

  const alertMissingFavoritesScreen = () => {
    toast.show({
      description: 'Coming soon',
    })
  }

  if (!auth.loggedIn) {
    return (
      <View flex={1}>
        <Text fontSize="xl" margin="10px" textAlign="center">
          {' '}
          Login to see Book marks, Public and private lists, and other users!
        </Text>

        <LoginButton marginY="30px" marginX="10px" />
      </View>
    )
  }

  return (
    <View flex={1}>
      <Row justifyContent="space-between" paddingTop="10px" paddingX="3">
        <View />

        <PressableProfileIcon />
      </Row>

      <Row space={3} paddingTop="20px" paddingX="3">
        <HomeScreenTile
          roundedRight="none"
          start={[1, 0]}
          end={[0.5, 0.5]}
          // @ts-ignore
          onPress={() => navigation.navigate('tracking', { screen: 'trackingTab' })}
        >
          Bookmarks
        </HomeScreenTile>

        <HomeScreenTile
          rounded="none"
          start={[0, 0]}
          end={[0, 1]}
          onPress={() => navigation.push('videoListsHome')}
        >
          Watchlists
        </HomeScreenTile>

        <HomeScreenTile
          roundedLeft="none"
          start={[0, 0]}
          end={[0.5, 0.5]}
          onPress={alertMissingFavoritesScreen}
        >
          Following
        </HomeScreenTile>
      </Row>

      <ScrollView marginTop="10px">
        <NamedTileRow
          label="Bookmarks"
          loadVideos={() => videoStore.getTrackedVideos({ baseOnly: true })}
          showMoreText="All Bookmarks"
          // @ts-ignore
          onShowMore={() => navigation.navigate('tracking', { screen: 'trackingTab' })}
        />

        <NamedTileRow
          label="History"
          loadVideos={() => videoStore.getHistoricVideos()}
          showMoreText="See History Page"
        />

        <NamedTileRow
          label="Followed Users"
          loadUsers={userStore.getFollowedUsers}
          showMoreText="See Followed Users"
        />
      </ScrollView>
    </View>
  )
})

export default HomeScreen
