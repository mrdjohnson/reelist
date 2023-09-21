import { observer } from 'mobx-react-lite'

import React, { PropsWithChildren } from 'react'
import _ from 'lodash'
import Video from '@reelist/models/Video'
import Person from '@reelist/models/Person'

import EntityImage from './EntityImage'

const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500'

type EntityModalProps = PropsWithChildren<{
  video?: Video
  person?: Person
  title: string
  description: string
  subTitle?: string
}>

const EntityModal = observer(
  ({ video, person, description, title, subTitle, children }: EntityModalProps) => {
    return (
      <div className="discover-lg:flex-row discover-lg:flex-nowrap flex max-w-7xl flex-col flex-wrap justify-center text-white">
        <div className="discover-lg:mr-12 flex w-fit max-w-full flex-1 justify-center self-center rounded-lg">
          <EntityImage
            video={video}
            person={person}
            className="discover-md:max-w-none max-w-full"
            isPoster
          />
        </div>

        <div className="flex w-full flex-col overflow-clip">
          <p className="discover-lg:text-left discover-lg:mt-0 discover-md:text-5xl my-4 text-center text-3xl">
            {title}
          </p>

          <div>{subTitle}</div>

          <div className="bg-reelist-red mb-6 mt-3 h-[1px]" />

          <div className="min-h-20 max-h-72 overflow-scroll whitespace-normal break-words">
            {description}
          </div>

          <div className="flex w-full flex-1 items-end pt-4 ">
            <div className="w-full flex-col">{children}</div>
          </div>
        </div>
      </div>
    )
  },
)

export default EntityModal
