import React, { useMemo, useState } from 'react'
import { Button, IButtonProps, Icon } from 'native-base'
import _ from 'lodash'

export type ActionButtonProps = IButtonProps & {
  icon?: IButtonProps['startIcon']
  color?: IButtonProps['color']
}

const ActionButton = ({ color = 'blue.500', icon, ...props }: ActionButtonProps) => {
  const [pressedIn, setPressedIn] = useState(false)

  const colorScheme = useMemo(() => {
    if (!_.isString(color)) return color

    return color.substring(0, color.indexOf('.')) || color
  }, [color])

  return (
    <Button
      variant={props.variant || 'outline'}
      borderColor={color}
      _text={{ color }}
      color={color}
      colorScheme={colorScheme}
      startIcon={icon && <Icon as={icon} color={color} />}
      rounded="full"
      onPressIn={() => setPressedIn(true)}
      onPressOut={() => setPressedIn(false)}
      backgroundColor={color + ':alpha.' + (pressedIn ? '30' : '10')}
      {...props}
    />
  )
}

export default ActionButton
