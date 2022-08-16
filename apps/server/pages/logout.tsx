import { supabaseClient } from '../utils/supabaseClient'
import { useEffect, useState } from 'react'
import Router from 'next/router'
import { useUser } from '@supabase/auth-helpers-react'
import { Box, Button } from '@mui/material'

const Logout = () => {
  const { user, error } = useUser()
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    if (user) {
      supabaseClient.auth.signOut()
      setMessage('logged out ' + user.email)
      Router.push('/')
    } else if (error) {
      setMessage('custom error: ' + error.message)
    } else {
      setMessage('no one logged in')
    }
  }, [user, error])

  return (
    <Box>
      {message}

      <Button href="/">Home</Button>
    </Box>
  )
}

export default Logout
