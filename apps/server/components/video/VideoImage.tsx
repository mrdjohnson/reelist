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

    const imageSizeProps: IImageProps = isPoster
      ? {
          resizeMode: 'contain',
          width: '406',
          height: '609',
        }
      : {
          resizeMode: 'cover',
          width: '307px',
          height: '207px',
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
        {...containerProps}
      >
        <View
          position="relative"
          style={{
            transform: [{ scale: fullImage || pressed ? 1 : hovered ? 0.99 : 0.97 }],
          }}
        >
          <Image
            source={{ uri: IMAGE_PATH + source }}
            alt={source}
            rounded="sm"
            {...imageProps}
            {...imageSizeProps}
          />
          {!isPoster && (
            <div
              className="absolute bottom-0 w-full rounded-b-md pt-3 pb-1 min-h-[70px] flex justify-end flex-col"
              style={{
                background:
                  'linear-gradient(180deg, rgba(0, 0, 0, 0.54) 0%, rgba(0, 0, 0, 0) 0.01%, rgba(0, 0, 0, 0.54) 33.85%)',
              }}
            >
              <Text {...videoTextProps} fontSize="24px">
                {video.videoName}
              </Text>

              <Text {...videoTextProps} fontSize="15px">
                {video.durationOrSeasons}
              </Text>
            </div>
          )}
        </View>
      </Pressable>
    )
  },
)

export default VideoImage
