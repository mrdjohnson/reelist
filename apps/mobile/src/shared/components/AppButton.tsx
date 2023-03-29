import React from 'react'
import ActionButton, { ActionButtonProps } from '@reelist/components/ActionButton'

const AppButton = ({ color, icon, ...props }: ActionButtonProps) => {
  return <ActionButton variant="ghost" icon={icon} color={color} {...props} />
}

export default AppButton
