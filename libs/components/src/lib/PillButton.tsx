import React from 'react'
import { Button, IButtonProps, Text } from 'native-base'
import ActionButton, { ActionButtonProps } from '@reelist/components/ActionButton'

type PillButtonProps = {
  label: string
} & ActionButtonProps

const PillButton = ({ label, ...buttonProps }: PillButtonProps) => {
  return (
    <ActionButton variant="outline" rounded="full" {...buttonProps} width="fit-content">
      <Text>{label}</Text>
    </ActionButton>
  )
}

export default PillButton
