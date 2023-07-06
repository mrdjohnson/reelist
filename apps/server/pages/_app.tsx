import '../styles.css'

import '~/setupServerEnv'

import { StoreProvider } from '@reelist/utils/store'
import { StyledEngineProvider, ThemeProvider } from '@mui/material'
import muiTheme from '~/mui-theme'

// eslint-disable-next-line react/prop-types
function MyApp({ Component, pageProps }) {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={muiTheme}>
        <StoreProvider>
          <Component {...pageProps} />
        </StoreProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}

export default MyApp
