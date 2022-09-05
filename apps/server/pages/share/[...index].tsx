import { useEffect, useState } from 'react'
import { LoadingButton } from '@mui/lab'
import { Box, Typography } from '@mui/material'
import Router from 'next/router'

const wait = seconds => new Promise(resolve => setTimeout(resolve, seconds * 1000))

export default function Share() {
  const [loadingRoute, setLoadingRoute] = useState<boolean | null>(null)

  const openLink = async () => {
    console.log('opening link')
    setLoadingRoute(true)

    const startIndex = window.location.pathname.indexOf('/share')
    Router.push('reelist:/' + window.location.pathname.substring(startIndex))

    await wait(2.5)

    setLoadingRoute(false)
  }

  // redirect to share page after half a second
  useEffect(() => {
    wait(0.5).then(openLink)
  }, [])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        justifyContent: 'center',
        alignContent: 'center',
        marginTop: '10px',
      }}
    >
      <Typography variant="h3" textAlign="center" gutterBottom>
        Redirecting to the reelist app.
      </Typography>

      <LoadingButton
        loading={loadingRoute !== false}
        onClick={openLink}
        loadingPosition="end"
        variant="outlined"
        style={{
          minWidth: '300px',
          alignSelf: 'center',
        }}
      >
        Redirect to reelist app
      </LoadingButton>
    </Box>
  )
}
