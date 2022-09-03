import { Box, Container, Typography } from '@mui/material'

const Index = () => {
  return (
    <div
      style={{
        backgroundColor: '#f2eded', // off white-ish
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            my: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography variant="h2" gutterBottom>
            Reelist
          </Typography>

          <Typography variant="h5" gutterBottom>
            A social tv show tracking app
          </Typography>

          <div>Coming soon</div>
        </Box>
      </Container>
    </div>
  )
}

export default Index
