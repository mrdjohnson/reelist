import React, { useState } from 'react'
import { Divider, Pressable, Row, View, Text } from 'native-base'
import { IViewProps } from 'native-base/lib/typescript/components/basic/View/types'

type DetailsPanelProps = IViewProps & {
  text: string
}

const DetailsPanel = ({ text, children, ...props }: DetailsPanelProps) => {
  const [displayContent, setDisplayContent] = useState(false)

  return (
    <View borderWidth="1px" borderColor="gray.300" rounded="lg" padding="10px" {...props}>
      <Pressable onPress={() => setDisplayContent(!displayContent)}>
        <Row alignItems="center">
          <Text fontWeight="semibold" fontSize="lg">
            {text}
          </Text>
          <Text>{displayContent ? '  v' : '  >'}</Text>
        </Row>
      </Pressable>

      {displayContent && (
        <>
          <Divider orientation="horizontal" marginY="10px" />

          <View>{children}</View>
        </>
      )}
    </View>
  )
}

export default DetailsPanel
