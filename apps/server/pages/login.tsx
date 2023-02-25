import { useEffect } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { useStore } from '@reelist/utils/hooks/useStore'

const LoginPage = ({ path }: { path: string }) => {
  const { supabase } = useStore()

  useEffect(() => {
    supabase.auth.signIn({ provider: 'google' }, { redirectTo: path + '/account' })
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
