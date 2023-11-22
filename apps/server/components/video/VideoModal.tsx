import { observer } from 'mobx-react-lite'
import { useRouter } from 'next/router'

import React, { useMemo } from 'react'
import _ from 'lodash'

import EntityImage from '../EntityImage'
import EntityModal from '../EntityModal'

import { TmdbPersonCreditResponse } from '@reelist/interfaces/tmdb/TmdbPersonResponse'
import { TmdbVideoPartialType } from '@reelist/interfaces/tmdb/TmdbVideoPartialType'
import { TmdbVideoByIdType } from '@reelist/interfaces/tmdb/TmdbVideoByIdType'
import { TmdbWatchProviderDataResponse } from '@reelist/interfaces/tmdb/TmdbWatchProviderResponse'

const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500'

const VideoModal = observer(
  ({ video, selectedRegions }: { video: TmdbVideoByIdType; selectedRegions: string[] }) => {
    const router = useRouter()

    const getProvidersByType = (type): TmdbWatchProviderDataResponse[] =>
      _.chain(selectedRegions)
        .flatMap(region => video.providers[region]?.[type])
        .compact()
        .uniqBy('providerId')
        .value()

    const providers: Array<
      TmdbWatchProviderDataResponse & {
        type: string
      }
    > = useMemo(() => {
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

    const handleVideoSelection = (video: TmdbVideoPartialType) => {
      router.push(`/discover?videoId=${video.videoId}`, undefined, { shallow: true })
    }

    const handlePersonSelection = (person: TmdbPersonCreditResponse) => {
      router.push(`/discover?personId=${person.id}`, undefined, { shallow: true })
    }

    return (
      <EntityModal
        video={video}
        title={video.videoName}
        subTitle={`${_.map(video.genres, 'name').join('/')} ‧ ${video.videoRuntime}`}
        description={video.overview}
      >
        <div className="no-scrollbar relative w-full overflow-x-auto overscroll-x-none">
          <div className="sticky left-0 z-20 w-full pb-3 text-2xl">Cast</div>

          <div className="relative flex  w-[100px] gap-x-5 pb-4 pl-2">
            {video.cast.map(
              castMember =>
                castMember.profilePath && (
                  <div
                    className="discover-md:scale-90 flex cursor-pointer flex-col justify-center text-center transition-all duration-200 ease-in-out hover:scale-100 "
                    onClick={() => handlePersonSelection(castMember)}
                    key={castMember.id}
                  >
                    <EntityImage
                      person={castMember}
                      className="!h-[200px] !min-h-0 max-w-fit"
                      isPoster
                      isPerson
                    />

                    <span className="mt-2 line-clamp-2 h-[3rem] text-base">
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

        <div className="no-scrollbar relative w-full overflow-x-auto overscroll-x-none">
          <div className="sticky left-0 z-20 w-full pb-3 text-2xl">Related Videos</div>

          <div className="relative flex  gap-x-3 pb-4 pl-2">
            {video.similar.map(relatedVideo => (
              <div
                className="discover-md:scale-90 flex cursor-pointer flex-col justify-center text-center transition-all duration-200 ease-in-out hover:scale-100"
                key={relatedVideo.id}
                onClick={() => handleVideoSelection(relatedVideo)}
              >
                <EntityImage
                  video={relatedVideo}
                  className="!h-[200px] !min-h-0 max-w-fit"
                  isPoster
                />

                <span className="mt-2 line-clamp-2 h-[3rem] text-base">
                  {relatedVideo.videoName}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full">
          <div className="pb-3 text-2xl">
            {providers.length === 0 ? 'Not available in provided regions' : 'Available on'}
          </div>

          <div
            className="discover-lg:gap-x-8 no-scrollbar flex gap-x-5 overflow-x-auto overscroll-x-none pb-2 pl-2"
            style={{ scrollbarWidth: 'none' }}
          >
            {providers.map(provider => (
              <div className="flex flex-col justify-center text-center" key={provider.providerId}>
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
      </EntityModal>
    )
  },
)

export default VideoModal
