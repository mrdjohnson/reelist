import React from 'react'
import { IRadioGroupProps, IRadioProps, Radio, Stack } from 'native-base'

type RadioButtonProps = Omit<IRadioProps, 'value'> & {
  value: string | number
}

type RadioButtonGroupProps = Omit<IRadioGroupProps, 'value' | 'onChange'> & {
  value: string | number
  onChange: (value: string | number) => void
}

const RadioButton = ({ value, ...props }: RadioButtonProps) => {
  return <Radio value={value as string} size="sm" {...props} />
}

const RadioButtonGroup = ({ value, onChange, children, ...props }: RadioButtonGroupProps) => {
  return (
    <Radio.Group value={value as string} colorScheme="reelist" onChange={onChange} {...props}>
      <Stack space={1.5}>{children}</Stack>
    </Radio.Group>
  )
}

RadioButton.Group = RadioButtonGroup

export default RadioButton
