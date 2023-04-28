import { View } from 'native-base'
import React from 'react'
import { ActivityIndicator } from 'react-native'

const LoadingSection = () => {
  return (
    <View flex={1} paddingTop="20px">
      <ActivityIndicator size="large" color="#3b82f6CC" />
    </View>
  )
}

export default LoadingSection
