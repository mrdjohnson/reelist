import React from 'react'
import ActionButton, { ActionButtonProps } from '~/components/ActionButton'

const AppButton = ({ color, ...props }: ActionButtonProps) => {
  return <ActionButton variant="ghost" color={color} {...props} />
}

export default AppButton
