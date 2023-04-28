import React from 'react'
import ActionButton, { ActionButtonProps } from '@reelist/components/ActionButton'

const AppButton = ({ color, ...props }: ActionButtonProps) => {
  return <ActionButton variant="ghost" color={color} {...props} />
}

export default AppButton
