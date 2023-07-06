import { observer } from 'mobx-react-lite'
import classNames from 'classnames'

import React from 'react'
import _ from 'lodash'
import Video from '@reelist/models/Video'

const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500'

type VideoImageProps = any & {
  video: Video
  containerProps?: any
  isPoster?: boolean
  onPress?: () => void
}

const VideoImage = observer(
  ({ video, containerProps, onPress, isPoster, ...imageProps }: VideoImageProps) => {
    const source = isPoster ? video.posterPath : video.backdropPath

    if (!source) return null

    return (
      <div
        className={classNames(
          'group rounded-md overflow-hidden relative justify-center flex my-4 hover:my-0',
          'transition-all ease-in-out duration-300',
          isPoster ? 'my-0' : 'my-4 h-[207px] hover:h-[237px]',
          {
            'cursor-pointer': onPress,
          },
        )}
        onClick={onPress}
      >
        <img
          src={IMAGE_PATH + source}
          alt={source}
          height="100%"
          className={
            isPoster
              ? 'object-contain h-[609px] w-[406px]'
              : 'h-[270px] w-[307px] -mt-4 group-hover:mt-0 transition-[margin-top] ease-in-out duration-300'
          }
        />

        {!isPoster && (
          <div
            className="absolute bottom-0 w-full pt-3 pb-1 min-h-[70px] flex justify-end flex-col group-hover:min-h-[40px] transition-min-height ease-in-out duration-300"
            style={{
              background:
                'linear-gradient(180deg, rgba(0, 0, 0, 0.54) 0%, rgba(0, 0, 0, 0) 0.01%, rgba(0, 0, 0, 0.54) 33.85%)',
            }}
          >
            <div className="px-2 line-clamp-2 text-white text-2xl font-inter group-hover:mt-3  transition-margin-top ease-in-out duration-300">
              {video.videoName}
            </div>

            <div className="px-2 line-clamp-2 text-white text-lg font-inter max-h-8 group-hover:max-h-0 overflow-hidden transition-max-height ease-in-out duration-300">
              {video.durationOrSeasons}
            </div>
          </div>
        )}
      </div>
    )
  },
)

export default VideoImage
