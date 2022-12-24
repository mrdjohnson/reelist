import React, { useMemo, useState } from 'react'
import { Button, IButtonProps, Icon } from 'native-base'
import _ from 'lodash'

export type ActionButtonProps = IButtonProps & {
  icon?: IButtonProps['startIcon']
  color?: IButtonProps['color']
  variant?: IButtonProps['variant']
  darken?: boolean
  darkenOnPressIn?: boolean
}

const ActionButton = ({
  color = 'blue.500',
  icon,
  variant = 'outline',
  darken = true,
  darkenOnPressIn = true,
  disabled,
  ...props
}: ActionButtonProps) => {
  const [pressedIn, setPressedIn] = useState(false)

  const colorScheme = useMemo(() => {
    if (!_.isString(color)) return color

    return color.substring(0, color.indexOf('.')) || color
  }, [color])

  const backgroundColor = useMemo(() => {
    if (!disabled) {
      if (!darken) return null
    }

    const alphaValue = darkenOnPressIn && pressedIn ? '30' : '10'

    return color + ':alpha.' + alphaValue
  }, [darken, pressedIn, color, darkenOnPressIn, disabled])

  return (
    <Button
      variant={variant || 'outline'}
      borderColor={color}
      _text={{ color }}
      color={color}
      colorScheme={colorScheme}
      startIcon={icon && <Icon as={icon} color={color} />}
      rounded="full"
      onPressIn={() => setPressedIn(true)}
      onPressOut={() => setPressedIn(false)}
      backgroundColor={backgroundColor}
      disabled={disabled}
      {...props}
    />
  )
}

export default ActionButton
