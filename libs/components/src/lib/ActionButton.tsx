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

  return (
    <Button
      variant={variant || 'outline'}
      borderColor={color}
      // _text={{ fontFamily: 'Inter' }}
      // color={color}
      colorScheme={colorScheme}
      startIcon={icon && <Icon as={icon} />}
      endIcon={endIcon && <Icon as={endIcon} />}
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
