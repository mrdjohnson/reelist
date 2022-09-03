import React, { useMemo } from 'react'
import { Button, IButtonProps, Icon } from 'native-base'
import { IconButtonProps } from 'react-native-vector-icons/Icon'
import _ from 'lodash'

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

  const colorScheme = useMemo(() => {
    if (!_.isString(buttonColor)) return buttonColor

    return buttonColor.substring(0, buttonColor.indexOf('.')) || buttonColor
  }, [buttonColor])

  return (
    <Button
      variant="outline"
      borderColor={buttonColor}
      _text={{ color: buttonColor }}
      color={buttonColor}
      colorScheme={colorScheme}
      startIcon={startIcon && <Icon as={startIcon} color={buttonColor} />}
      onPress={() => props.onPress?.(active)}
      {...props}
    >
      {buttonContent}
    </Button>
  )
}

export default ToggleButton
