import { CircularProgress } from '@mui/material'
import { type LoaderFunction, type MetaFunction } from '@remix-run/node'
import { useEffect, useState } from 'react'
import { useLoaderData } from '@remix-run/react'
import { TmdbClient } from '../../libs/utils/src/lib/tmdbHelpers/TmdbClient'
import { TmdbOpenGraphFormatter } from '../../libs/utils/src/lib/tmdbHelpers/TmdbOpenGraphFormatter'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const graphData = data?.graphData || {}
  return [
    { title: graphData.title || 'Discover' },
    { property: 'og:title', content: graphData.ogTitle || 'Reelist' },
    { property: 'og:site_name', content: 'Reelist' },
    { name: 'twitter:title', content: graphData.twitterTitle || 'Unlock your next obsession' },
    { name: 'twitter:card', content: 'summary' },
    {
      property: 'og:image',
      content: graphData.imageUrl || 'http://reelist.app/images/thumbnail.png',
    },
    { property: 'og:image:width', content: graphData.imageWidth || '150' },
    { property: 'og:image:height', content: graphData.imageHeight || '150' },
    {
      property: 'og:description',
      content:
        graphData.description ||
        "Reelist's Discover - Your go-to platform for finding the perfect movies and shows tailored to any combination of tastes. Start your cinematic journey alone or with friends today!",
    },
  ]
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const videoId = url.searchParams.get('videoId')
  const personId = url.searchParams.get('personId')

  let graphData: unknown = null

  if (videoId) {
    const video = await TmdbClient.getVideoById(videoId)
    if (video) {
      graphData = await TmdbOpenGraphFormatter.fromVideo(video)
    }
  } else if (personId) {
    const person = await TmdbClient.getPersonById(personId)
    if (person) {
      graphData = await TmdbOpenGraphFormatter.fromPerson(person)
    }
  }

  return { graphData }
}

export default function App() {
  const [ClientApp, setClientApp] = useState<React.FC | null>(null)
  useLoaderData<typeof loader>() // ensure loader runs for meta

  useEffect(() => {
    import('~/components/Discover').then(mod => {
      setClientApp(() => mod.default)
    })
  }, [])

  if (!ClientApp) {
    return (
      <div className="w-screen h-screen flex bg-white">
        <CircularProgress size="3rem" className="mt-[30%] mx-auto mb-6" />
      </div>
    )
  }

  return <ClientApp />
}
