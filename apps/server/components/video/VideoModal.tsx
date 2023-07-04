import { observer } from 'mobx-react-lite'

import React, { useMemo } from 'react'
import _ from 'lodash'
import Video, { Provider } from '@reelist/models/Video'
import { Divider } from 'native-base'

import VideoImage from './VideoImage'

const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500'

const VideoModal = observer(
  ({ video, selectedRegions }: { video: Video; selectedRegions: string[] }) => {
    const getProvidersByType = (type): Provider[] =>
      _.chain(selectedRegions)
        .flatMap(region => video.providers[region]?.[type])
        .compact()
        .uniqBy('providerId')
        .value()

    const providers = useMemo(() => {
      const buyProviders = getProvidersByType('buy').map(provider => ({ ...provider, type: 'Buy' }))
      const flatrateProviders = getProvidersByType('flatrate').map(provider => ({
        ...provider,
        type: 'Stream',
      }))
      const rentProviders = getProvidersByType('rent').map(provider => ({
        ...provider,
        type: 'Rent',
      }))

      return _.sortBy([...flatrateProviders, ...rentProviders, ...buyProviders], 'providerName', 'displayPriority')
    }, [video.providers])

    return (
      <div className="flex flex-col flex-wrap justify-center text-white xl:flex-row xl:flex-nowrap max-w-7xl">
        <div className="flex justify-center xl:mr-12 rounded-lg w-full flex-1">
          <VideoImage
            video={video}
            containerProps={{ alignSelf: 'center' }}
            rounded="lg"
            isPoster
          />
        </div>

        <div className="flex flex-col w-full overflow-clip">
          <p className="text-5xl text-center mt-4 mb-1 xl:text-left xl:mt-0 xl:mb-2">
            {video.videoName}
          </p>

          <div>
            {_.map(video.genres, 'name').join('/')} ‧ {video.durationOrSeasons}
          </div>

          <Divider backgroundColor="reelist.500" marginBottom="35px" marginTop="28px" />

          <div className="whitespace-normal break-words">{video.overview}</div>

          <div className="flex flex-1 items-end pt-4 w-full">
            <div className="w-full">
              <div className="text-2xl pb-3">
                {providers.length === 0 ? 'Not available in provided regions' : 'Available on'}
              </div>

              <div
                className="flex gap-x-5 xl:gap-x-8 overscroll-none no-scrollbar overflow-x-auto pb-2"
                style={{ scrollbarWidth: 'none' }}
              >
                {providers.map(provider => (
                  <div className="flex flex-col justify-center text-center">
                    <img
                      src={IMAGE_PATH + provider.logoPath}
                      className="rounded-md object-contain mb-3"
                      alt={provider.providerName}
                      width="50px"
                      height="50px"
                    />

                    <span>{provider.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
)

export default VideoModal
