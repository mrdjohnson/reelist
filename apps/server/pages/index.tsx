import { Box, Button, Container, Typography } from '@mui/material'

import Link from '../src/Link'
import ProTip from '../src/ProTip'
import Copyright from '../src/Copyright'
import { useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { supabaseClient as supabase } from '../utils/supabaseClient'

const Index = ({ path }: { path: string }) => {
  const { user, error } = useUser()
  const [display, setDisplay] = useState('')

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log(event, session)

      if (event === 'TOKEN_REFRESHED') {
        setDisplay('session stringified: ' + JSON.stringify(session))
      }
    })
  }, [])

  // useEffect(() => {
  //   console.log('singning in 2gxCBy6COVVcoIgBmVctXw')

  //   const signIn = async () => {
  //     const { user, session, error } = await supabase.auth.signIn({
  //       refreshToken: '2gxCBy6COVVcoIgBmVctXw',
  //     })

  //     console.log('sign in user:', user)
  //     console.log('sign in session:', session)
  //     console.error('sign in error:', error)
  //   }

  //   signIn()
  // }, [])

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        Url: {path}
        <Typography variant="h4" component="h1" gutterBottom>
          MUI v5 + Next.js with TypeScript example
        </Typography>
        Node Env: {process.env.NODE_ENV}
        <Link href="/about" color="secondary">
          Go to the about page
        </Link>
        <ProTip />
        <Copyright />
        {user ? <Link href="/logout">Log out {user.email}</Link> : <Link href="/login">Login</Link>}
        {display}
        <Typography color="red.400">
          {error && <div>Error with user: {error.message}</div>}
        </Typography>
      </Box>
    </Container>
  )
}

export default Index

export const getStaticProps = async () => {
  return {
    props: {
      path: process.env.NEXT_BASE_PATH,
    },
  }
}
