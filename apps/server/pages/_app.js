import { UserProvider } from '@supabase/auth-helpers-react'
import { supabaseClient } from '../utils/supabaseClient'

// eslint-disable-next-line react/prop-types
function MyApp({ Component, pageProps }) {
  return (
    <UserProvider supabaseClient={supabaseClient}>
      <Component {...pageProps} />
    </UserProvider>
  )
}

export default MyApp
