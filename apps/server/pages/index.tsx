'use client'

import dynamic from 'next/dynamic'
import Head from 'next/head'

const DynamicComponentWithNoSSR = dynamic(() => import('../components/Homepage'), { ssr: false })

const Page = () => {
  return (
    <>
      <Head>
        <title>Discover</title>
        <meta property="og:title" content="Reelist" />
        <meta property="og:site_name" content="Reelist" />
        <meta name="twitter:title" content="Unlock your next obsession" />
        <meta name="twitter:side" content="https://reelist.app/discover" />
        <meta name="twitter:card" content="summary" />

        <meta
          property="og:description"
          content="Reelist's Discover - Your go-to platform for finding the perfect movies and shows tailored to any combination of tastes. Start your cinematic journey alone or with friends today!"
        />
      </Head>

      <DynamicComponentWithNoSSR />
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
