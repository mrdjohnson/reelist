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

      <div className="fixed top-[25%] flex w-full flex-col  justify-center pb-12 text-center text-white">
        <div className="pb-12">
          <div className="mb-3 text-5xl  ">Reelist</div>

          <div className="mb-3 text-xl ">
            Mobile: Track watched shows with your friends
            <span className="ml-2 text-base text-gray-500">(Coming soon)</span>
          </div>

          <div className="text-xl">
            Web: Find shows and movies to watch with your friends!{' '}
            <Button
              href="/discover"
              className="text-reelist-red border-reelist-red border border-solid hover:text-white"
            >
              Discover

              {/* small arrow right hero-icons */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
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
