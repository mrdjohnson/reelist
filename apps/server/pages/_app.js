import '~/setupServerEnv'

import { StoreProvider } from '@reelist/utils/store'
import { NativeBaseProvider, extendTheme } from 'native-base'

// eslint-disable-next-line react/prop-types
function MyApp({ Component, pageProps }) {
  const theme = extendTheme({
    colors: {
      // reelist scheme
      reelist: {
        // 50: '#3b82f6CC',
        // 100: '#3b82f6CC',
        // 200: '#3b82f6CC',
        // 300: '#3b82f6CC',
        // 400: '#3b82f6CC',
        // 500: '#3b82f6CC',
        600: '#3b82f6CC',
        // 700: '#3b82f6CC',
        // 800: '#3b82f6CC',
        // 900: '#3b82f6CC',
      },
    },
  })

  return (
    <StoreProvider>
      <NativeBaseProvider theme={theme}>
        <Component {...pageProps} />
      </NativeBaseProvider>
    </StoreProvider>
  )
}

export default MyApp
