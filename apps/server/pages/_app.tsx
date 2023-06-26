import '../styles.css'

import '~/setupServerEnv'

import { StoreProvider } from '@reelist/utils/store'
import { NativeBaseProvider, extendTheme } from 'native-base'
import { StyledEngineProvider, ThemeProvider } from '@mui/material'
import muiTheme from '~/mui-theme'

// eslint-disable-next-line react/prop-types
function MyApp({ Component, pageProps }) {
  const primaryPalette = {
    50: '#FE5365',
    100: '#FE5365',
    200: '#FE5365',
    300: '#fe94a1',
    400: '#fe7383',
    500: '#FE5365',
    600: '#FE5365',
    700: '#be3e4d',
    800: '#FE5365',
    900: '#FE5365',
  }
  const textPalette = {
    50: 'light.100',
    100: 'light.100',
    200: 'light.100',
    300: 'light.100',
    400: 'light.100',
    500: 'light.100',
    600: 'light.100',
    700: 'light.100',
    800: 'light.100',
    900: 'light.100',
  }

  const theme = extendTheme({
    colors: {
      // reelist scheme
      primary: primaryPalette,
      reelist: primaryPalette,

      text: textPalette,
    },
    components: {
      Text: { baseStyle: { color: 'white' } },

      Input: {
        baseStyle: {
          color: 'light.100',
          fontColor: 'light.100',
        },
      },

      CheckBox: {
        color: 'white',
        _text: { color: 'white' },
      },

      Modal: {
        defaultProps: {
          _backdrop: {
            backgroundColor: 'rgba(0, 0, 0, 0.69)',
            backdropFilter: 'blur(15px)',
          },
        },
      },

      Button: {
        defaultProps: {
          _text: { fontFamily: 'Inter', fontWeight: 600, fontSize: '16px' },
        },

        variants: {
          outline: {
            _text: { color: 'light.100' },
            color: 'light.100',
          },

          link: {
            _text: { color: 'light.100' },
            color: 'light.100',
          },

          solid: {
            _text: { color: 'black' },
            color: 'black',
            borderWidth: 1,
            _hover: {
              backgroundColor: 'reelist.500',
            },
            _pressed: {
              backgroundColor: 'reelist.500',
            },
          },
        },
      },
    },
  })

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={muiTheme}>
        <StoreProvider>
          <NativeBaseProvider theme={theme}>
            <Component {...pageProps} />
          </NativeBaseProvider>
        </StoreProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}

export default MyApp
