import { Container } from '@mui/material'

/**
 * a "ping" like route to make sure the server is up and using the correct base path
 */
const PathPage = ({ path }: { path: string }) => {
  return <Container>Url: {path}</Container>
}

export default PathPage

export const getStaticProps = async () => {
  return {
    props: {
      path: process.env.NEXT_PUBLIC_BASE_URL,
    },
  }
}
