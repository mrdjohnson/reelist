import React from 'react'
import { IButtonProps } from 'native-base'
import { IconButtonProps } from 'react-native-vector-icons/Icon'
import ActionButton from './ActionButton'

type ToggleButtonProps = IButtonProps & {
  active: boolean
  icon?: IButtonProps['startIcon']
  activeIcon?: IButtonProps['startIcon']
  color: IButtonProps['color']
  activeColor?: IButtonProps['color']
  content: IconButtonProps['children']
  activeContent?: IconButtonProps['children']
  onPress?: (active?: boolean) => void
}

const ToggleButton = ({
  active,
  color,
  activeColor,
  icon,
  activeIcon,
  content,
  activeContent,
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
    <ActionButton
      icon={startIcon}
      color={buttonColor}
      onPress={() => props.onPress?.(active)}
      {...props}
    >
      {buttonContent}
    </ActionButton>
  )
}

export default ToggleButton
