import { observer } from 'mobx-react-lite'
import { useRouter } from 'next/router'

import React from 'react'
import _ from 'lodash'
import Person from '@reelist/models/Person'
import Video from '@reelist/models/Video'

import EntityImage from '../EntityImage'

const PersonModal = observer(({ person }: { person: Person }) => {
  const router = useRouter()

  const handleVideoSelection = (video: Video) => {
    const mediaType = video.mediaType === 'tv' ? 'tv' : 'mv'

    router.push(`/discover?videoId=${mediaType + video.id}`, undefined, { shallow: true })
  }

  return (
    <div className="discover-lg:flex-row discover-lg:flex-nowrap flex max-w-7xl flex-col flex-wrap justify-center text-white">
      <div className="discover-lg:mr-12 flex w-fit max-w-full flex-1 justify-center self-center rounded-lg">
        <EntityImage
          person={person}
          className=""
          isPoster
        />
      </div>

      <div className="flex w-full flex-col overflow-clip">
        <p className="discover-lg:text-left discover-lg:mt-0 discover-md:text-5xl my-4 text-center text-3xl">
          {person.name}
        </p>

        <div className="bg-reelist-red mb-6 mt-3 h-[1px]" />

        <div className="max-h-72 min-h-20 overflow-scroll whitespace-normal break-words">
          {person.biography}
        </div>

        <div className="flex w-full flex-1 items-end pt-4 ">
          <div className="w-full flex-col">
            <div className="no-scrollbar relative w-full overflow-x-auto overscroll-x-none">
              <div className="sticky left-0 z-20 w-full pb-3 text-2xl">Known For</div>

              <div className="relative flex  gap-x-3 pb-4">
                {person.media.map(video => (
                  <div
                    className=" flex scale-90 cursor-pointer flex-col justify-center text-center transition-all duration-200 ease-in-out hover:scale-100"
                    key={video.id}
                    onClick={() => handleVideoSelection(video)}
                  >
                    <EntityImage video={video} className="!h-[200px] !min-h-0 max-w-fit" isPoster />

                    <span className=" line-clamp-4 h-[3rem] text-base font-semibold text-white">
                      {video.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default PersonModal
