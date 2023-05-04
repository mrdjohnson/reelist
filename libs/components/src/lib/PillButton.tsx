import React from 'react'
import { Button, IButtonProps, Text } from 'native-base'
import ActionButton, { ActionButtonProps } from '@reelist/components/ActionButton'

type PillButtonProps = {
  label: string
} & ActionButtonProps

const PillButton = ({ label, ...buttonProps }: PillButtonProps) => {
  return (
    <ActionButton rounded="full" {...buttonProps} width="fit-content">
      {label}
    </ActionButton>
  )
}

export default PillButton
