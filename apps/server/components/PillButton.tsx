import { Button, ButtonProps } from '@mui/material'
import { ReactNode } from 'react'

type PillButtonProps = ButtonProps & {
  label: string
  rightIcon: ReactNode
}

const PillButton = ({ label, rightIcon, className = '', ...props }: PillButtonProps) => {
  return (
    <Button
      className={'font-inter group rounded-full border border-solid px-3 ' + className}
      {...props}
      disableRipple
    >
      {label}

      {rightIcon}
    </Button>
  )
}

export default PillButton
