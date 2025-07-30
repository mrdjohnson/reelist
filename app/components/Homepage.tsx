'use client'

import { observer } from 'mobx-react-lite'
import useVideoTrending from '@reelist/utils/hooks/useVideoTrending'
import { TmdbVideoPartialType } from '@reelist/interfaces/tmdb/TmdbVideoPartialType'
import EntityImage from './EntityImage'
import Footer from './Footer'
import { useNavigate } from 'react-router-dom'
import Marquee from 'react-fast-marquee'

const Homepage = observer(() => {
  return (
    <div
      suppressHydrationWarning
      className="bg-reelist-gradient-green flex h-svh w-screen flex-col max-h-svh"
    >
      <div className="discover-md:top-[15%] discover-md:fixed discover-md:justify-center flex max-h-fit w-full max-w-full flex-col  pb-12 pt-[5%] text-center text-white">
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
        <div className="mt-2 flex h-fit w-full flex-row gap-x-5 overflow-hidden">
          <Banner />
        </div>
      </div>

      <div className="discover-md:fixed bottom-0 w-full">
        <Footer hideHeader />
      </div>
    </div>
  )
})

// source: https://codesandbox.io/s/infinite-horizontal-auto-scroll-y82f8?file=/src/Banner.jsx
const Banner = () => {
  const router = useNavigate()
  const videos = useVideoTrending()

  const handleVideoSelection = (video: TmdbVideoPartialType) => {
    router(`/discover?videoId=${video.videoId}`, { shallow: true })
  }

  return (
    <Marquee pauseOnHover speed={30}>
      <div className="flex flex-row gap-5 mr-5">
        {videos.map(video => (
          <div className="max-w-[307px] flex-1 overflow-hidden" key={video.id}>
            <EntityImage video={video} onPress={() => handleVideoSelection(video)} homepageImage />
          </div>
        ))}
      </div>
    </Marquee>
  )
}

export default Homepage
