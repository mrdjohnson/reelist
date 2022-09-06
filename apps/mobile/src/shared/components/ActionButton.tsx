import React, { useMemo } from 'react'
import { Button, IButtonProps, Icon } from 'native-base'
import _ from 'lodash'

export type ActionButtonProps = IButtonProps & {
  icon?: IButtonProps['startIcon']
  color?: IButtonProps['color']
}

const ActionButton = ({ color = 'blue.500', icon, ...props }: ActionButtonProps) => {
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
      {...props}
    />
  )
}

export default ActionButton
