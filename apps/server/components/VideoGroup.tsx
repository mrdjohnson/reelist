import Video from '@reelist/models/Video'
import { useRouter } from 'next/router'
import VideoImage from './video/VideoImage'
import classNames from 'classnames'
import _ from 'lodash'
import { useMemo } from 'react'
import { Button } from '@mui/material'

type PropsWithTitle = {
  title: string
  onViewMoreClicked: () => void
}

type PropsWithoutTitle = {
  title?: never
  onViewMoreClicked?: never
}

type VideoGroupProps = {
  numItemsPerRow: number
  title?: string
  clippedOverride?: boolean
  videos?: Video[]
  isLoading: boolean
} & (PropsWithTitle | PropsWithoutTitle)

const VideoGroup = ({
  videos = [],
  numItemsPerRow,
  title,
  clippedOverride,
  onViewMoreClicked,
  isLoading,
}: VideoGroupProps) => {
  const router = useRouter()

  const handleVideoSelection = (video: Video) => {
    router.push(`/discover?videoId=${video.videoId}`, undefined, { shallow: true })
  }

  const isClipped = title || clippedOverride

  const maxViewCount = numItemsPerRow * 3

  const videosToDisplay = useMemo(() => {
    return isClipped ? _.take(videos, maxViewCount) : videos
  }, [isClipped, videos, numItemsPerRow])

  if (!isLoading && _.isEmpty(videosToDisplay)) return null

  return (
    <>
      {title && (
        <div
          className="mb-5 w-fit cursor-pointer text-3xl font-semibold text-white hover:font-bold hover:underline"
          onClick={onViewMoreClicked}
        >
          {title}
        </div>
      )}

      <div
        className={classNames(
          'discover-md:justify-items-stretch mb-4 grid w-full  flex-1 justify-center justify-items-center gap-x-5',
          { 'line-clamp-3': isClipped },
        )}
        style={{ gridTemplateColumns: `repeat(${numItemsPerRow}, minmax(0, 1fr))` }}
      >
        {videosToDisplay.map(video => (
          <VideoImage
            video={video}
            containerProps={{ width: '307px' }}
            onPress={() => handleVideoSelection(video)}
            key={video.videoId}
          />
        ))}

        {isLoading && _.times(numItemsPerRow, () => <VideoImage loading />)}
      </div>

      {title && videosToDisplay?.length === maxViewCount && (
        <div className="flex h-[70px] justify-center">
          <Button
            onClick={onViewMoreClicked}
            className="mb-1 h-fit cursor-pointer rounded-md border-2 border-solid border-transparent bg-transparent align-middle text-lg text-white hover:border-white"
            disableRipple
          >
            <span className="border-0 border-b border-solid border-white">View More</span>
          </Button>
        </div>
      )}
    </>
  )
}

export default VideoGroup