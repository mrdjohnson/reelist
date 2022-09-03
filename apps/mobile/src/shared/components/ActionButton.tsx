import React, { useMemo } from 'react'
import { Button, IButtonProps, Icon } from 'native-base'
import { IconButtonProps } from 'react-native-vector-icons/Icon'
import _ from 'lodash'

type ActionButtonProps = IButtonProps & {
  icon?: IButtonProps['startIcon']
  color: IButtonProps['color']
  content: IconButtonProps['children']
}

const ActionButton = ({ color, icon, content, ...props }: ActionButtonProps) => {
  const colorScheme = useMemo(() => {
    if (!_.isString(color)) return color

    return color.substring(0, color.indexOf('.')) || color
  }, [color])

  return (
    <Button
      variant="outline"
      borderColor={color}
      _text={{ color }}
      color={color}
      colorScheme={colorScheme}
      startIcon={icon && <Icon as={icon} color={color} />}
      {...props}
    >
      {content}
    </Button>
  )
}

export default ActionButton
