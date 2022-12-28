import React from 'react'
import ActionButton, { ActionButtonProps } from './ActionButton'

const LinkButton = (props: ActionButtonProps) => {
  return (
    <ActionButton
      variant="ghost"
      darken={false}
      darkenOnPressIn
      paddingTop="5px"
      paddingBottom="5px"
      paddingLeft="7px"
      paddingRight="7px"
      marginY="5px"
      {...props}
    />
  )
}

export default LinkButton
