import { supabaseClient } from '../utils/supabaseClient'
import { useEffect } from 'react'
import { Box, CircularProgress } from '@mui/material'

const LoginPage = () => {
  useEffect(() => {
    supabaseClient.auth.signIn({
      provider: 'google',
    })
  }, [])

  return (
    <Box display="flex" justifyContent="center" paddingTop="15px">
      <CircularProgress size="60px" />
    </Box>
  )
}

export default LoginPage
