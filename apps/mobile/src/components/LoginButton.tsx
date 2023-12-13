import React from 'react'
import { InAppBrowser } from 'react-native-inappbrowser-reborn'
import { IButtonProps } from 'native-base'

import AppButton from '~/components/AppButton'

const LoginButton = (props: IButtonProps) => {
  const login = async () => {
    const result = await InAppBrowser.openAuth('https://reelist.app/login', 'reelist://refresh')

    if ('url' in result) {
      console.log('browser result: ', JSON.stringify(result))
    }

    InAppBrowser.close()
  }

  return (
    <AppButton onPress={login} marginY="30px" marginX="10px" {...props}>
      Login
    </AppButton>
  )
}

export default LoginButton
