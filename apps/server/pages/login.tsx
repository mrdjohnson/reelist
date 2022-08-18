import { supabaseClient } from '../utils/supabaseClient'
import { useEffect } from 'react'
import { Box, CircularProgress } from '@mui/material'

const LoginPage = ({ path }: { path: string }) => {
  useEffect(() => {
    supabaseClient.auth.signIn({ provider: 'google' }, { redirectTo: path + '/account' })
  }, [])

  return (
    <Box display="flex" justifyContent="center" paddingTop="15px">
      <CircularProgress size="60px" />
    </Box>
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
