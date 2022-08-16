import { useEffect } from 'react'
import { Box, CircularProgress } from '@mui/material'
import Router from 'next/router'

export default function Share() {
  useEffect(() => {
    const startIndex = window.location.pathname.indexOf('/share')
    Router.push('reelist:/' + window.location.pathname.substring(startIndex))
  }, [])

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
      <CircularProgress />
    </Box>
  )
}
