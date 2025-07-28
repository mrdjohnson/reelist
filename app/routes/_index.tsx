import { CircularProgress } from '@mui/material'
import type { LoaderFunction, MetaFunction } from '@remix-run/node'
import { useEffect, useState } from 'react'

export const meta: MetaFunction = () => {
  return [
    { title: 'Discover' },
    { property: 'og:title', content: 'Reelist' },
    { property: 'og:site_name', content: 'Reelist' },
    { name: 'twitter:title', content: 'Unlock your next obsession' },
    { name: 'twitter:card', content: 'summary' },
    { property: 'og:image', content: 'http://reelist.app/images/thumbnail.png' },
    { property: 'og:image:width', content: '150' },
    { property: 'og:image:height', content: '150' },
    {
      property: 'og:description',
      content:
        "Reelist's Discover - Your go-to platform for finding the perfect movies and shows tailored to any combination of tastes. Start your cinematic journey alone or with friends today!",
    },
  ]
}

// export const loader: LoaderFunction = () => {
//   return { path: import.meta.env.BASE_URL }
// }

console.log('hello world')

export default function App() {
  const [ClientApp, setClientApp] = useState<React.FC | null>(null)

  useEffect(() => {
    import('~/components/Homepage').then(mod => {
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
