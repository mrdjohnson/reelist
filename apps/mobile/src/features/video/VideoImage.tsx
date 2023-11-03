import React from 'react'
import { observer } from 'mobx-react-lite'
import Video from '@reelist/models/Video'
import { AspectRatio, IAspectRatioProps, IImageProps, Image, View } from 'native-base'
import { DiscoverVideoType } from '@reelist/models/DiscoverVideo'

const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500'

type VideoImageProps = IImageProps & {
  video: Video | DiscoverVideoType | null | undefined
  containerProps?: IAspectRatioProps
}

const VideoImage = observer(({ video, containerProps, ...imageProps }: VideoImageProps) => {
  if (!video) return null

  const imageSource = video.posterPath || video.backdropPath

  return (
    <AspectRatio ratio={{ base: 2 / 3 }} width="100%" {...containerProps}>
      {imageSource && (
        <Image
          source={{ uri: IMAGE_PATH + imageSource }}
          alt={imageSource}
          resizeMode="contain"
          backgroundColor="black"
          rounded="sm"
          {...imageProps}
        />
      )}
    </AspectRatio>
  )
})

export default VideoImage
