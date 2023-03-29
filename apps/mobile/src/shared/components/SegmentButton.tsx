import React from 'react'
import { IButtonProps, Row } from 'native-base'
import { IconButtonProps } from 'react-native-vector-icons/Icon'
import ActionButton from '@reelist/components/ActionButton'
import { IViewProps } from 'native-base/lib/typescript/components/basic/View/types'

type Segment = {
  icon?: IButtonProps['startIcon']
  content?: IconButtonProps['children']
  onPress?: (segmentId: number) => void
}

type SegmentButtonProps = Omit<IButtonProps, 'onPress'> & {
  selectedSegmentIndex: number
  segments: [Segment, Segment, ...Segment[]]
  color?: IButtonProps['color']
  activeColor?: IButtonProps['color']
  containerProps?: IViewProps
  onPress: (segmentId: number) => void
}

const SegmentButton = ({
  selectedSegmentIndex,
  color = 'gray.600',
  activeColor = 'blue.500',
  segments,
  containerProps,
  onPress,
  disabled,
  ...props
}: SegmentButtonProps) => {
  const onSegmentPress = (segmentIndex: number) => {
    if (segmentIndex === selectedSegmentIndex) return

    onPress(segmentIndex)
  }

  const segmentToButton = (segment: Segment, index: number) => {
    const borderProps: IButtonProps = {
      roundedLeft: index === 0 ? null : 'none',
      roundedRight: index === segments.length - 1 ? null : 'none',
      borderLeftWidth: 0,
    }

    // left segment should have a left (and rounded) border
    // selected segment should have a left border
    if (index === 0 || index === selectedSegmentIndex) {
      borderProps.borderLeftWidth = 1
    }

    // if the next segment is active, do not double the borders
    if (index + 1 === selectedSegmentIndex) {
      borderProps.borderRightWidth = 0
    }

    return (
      <ActionButton
        icon={segment.icon}
        color={selectedSegmentIndex === index && !disabled ? activeColor : color}
        onPress={() => onSegmentPress(index)}
        flex={1}
        darkenOnPressIn={selectedSegmentIndex !== index}
        darken={selectedSegmentIndex === index}
        disabled={disabled}
        {...borderProps}
        {...props}
      >
        {segment.content}
      </ActionButton>
    )
  }

  return (
    <Row {...containerProps} space="0">
      {segments.map(segmentToButton)}
    </Row>
  )
}

export default SegmentButton
