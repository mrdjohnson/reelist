import React from 'react'
import { IButtonProps } from 'native-base'
import { IconButtonProps } from 'react-native-vector-icons/Icon'
import ActionButton from '@reelist/components/ActionButton'

type ToggleButtonProps = Omit<IButtonProps, 'onPress'> & {
  active: boolean
  icon?: IButtonProps['startIcon']
  activeIcon?: IButtonProps['startIcon']
  color?: IButtonProps['color']
  activeColor?: IButtonProps['color']
  content: IconButtonProps['children']
  activeContent?: IconButtonProps['children']
  onPress: (nextActive?: boolean) => void
}

const ToggleButton = ({
  active,
  color = 'gray.600',
  activeColor = 'blue.500',
  icon,
  activeIcon,
  content,
  activeContent,
  onPress,
  ...props
}: ToggleButtonProps) => {
  let startIcon = icon
  let buttonContent = content
  let buttonColor = color

  if (active) {
    startIcon = activeIcon || icon
    buttonContent = activeContent || content
    buttonColor = activeColor || color
  }

  return (
    <ActionButton icon={startIcon} color={buttonColor} onPress={() => onPress(!active)} {...props}>
      {buttonContent}
    </ActionButton>
  )
}

export default ToggleButton
