import { Text } from 'native-base'
import * as React from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const HEADER_HEIGHT = 200
const MIN_HEADER_HEIGHT = 50

// Code derived from https://blog.jscrambler.com/how-to-animate-a-header-view-on-scroll-with-react-native-animated
export default function AnimatedHeader({ animatedValue }: { animatedValue: Animated.Value }) {
  const insets = useSafeAreaInsets()

  const headerHeight = animatedValue.interpolate({
    inputRange: [0, HEADER_HEIGHT + insets.top],
    outputRange: [HEADER_HEIGHT + insets.top, insets.top + MIN_HEADER_HEIGHT],
    extrapolate: 'clamp',
  })
  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        height: headerHeight,
        backgroundColor: 'lightblue',
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <Text
        numberOfLines={2}
        fontSize={{
          base: 'md',
          md: 'lg',
          lg: 'xl',
        }}
      >
        Top Header Content
      </Text>

      <Text
        numberOfLines={2}
        fontSize={{
          base: 'md',
          md: 'lg',
          lg: 'xl',
        }}
      >
        Bottom Header Content
      </Text>
    </Animated.View>
  )
}
