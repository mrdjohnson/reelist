'use client'

import { observer } from 'mobx-react-lite'
import Head from 'next/head'
import { useRouter } from 'next/router'
import useVideoTrending from '@reelist/utils/hooks/useVideoTrending'
import { TmdbVideoPartialType } from '@reelist/interfaces/tmdb/TmdbVideoPartialType'
import EntityImage from './EntityImage'
import Footer from './Footer'

const Homepage = observer(() => {
  return (
    <div
      suppressHydrationWarning
      className="bg-reelist-gradient-green flex h-screen w-screen flex-col"
    >
      <Head>
        <title>Reelist</title>
      </Head>

      <div className="discover-md:top-[15%] fixed top-[5%] flex w-full flex-col  justify-center pb-12 text-center text-white">
        <div className="pb-9 text-5xl">Reelist</div>

        <a
          className="decoration-reelist-red/30 hover:decoration-reelist-red mb-3 w-fit self-center text-3xl text-white underline underline-offset-8 transition-colors duration-300 ease-in-out"
          href="/discover"
        >
          Discover
        </a>
        <div className="text-xl text-white">
          Discover Together: Merge Your Movie Desires with Friends' Picks!
        </div>
        <div className="mt-2 flex h-fit w-full flex-row gap-x-5">
          <Banner />
        </div>

        <div className="mb-6 mt-12 text-xl ">
          <span className="text-3xl"> Mobile </span>
          <br />
          Manually Track watched shows and compare them with your friends
          <br />
          <span className="mx-1 text-base text-gray-500">(Coming soon)</span>
        </div>
      </div>

      <div className="fixed bottom-0 w-full">
        <Footer hideHeader />
      </div>
    </div>
  )
})

// source: https://codesandbox.io/s/infinite-horizontal-auto-scroll-y82f8?file=/src/Banner.jsx
const Banner = () => {
  const router = useRouter()
  const videos = useVideoTrending()

  const handleVideoSelection = (video: TmdbVideoPartialType) => {
    router.push(`/discover?videoId=${video.videoId}`, undefined, { shallow: true })
  }

  return (
    <div className="animate-slow-scroll hover:pause-animation flex flex-row gap-5">
      {videos.map(video => (
        <div className="max-w-[307px] flex-1 overflow-hidden">
          <EntityImage video={video} onPress={() => handleVideoSelection(video)} homepageImage />
        </div>
      ))}
      {videos.map(video => (
        <div className="max-w-[307px] flex-1 overflow-hidden">
          <EntityImage video={video} onPress={() => handleVideoSelection(video)} homepageImage />
        </div>
      ))}
    </div>
  )
}

export default Homepage
