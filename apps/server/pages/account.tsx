import { useEffect } from 'react'
import { supabaseClient as supabase } from '../utils/supabaseClient'
import { Box, CircularProgress } from '@mui/material'
import Router, { useRouter } from 'next/router'

export default function Account() {
  const { query } = useRouter()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      const refreshToken = session?.refresh_token

      if (refreshToken) {
        Router.push('reelist://refresh/' + refreshToken)
      }
    })
  }, [query])

  return (
    <Box display="flex" justifyContent="center" paddingTop="15px">
      <CircularProgress size="60px" />
    </Box>
  )
}
