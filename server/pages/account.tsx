import { useEffect } from 'react'
import { Box, CircularProgress } from '@mui/material'
import Router, { useRouter } from 'next/router'
import { useStore } from '@reelist/utils/hooks/useStore'

export default function Account() {
  const { query } = useRouter()
  const { supabase } = useStore()

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
