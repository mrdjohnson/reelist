import '~/setupServerEnv'

import { StoreProvider } from '@reelist/utils/store'

// eslint-disable-next-line react/prop-types
function MyApp({ Component, pageProps }) {
  return (
    <StoreProvider>
      <Component {...pageProps} />
    </StoreProvider>
  )
}

export default MyApp
