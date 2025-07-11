'use client'

import dynamic from 'next/dynamic'
import Head from 'next/head'

import {
  OpenGraphType,
  TmdbOpenGraphFormatter,
} from '@reelist/utils/tmdbHelpers/TmdbOpenGraphFormatter'
import { TmdbClient } from '@reelist/utils/tmdbHelpers/TmdbClient'

const DynamicComponentWithNoSSR = dynamic(() => import('../../components/Discover'), { ssr: false })

type PageProps = {
  graphData?: Partial<OpenGraphType>
}

const Page = ({ graphData = {} }: PageProps) => {
  const cardData = {
    title: 'http://reelist.app where you can explore movies and shows',
    twitterTitle: 'Discover movies and shows',
    imageUrl: 'http://reelist.app/images/thumbnail.png',
    description:
      "Reelist's Discover - Your go-to platform for finding the perfect movies and shows tailored to your tastes. Start your cinematic journey today!'",
    imageWidth: '150',
    imageHeight: '150',
    ...graphData,
  }

  return (
    <>
      <Head>
        <title>Discover</title>
        <meta property="og:title" content={cardData.title} />
        <meta name="twitter:title" content={cardData.twitterTitle} />
        <meta property="og:description" content={cardData.description} />

        <meta property="og:site_name" content="Reelist: Discover" />
        <meta name="twitter:card" content="summary" />
        <meta property="og:url" content="https://reelist.app/discover" />

        <meta property="og:image" content={cardData.imageUrl} />
        <meta property="og:image:width" content={cardData.imageWidth} />
        <meta property="og:image:height" content={cardData.imageHeight} />
      </Head>

      <DynamicComponentWithNoSSR beta={false} />
    </>
  )
}

// call the TmdbClient to get the first item looked at (if any) for open graph cards
export async function getServerSideProps(context) {
  const { videoId = null, personId = null } = context.query || {}

  let graphData = null

  if (videoId) {
    const video = await TmdbClient.getVideoById(videoId)

    graphData = await TmdbOpenGraphFormatter.fromVideo(video)
  } else if (personId) {
    const person = await TmdbClient.getPersonById(personId)

    graphData = await TmdbOpenGraphFormatter.fromPerson(person)
  }

  return { props: { graphData } }
}

export default Page
