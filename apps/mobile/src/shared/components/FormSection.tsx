import React from 'react'
import { FormControl, IFormControlProps, View } from 'native-base'

type FormSectionProps = IFormControlProps & {
  label: string
  helperText?: string
  errorMessage?: string | null
}

const FormSection = ({ label, helperText, errorMessage, children, ...props }: FormSectionProps) => {
  return (
    <FormControl {...props} marginBottom="10px" padding="0">
      <FormControl.Label marginTop="0">{label}</FormControl.Label>

      <View marginLeft="5px">{children}</View>

      {helperText && (
        <FormControl.HelperText marginLeft="5px" marginTop="5px">
          {helperText}
        </FormControl.HelperText>
      )}

      {errorMessage && (
        <FormControl.ErrorMessage marginLeft="5px">{errorMessage}</FormControl.ErrorMessage>
      )}
    </FormControl>
  )
}

export default FormSection
