import { observer } from 'mobx-react-lite'

import React, { useState } from 'react'
import _ from 'lodash'
import Video from '@reelist/models/Video'
import { Pressable, View, Text, ITextProps } from 'native-base'
import { IImageProps, Image } from 'native-base'
import { IViewProps } from 'native-base/lib/typescript/components/basic/View/types'

const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500'

type VideoImageProps = IImageProps & {
  video: Video
  containerProps?: IViewProps
  isPoster?: boolean
  onPress?: () => void
}

const videoTextProps: ITextProps = {
  paddingX: '10px',
  numberOfLines: 2,
  ellipsizeMode: 'clip',
  color: 'white',
}

const VideoImage = observer(
  ({ video, containerProps, onPress, isPoster, ...imageProps }: VideoImageProps) => {
    const [hovered, setHovered] = useState(false)
    const [pressed, setPressed] = useState(false)

    const source = isPoster ? video.posterPath : video.backdropPath

    if (!source) return null

    let imageSizeProps: IImageProps
    let height: string

    if (isPoster) {
      imageSizeProps = {
        resizeMode: 'contain',
        width: '406',
      }

      height = '609px'
    } else {
      imageSizeProps = {
        width: '307px',
      }

      height = hovered || pressed ? '237px' : '207px'
    }

    const fullImage = !onPress

    return (
      <Pressable
        onHoverIn={() => setHovered(true)}
        onPressIn={() => setPressed(true)}
        onHoverOut={() => setHovered(false)}
        onPressOut={() => setPressed(false)}
        isPressed={pressed}
        onLongPress={() => console.log('long pressed: ', video.videoName)}
        onPress={onPress}
        disabled={fullImage}
        rounded="sm"
        overflow="hidden"
        position="relative"
        display="flex"
        justifyContent="center"
        height={height}
        marginTop={hovered || pressed ? '0px' : '15px'}
        marginBottom={hovered || pressed ? '0px' : '15px'}
        style={{ transition: 'height 0.3s ease, margin-bottom 0.3s ease, margin-top 0.3s ease' }}
        {...containerProps}
      >
        <Image
          source={{ uri: IMAGE_PATH + source }}
          alt={source}
          height="100%"
          {...imageProps}
          {...imageSizeProps}
        />

        {!isPoster && (
          <div
            className="absolute bottom-0 w-full pt-3 pb-1 min-h-[70px] flex justify-end flex-col"
            style={{
              background:
                'linear-gradient(180deg, rgba(0, 0, 0, 0.54) 0%, rgba(0, 0, 0, 0) 0.01%, rgba(0, 0, 0, 0.54) 33.85%)',
            }}
          >
            <div className="px-2 line-clamp-2 text-white text-2xl font-inter">
              {video.videoName}
            </div>

            <div className="px-2 line-clamp-2 text-white text-lg font-inter">
              {video.durationOrSeasons}
            </div>
          </div>
        )}
      </Pressable>
    )
  },
)

export default VideoImage
