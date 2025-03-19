import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router'

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
      <div className="discover-md:justify-center my-auto flex max-h-fit w-full max-w-full flex-col pt-8 text-center text-white">
        <div className="pb-9 text-5xl">Reelist</div>

        <a
          className="decoration-reelist-red/30 hover:decoration-reelist-red mb-3 w-fit self-center text-3xl text-white underline underline-offset-8 transition-colors duration-300 ease-in-out"
          href="/discover"
        >
          Discover
        </a>

        <div className="text-xl text-gray-400">The place to find what to watch next</div>

        <div className="mt-2 flex h-fit w-full flex-row gap-x-5 overflow-hidden">
          <Banner />
        </div>
      </div>

      <div className="mt-auto w-full ">
        <Footer hideHeader />
      </div>
    </div>
  )
})

// source: https://codesandbox.io/s/infinite-horizontal-auto-scroll-y82f8?file=/src/Banner.jsx
const Banner = () => {
  const navigate = useNavigate()
  const videos = useVideoTrending()

  const handleVideoSelection = (video: TmdbVideoPartialType) => {
    navigate(`/discover?videoId=${video.videoId}`)
  }

  return (
    <div className="animate-slow-scroll discover-md:hover:pause-animation flex flex-row gap-5">
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
