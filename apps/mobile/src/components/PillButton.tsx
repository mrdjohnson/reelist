import React from 'react'
import { Button, IButtonProps, Text } from 'native-base'
import ActionButton, { ActionButtonProps } from '~/components/ActionButton'

type PillButtonProps = {
  label: string
} & ActionButtonProps

const PillButton = ({ label, ...buttonProps }: PillButtonProps) => {
  return (
    <ActionButton rounded="full" width="fit-content" {...buttonProps} >
      {label}
    </ActionButton>
  )
}

export default PillButton
