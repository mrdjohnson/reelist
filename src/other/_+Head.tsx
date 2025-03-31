import type { PageContext } from 'vike/types'
import { TmdbClient } from '@reelist/utils/tmdbHelpers/TmdbClient'
import {
  OpenGraphType,
  TmdbOpenGraphFormatter,
} from '@reelist/utils/tmdbHelpers/TmdbOpenGraphFormatter'

const Head = async (pageContext: PageContext) => {
  const { videoId, personId } = pageContext.routeParams
  let graphData = null

  if (videoId) {
    const video = await TmdbClient.getVideoById(videoId)

    graphData = await TmdbOpenGraphFormatter.fromVideo(video)
  } else if (personId) {
    const person = await TmdbClient.getPersonById(personId)

    graphData = await TmdbOpenGraphFormatter.fromPerson(person)
  }

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
      <meta property="og:title" content={cardData.title} />
      <meta name="twitter:title" content={cardData.twitterTitle} />
      <meta property="og:description" content={cardData.description} />

      <meta property="og:site_name" content="Reelist: Discover" />
      <meta name="twitter:card" content="summary" />
      <meta property="og:url" content="https://reelist.app/discover" />

      <meta property="og:image" content={cardData.imageUrl} />
      <meta property="og:image:width" content={cardData.imageWidth} />
      <meta property="og:image:height" content={cardData.imageHeight} />
    </>
  )
}

export { Head }
