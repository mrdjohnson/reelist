import { Box, Container, Button } from '@mui/material'
import Head from 'next/head'

const Index = () => {
  return (
    <div
      className="font-inter h-screen w-screen"
      style={{
        background: 'radial-gradient(50% 50% at 50% 50%, #1A200F 0%, #131313 100%)',
      }}
    >
      <Head>
        <title>Reelist</title>
      </Head>

      <div className="flex w-full flex-col justify-center pb-12  text-center text-white top-[25%] fixed">
        <div className="pb-12">
          <div className="mb-3 text-5xl  ">Reelist</div>

          <div className="mb-3 text-xl ">
            Mobile: Track watched shows with your friends
            <span className="ml-2 text-base text-gray-500">(Coming soon)</span>
          </div>

          <div className="text-xl">
            Web: Find shows and movies to watch with your friends!{' '}
            <Button href="/discover">Discover </Button>
          </div>
        </div>
      </div>

      <Container maxWidth="lg">
        <Box
          sx={{
            my: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        ></Box>
      </Container>
    </div>
  )
}

export default Index
