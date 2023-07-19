import { observer } from 'mobx-react-lite'

import React from 'react'
import _ from 'lodash'
import Video from '@reelist/models/Video'

const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500'

type VideoImageProps = any & {
  video: Video
  isPoster?: boolean
  onPress?: () => void
}

const VideoImage = observer(({ video, onPress, isPoster }: VideoImageProps) => {
  const source = isPoster ? video.posterPath : video.backdropPath

  if (!source) return null

  return (
    <div
      className={
        'group relative my-4 flex justify-center overflow-hidden rounded-md transition-all duration-300 ease-in-out ' +
        (isPoster
          ? 'my-0 '
          : 'discover-md:w-auto discover-md:hover:my-0 discover-md:hover:h-[237px] my-4  h-[207px]  w-fit ') +
        (onPress && 'cursor-pointer')
      }
      onClick={onPress}
    >
      <img
        src={IMAGE_PATH + source}
        alt={source}
        height="100%"
        className={
          isPoster
            ? 'discover-md:h-[609px] discover-md:w-[406px] h-auto w-full object-contain'
            : 'discover-md:w-[307px] discover-md:object-cover discover-md:group-hover:mt-0 -mt-4 h-[270px] w-full object-contain transition-[margin-top] duration-300 ease-in-out'
        }
      />

      {!isPoster && (
        <div
          className="transition-min-height discover-md:group-hover:min-h-[40px] absolute bottom-0 flex min-h-[70px] w-full flex-col justify-end pt-3 pb-1 duration-300 ease-in-out"
          style={{
            background:
              'linear-gradient(180deg, rgba(0, 0, 0, 0.54) 0%, rgba(0, 0, 0, 0) 0.01%, rgba(0, 0, 0, 0.54) 33.85%)',
          }}
        >
          <div className="line-clamp-2 font-inter transition-margin-top px-2 text-2xl text-white  duration-300 ease-in-out discover-md:group-hover:mt-3">
            {video.videoName}
          </div>

          <div className="line-clamp-2 font-inter transition-max-height discover-md:roup-hover:max-h-0 max-h-8 overflow-hidden px-2 text-lg text-white duration-300 ease-in-out">
            {video.durationOrSeasons}
          </div>
        </div>
      )}
    </div>
  )
})

export default VideoImage
