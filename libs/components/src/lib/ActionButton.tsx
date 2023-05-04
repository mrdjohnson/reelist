import React, { useMemo, useState } from 'react'
import { Button, IButtonProps, Icon } from 'native-base'
import _ from 'lodash'

export type ActionButtonProps = IButtonProps & {
  icon?: IButtonProps['startIcon']
  endIcon?: IButtonProps['endIcon']
  color?: IButtonProps['color']
  variant?: IButtonProps['variant']
  darken?: boolean
  darkenOnPressIn?: boolean
  darknessLevel?: number
}

const ActionButton = ({
  color: colorProp = 'reelist.500',
  colorScheme = 'reelist',
  icon,
  endIcon,
  variant = 'outline',
  darken = true,
  darkenOnPressIn = true,
  darknessLevel = 10,
  disabled,
  ...props
}: ActionButtonProps) => {
  const [pressedIn, setPressedIn] = useState(false)

  const color = useMemo(() => {
    return disabled ? 'dark.500' : colorProp
  }, [colorProp, disabled])

  // const colorScheme = useMemo(() => {
  //   if (!_.isString(color)) return color

  //   return color.substring(0, color.indexOf('.')) || color
  // }, [color])

  // const backgroundColor = useMemo(() => {
  //   if (!disabled) {
  //     if (!darken) return null
  //   }

  //   const alphaValue = darknessLevel + (darkenOnPressIn && pressedIn ? 20 : 0)

  //   if (alphaValue >= 100) return 'transparent'

  //   return color + ':alpha.' + alphaValue
  // }, [darken, pressedIn, color, darkenOnPressIn, disabled, darknessLevel])

  return (
    <Button
      variant={variant || 'outline'}
      borderColor={color}
      // _text={{ fontFamily: 'Inter' }}
      // color={color}
      colorScheme={colorScheme}
      startIcon={icon && <Icon as={icon} color={color} />}
      endIcon={endIcon && <Icon as={endIcon} color={color} />}
      rounded="full"
      onPressIn={() => setPressedIn(true)}
      onPressOut={() => setPressedIn(false)}
      // backgroundColor={backgroundColor}
      disabled={disabled}
      {...props}
    />
  )
}

export default ActionButton
