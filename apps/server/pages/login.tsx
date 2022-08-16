// import { useState, useEffect } from 'react'
// import { supabase } from '../utils/supabaseClient'
// import Auth from '../components/Auth'
// import Account from '../components/Account'

import { Auth } from '@supabase/ui'
import { useUser } from '@supabase/auth-helpers-react'
import { supabaseClient } from '../utils/supabaseClient'
import { useEffect, useState } from 'react'
import { Container } from '@mui/system'

const LoginPage = ({ path }: { path: string }) => {
  const { user, error } = useUser()
  const [data, setData] = useState<any>()

  useEffect(() => {
    async function loadData() {
      const { data } = await supabaseClient.from('profiles').select('*')
      setData(data)
    }
    // Only run query once user is logged in.
    if (user) loadData()
  }, [user])

  if (!user) {
    console.log('path:', path)

    return (
      <>
        {error && <p>{error.message}</p>}

        <Container maxWidth="md">
          <Auth
            supabaseClient={supabaseClient}
            providers={['google']}
            socialLayout="horizontal"
            socialButtonSize="large"
            redirectTo={path + '/account'}
          />
        </Container>
      </>
    )
  }

  return (
    <>
      <button onClick={() => supabaseClient.auth.signOut()}>Sign out</button>

      <p>user:</p>

      <pre>{JSON.stringify(user, null, 2)}</pre>

      <p>client-side data fetching with RLS</p>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  )
}

export default LoginPage

export const getStaticProps = async () => {
  return {
    props: {
      path: process.env.NEXT_BASE_PATH,
    },
  }
}

// export default function Login() {
//   const [session, setSession] = useState(null)

//   useEffect(() => {
//     setSession(supabase.auth.session())

//     supabase.auth.onAuthStateChange((_event, session) => {
//       setSession(session)
//     })
//   }, [])

//   return (
//     <div className="container" style={{ padding: '50px 0 100px 0' }}>
//       {!session ? <Auth /> : <Account key={session.user.id} session={session} />}
//     </div>
//   )
// }
