import '../styles.css'
import Head from 'next/head'

import '~/setupServerEnv'

// import { StoreProvider } from '@reelist/utils/store'
import { CssBaseline, StyledEngineProvider, ThemeProvider } from '@mui/material'
import muiTheme from '~/mui-theme'

// eslint-disable-next-line react/prop-types
function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta
          property="og:image"
          content={`${process.env.NEXT_PUBLIC_BASE_URL}/images/thumbnail.png`}
        />
        <meta property="og:image:width" content="150" />
        <meta property="og:image:height" content="150" />
      </Head>

      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={muiTheme}>
          <CssBaseline />

          {/* <StoreProvider> */}
          <Component {...pageProps} />
          {/* </StoreProvider> */}
        </ThemeProvider>
      </StyledEngineProvider>
    </>
  )
}

export default MyApp
