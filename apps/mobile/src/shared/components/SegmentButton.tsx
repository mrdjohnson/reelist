import React from 'react'
import { IButtonProps, Row, View } from 'native-base'
import { IconButtonProps } from 'react-native-vector-icons/Icon'
import ActionButton from './ActionButton'
import { IViewProps } from 'native-base/lib/typescript/components/basic/View/types'

type Segment = {
  icon?: IButtonProps['startIcon']
  content?: IconButtonProps['children']
}

type SegmentButtonProps = Omit<IButtonProps, 'onPress'> & {
  selectedSegmentId: 'left' | 'right'
  leftSegment: Segment
  rightSegment: Segment
  color?: IButtonProps['color']
  activeColor?: IButtonProps['color']
  containerProps?: IViewProps
  onPress: (segmentId: string) => void
}

const SegmentButton = ({
  selectedSegmentId,
  color = 'gray.600',
  activeColor = 'blue.500',
  leftSegment,
  rightSegment,
  containerProps,
  onPress,
  ...props
}: SegmentButtonProps) => {
  const leftSegmentIsActive = selectedSegmentId === 'left'
  const rightSegmentIsActive = selectedSegmentId === 'right'

  const onLeftPress = () => {
    if (leftSegmentIsActive) return

    onPress('left')
  }

  const onRightPress = () => {
    if (rightSegmentIsActive) return

    onPress('right')
  }

  return (
    <Row {...containerProps} space="0">
      <ActionButton
        icon={leftSegment.icon}
        color={leftSegmentIsActive ? activeColor : color}
        onPress={onLeftPress}
        borderRightWidth="0"
        roundedRight="none"
        flex={1}
        darkenOnPressIn={rightSegmentIsActive}
        darken={leftSegmentIsActive}
        {...props}
      >
        {leftSegment.content}
      </ActionButton>

      <View borderLeftColor={activeColor} borderLeftWidth="1" />

      <ActionButton
        icon={rightSegment.icon}
        color={rightSegmentIsActive ? activeColor : color}
        onPress={onRightPress}
        borderLeftWidth="0"
        roundedLeft="none"
        flex={1}
        darkenOnPressIn={leftSegmentIsActive}
        darken={rightSegmentIsActive}
        {...props}
      >
        {rightSegment.content}
      </ActionButton>
    </Row>
  )
}

export default SegmentButton
