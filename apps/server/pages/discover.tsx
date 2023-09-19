'use client'

import dynamic from 'next/dynamic'
import Head from 'next/head'

const DynamicComponentWithNoSSR = dynamic(() => import('../components/Discover'), { ssr: false })

const Page = () => {
  return (
    <>
      <Head>
        <title>Discover</title>
        <meta property="og:title" content="Discover" />
        <meta property="og:site_name" content="Reelist" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:image" content="/images/logo.png" />
        <meta
          name="description"
          content="Reelist's Discover - Your go-to platform for finding the perfect movies and shows tailored to your tastes. Start your cinematic journey today!"
        />
        <meta
          property="og:description"
          content="Reelist's Discover - Your go-to platform for finding the perfect movies and shows tailored to your tastes. Start your cinematic journey today!"
        />
      </Head>

      <DynamicComponentWithNoSSR />
    </>
  )
}

export default Page
