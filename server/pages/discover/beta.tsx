'use client'

import dynamic from 'next/dynamic'
import Head from 'next/head'

const DynamicComponentWithNoSSR = dynamic(() => import('../../components/Discover'), { ssr: false })

const Page = ({ path }: { path: string }) => {
  return (
    <>
      <Head>
        <title>Discover</title>
        <meta property="og:title" content="Discover" />
        <meta property="og:site_name" content="Reelist" />
        <meta name="twitter:title" content="Discover movies and shows" />
        <meta name="twitter:side" content="https://reelist.app/discover" />
        <meta name="twitter:card" content="summary" />

        <meta
          property="og:description"
          content="Reelist's Discover - Your go-to platform for finding the perfect movies and shows tailored to your tastes. Start your cinematic journey today!"
        />
      </Head>

      <DynamicComponentWithNoSSR beta={false} />
    </>
  )
}

export const getStaticProps = async () => {
  return {
    props: {
      path: process.env.NEXT_PUBLIC_BASE_URL,
    },
  }
}

export default Page
