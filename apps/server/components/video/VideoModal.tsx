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

    const providers: Array<Provider & { type: string }> = useMemo(() => {
      const buyProviders = getProvidersByType('buy').map(provider => ({ ...provider, type: 'Buy' }))
      const flatrateProviders = getProvidersByType('flatrate').map(provider => ({
        ...provider,
        type: 'Stream',
      }))
      const rentProviders = getProvidersByType('rent').map(provider => ({
        ...provider,
        type: 'Rent',
      }))

      return _.sortBy(
        [...flatrateProviders, ...rentProviders, ...buyProviders],
        'providerName',
        'displayPriority',
      )
    }, [video.providers])

    return (
      <div className="discover-lg:flex-row discover-lg:flex-nowrap flex max-w-7xl flex-col flex-wrap justify-center text-white">
        <div className="discover-lg:mr-12 flex w-fit flex-1 justify-center rounded-lg self-center">
          <VideoImage
            video={video}
            containerProps={{ alignSelf: 'center' }}
            rounded="lg"
            isPoster
          />
        </div>

        <div className="flex w-full flex-col overflow-clip">
          <p className="discover-lg:text-left discover-lg:mt-0 discover-md:text-5xl my-4 text-center text-3xl">
            {video.videoName}
          </p>

          <div>
            {_.map(video.genres, 'name').join('/')} ‧ {video.durationOrSeasons}
          </div>

          <div className="bg-reelist-red mb-6 mt-3 h-[1px]" />

          <div className="whitespace-normal break-words">{video.overview}</div>

          <div className="flex w-full flex-1 items-end pt-4 ">
            <div className="w-full flex-col">
              <div className="no-scrollbar relative w-full overflow-x-auto overscroll-x-none">
                <div className="sticky left-0 z-20 w-full pb-3 text-2xl">Cast</div>

                <div className="relative flex  w-[100px] gap-x-5 pb-4">
                  {video.cast.map(
                    castMember =>
                      castMember.profilePath && (
                        <div
                          className="flex flex-col justify-center text-center"
                          key={castMember.id}
                        >
                          <img
                            src={IMAGE_PATH + castMember.profilePath}
                            className="mb-3 rounded-md object-cover"
                            alt={castMember.name}
                            width="100px"
                            height="100px"
                          />

                          <span className="line-clamp-2 h-[3rem] text-base">
                            {castMember.character}
                          </span>
                          <span className="line-clamp-2 h-[2.50rem] text-sm  opacity-75">
                            {castMember.name}
                          </span>
                        </div>
                      ),
                  )}
                </div>
              </div>

              <div className="w-full">
                <div className="pb-3 text-2xl">
                  {providers.length === 0 ? 'Not available in provided regions' : 'Available on'}
                </div>

                <div
                  className="discover-lg:gap-x-8 no-scrollbar flex gap-x-5 overflow-x-auto overscroll-x-none pb-2"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {providers.map(provider => (
                    <div
                      className="flex flex-col justify-center text-center"
                      key={provider.providerId}
                    >
                      <img
                        src={IMAGE_PATH + provider.logoPath}
                        className="mb-3 rounded-md object-contain"
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
