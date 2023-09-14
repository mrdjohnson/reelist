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
} & (PropsWithTitle | PropsWithoutTitle)

const VideoGroup = ({
  videos = [],
  numItemsPerRow,
  title,
  clippedOverride,
  onViewMoreClicked,
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

  return (
    <>
      {title && <div className="mb-5 text-3xl font-semibold text-white">{title}</div>}

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
      </div>

      {title && videosToDisplay?.length === maxViewCount && (
        <div className="flex justify-center h-[70px]">

        <Button
          onClick={onViewMoreClicked}
          className="rounded-sm bg-transparent text-white underline align-middle h-fit cursor-pointer text-lg"
          disableRipple
          >
          View More
        </Button>
          </div>
      )}
    </>
  )
}

export default VideoGroup
