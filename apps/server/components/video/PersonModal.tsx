import { observer } from 'mobx-react-lite'
import { useRouter } from 'next/router'

import React from 'react'
import moment from 'moment'

import { TmdbPersonType } from '@reelist/interfaces/tmdb/TmdbPersonResponse'
import { TmdbVideoPartialType } from '@reelist/interfaces/tmdb/TmdbVideoPartialType'

import EntityImage from '../EntityImage'
import EntityModal from '../EntityModal'
import { SnapHoverGroup, SnapHoverItem } from '../SnapHoverGroup'

const PersonModal = observer(({ person }: { person: TmdbPersonType }) => {
  const router = useRouter()

  const handleVideoSelection = (video: TmdbVideoPartialType) => {
    router.push(`/discover?videoId=${video.videoId}`, undefined, { shallow: true })
  }

  const birthday = moment(person.birthday).format('MMM YYYY')
  const deathday = person.deathday ? moment(person.deathday).format('MMM YYYY') : ''

  return (
    <EntityModal
      title={person.name}
      person={person}
      subTitle={`${person.knownForDepartment} ‧ ${birthday} - ${deathday}`}
      description={person.biography}
    >
      <div className="no-scrollbar relative w-full overflow-x-auto overscroll-x-none">
        <div className="sticky left-0 z-20 w-full pb-3 text-2xl">Known For</div>

        <SnapHoverGroup className="relative gap-x-3 pb-4 pl-2">
          {person.media.map(video => (
            <SnapHoverItem
              className="discover-md:scale-90 flex cursor-pointer flex-col justify-center text-center transition-all duration-200 ease-in-out hover:scale-100"
              key={video.id}
              onClick={() => handleVideoSelection(video)}
            >
              <EntityImage video={video} className="!h-[200px] !min-h-0 max-w-fit" isPoster />

              <span className="mt-2 line-clamp-4 h-[3rem] text-base font-semibold text-white">
                {video.videoName}
              </span>
            </SnapHoverItem>
          ))}
        </SnapHoverGroup>
      </div>
    </EntityModal>
  )
})

export default PersonModal
