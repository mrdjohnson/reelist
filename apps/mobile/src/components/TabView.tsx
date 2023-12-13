import React, { ReactElement, useState } from 'react'
import { Pressable, Row, Text, View } from 'native-base'

type TabViewProps = {
  routes: Array<{ name: string; render: () => ReactElement }>
  showTabBar?: boolean
}

const TabView = ({ routes, showTabBar }: TabViewProps) => {
  const [tabIndex, setTabIndex] = useState(0)

  return (
    <View>
      <Row>
        {showTabBar &&
          routes.map((route, i) => {
            const color = tabIndex === i ? 'transparent' : 'blue.300:alpha.30'

            return (
              <Pressable
                key={route.name}
                padding="2"
                alignItems="center"
                flex={1}
                onPress={() => setTabIndex(i)}
                borderBottomWidth="3"
                borderColor={color}
                backgroundColor={color}
              >
                <Text>{route.name}</Text>
              </Pressable>
            )
          })}
      </Row>

      {routes[tabIndex].render()}
    </View>
  )
}

export default TabView
