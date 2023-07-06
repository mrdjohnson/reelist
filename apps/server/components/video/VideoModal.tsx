import { observer } from 'mobx-react-lite'

import React, { useMemo } from 'react'
import _ from 'lodash'
import Video, { Provider } from '@reelist/models/Video'

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
      <div className="flex flex-col flex-wrap justify-center text-white discover-lg:flex-row discover-lg:flex-nowrap max-w-7xl">
        <div className="flex justify-center discover-lg:mr-12 rounded-lg w-full flex-1">
          <VideoImage
            video={video}
            containerProps={{ alignSelf: 'center' }}
            rounded="lg"
            isPoster
          />
        </div>

        <div className="flex flex-col w-full overflow-clip">
          <p className="text-5xl text-center mt-4 mb-1 discover-lg:text-left discover-lg:mt-0 ldiscover-g:mb-2">
            {video.videoName}
          </p>

          <div>
            {_.map(video.genres, 'name').join('/')} ‧ {video.durationOrSeasons}
          </div>

          <div className="bg-reelist-red mb-6 mt-3 h-[1px]" />

          <div className="whitespace-normal break-words">{video.overview}</div>

          <div className="flex flex-1 items-end pt-4 w-full ">
            <div className="flex-col w-full">
              <div className="w-full relative overscroll-x-none no-scrollbar overflow-x-auto">
                <div className="text-2xl pb-3 sticky w-full left-0 z-20">Cast</div>

                <div className="flex gap-x-5  pb-4 relative">
                  {video.cast.map(
                    castMember =>
                      castMember.profilePath && (
                        <div className="flex flex-col justify-center text-center" key={castMember.id}>
                          <img
                            src={IMAGE_PATH + castMember.profilePath}
                            className="rounded-md object-cover mb-3"
                            alt={castMember.name}
                            width="100px"
                            height="100px"
                          />

                          <span className="text-base line-clamp-1">{castMember.character}</span>
                          <span className="text-sm opacity-75 line-clamp-2  h-[2.50rem]">
                            {castMember.name}
                          </span>
                        </div>
                      ),
                  )}
                </div>
              </div>

              <div className="w-full">
                <div className="text-2xl pb-3">
                  {providers.length === 0 ? 'Not available in provided regions' : 'Available on'}
                </div>

                <div
                  className="flex gap-x-5 discover-lg:gap-x-8 overscroll-x-none no-scrollbar overflow-x-auto pb-2"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {providers.map(provider => (
                    <div className="flex flex-col justify-center text-center" key={provider.id}>
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
      </div>
    )
  },
)

export default VideoModal
