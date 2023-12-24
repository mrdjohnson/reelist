import { Button, ButtonProps } from '@mui/material'
import classNames from 'classnames'
import { MutableRefObject, ReactNode } from 'react'

type PillButtonProps = ButtonProps & {
  label: string
  rightIcon: ReactNode
  inverted?: boolean
  solid?: boolean
  pillButtonRef?: MutableRefObject<HTMLButtonElement>
  noBorder?: boolean
}

const PillButton = ({
  label,
  rightIcon,
  inverted,
  disabled,
  solid,
  noBorder,
  pillButtonRef,
  className = '',
  ...props
}: PillButtonProps) => {
  return (
    <Button
      ref={pillButtonRef}
      className={classNames(
        'group rounded-full border border-solid transition-all duration-200',
        'text-lg font-semibold',
        'scale-95 hover:scale-100',
        'discover-md:py-1 mt-2 px-3 py-3',
        className,
        {
          'hover:border-reelist-red border-transparent': noBorder,
          'border-reelist-red hover:text-reelist-red bg-transparent-dark text-slate-200':
            !inverted && !disabled && !solid,
          'border-gray-500 text-gray-500 opacity-40': disabled,
          'bg-reelist-red text-black': inverted,
          'bg-reelist-red !scale-100 !border-0 !text-xl text-black hover:text-white': solid,
        },
      )}
      {...props}
      disabled={disabled}
      disableRipple
    >
      {label}

      {rightIcon}
    </Button>
  )
}

export default PillButton
