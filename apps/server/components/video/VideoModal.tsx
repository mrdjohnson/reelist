import { observer } from 'mobx-react-lite'
import { useRouter } from 'next/router'

import React, { useMemo } from 'react'
import _ from 'lodash'

import { SnapHoverGroup, SnapHoverItem } from '../SnapHoverGroup'
import EntityImage from '../EntityImage'
import EntityModal from '../EntityModal'

import { TmdbPersonCreditResponse } from '@reelist/interfaces/tmdb/TmdbPersonResponse'
import { TmdbVideoPartialType } from '@reelist/interfaces/tmdb/TmdbVideoPartialType'
import { TmdbVideoByIdType } from '@reelist/interfaces/tmdb/TmdbVideoByIdType'

const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500'

const VideoModal = observer(
  ({ video, selectedRegions }: { video: TmdbVideoByIdType; selectedRegions: string[] }) => {
    const router = useRouter()

    const providers = useMemo(() => {
      return _.chain(selectedRegions)
        .flatMap(region => video.providers[region])
        .compact()
        .uniqBy('providerId')
        .value()
    }, [video.providers, selectedRegions])

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

          <SnapHoverGroup className="relative flex w-full pb-4 pl-2">
            {video.cast.map(
              castMember =>
                castMember.profilePath && (
                  <SnapHoverItem
                    className="flex cursor-pointer flex-col justify-center text-center"
                    onClick={() => handlePersonSelection(castMember)}
                    key={castMember.id}
                  >
                    <div className="discover-md:scale-95 transition-all duration-200 ease-in-out hover:scale-100 ">
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
                  </SnapHoverItem>
                ),
            )}
          </SnapHoverGroup>
        </div>

        <div className="no-scrollbar relative w-full overflow-x-auto overscroll-x-none">
          <div className="sticky left-0 z-20 w-full pb-3 text-2xl">
            {_.isEmpty(video.similar) ? 'No related videos' : 'Related Videos'}
          </div>

          <SnapHoverGroup className="relative gap-x-3 pb-4 pl-2">
            {video.similar.map(relatedVideo => (
              <SnapHoverItem
                className="flex cursor-pointer flex-col justify-center text-center "
                key={relatedVideo.id}
                onClick={() => handleVideoSelection(relatedVideo)}
              >
                <div className="discover-md:scale-95 transition-all duration-200 ease-in-out hover:scale-100 ">
                  <EntityImage
                    video={relatedVideo}
                    className="!h-[200px] !min-h-0 max-w-fit"
                    isPoster
                  />

                  <span className="mt-2 line-clamp-2 h-[3rem] text-base">
                    {relatedVideo.videoName}
                  </span>
                </div>
              </SnapHoverItem>
            ))}
          </SnapHoverGroup>
        </div>

        <div className="w-full">
          <div className="pb-3 text-2xl">
            {providers.length === 0 ? 'Not available in provided regions' : 'Available on'}
          </div>

          <SnapHoverGroup className="discover-lg:gap-x-8 gap-x-5 pb-2 pl-2">
            {providers.map(provider => (
              <a href={provider.link} className="text-white decoration-transparent">
                <SnapHoverItem
                  className="flex flex-col justify-center text-center"
                  key={provider.providerId}
                >
                  <div className="discover-md:scale-95 transition-all duration-200 ease-in-out hover:scale-100 ">
                    <img
                      src={IMAGE_PATH + provider.logoPath}
                      className="mb-2 rounded-md object-contain"
                      alt={provider.providerName}
                      width="50px"
                      height="50px"
                    />

                    <span>{provider.type}</span>
                  </div>
                </SnapHoverItem>
              </a>
            ))}
          </SnapHoverGroup>
        </div>
      </EntityModal>
    )
  },
)

export default VideoModal
