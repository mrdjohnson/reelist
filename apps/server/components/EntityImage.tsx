import { observer } from 'mobx-react-lite'

import React, { useMemo, useState } from 'react'
import _ from 'lodash'
import { DiscoverVideoType } from '@reelist/models/DiscoverVideo'
import classNames from 'classnames'
import Person from '@reelist/models/Person'
import { useStore } from '@reelist/utils/hooks/useStore'

const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500'

type VideoImageProps = {
  video?: DiscoverVideoType
  person?: Person
  isPoster?: boolean
  onPress?: () => void
  loading?: boolean
  className?: string
  isPerson?: boolean
}

const TvIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="transition-max-height h-[125px] duration-300 ease-in-out group-hover:h-[155px]"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z"
    />
  </svg>
)

const MovieIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="transition-max-height h-[125px] duration-300 ease-in-out group-hover:h-[155px]"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5"
    />
  </svg>
)

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="transition-max-height h-[125px] duration-300 ease-in-out group-hover:h-[155px]"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
    />
  </svg>
)

const EntityImage = observer(
  ({
    loading,
    video = {},
    person = {},
    onPress,
    isPoster,
    isPerson,
    className,
  }: VideoImageProps) => {
    const { tmdbDiscover } = useStore()

    const [imageErrored, setImageErrored] = useState(false)

    // default to poster or backdrop path, or either if one does not exist
    const source = useMemo(() => {
      // if we failed to get an image, return nothing
      if (imageErrored) return ''

      const posterPath = video.posterPath || person.profilePath

      // if it is a poster, and we have a poster, show the poster
      if (isPoster && posterPath) return posterPath

      // show whatever is available
      return video.backdropPath || posterPath
    }, [imageErrored, isPoster, video.posterPath, video.backdropPath, person.profilePath])

    const genres = useMemo(() => {
      if (loading) return []

      return tmdbDiscover.mapGenres(video)
    }, [video.genreIds, loading])

    if (loading) {
      return (
        <div
          className={classNames(
            'my-4 flex animate-pulse justify-center overflow-hidden rounded-md bg-gray-500 opacity-30 ',
            {
              'aspect-poster my-0': isPoster,
              'discover-md:w-auto discover-md:aspect-auto aspect-backdrop m-0  my-4 h-[207px] w-full ':
                !isPoster,
            },
          )}
        />
      )
    }

    const hasBackdrop = !isPoster && source

    return (
      <div
        className={classNames(
          'relative my-4 flex justify-center overflow-hidden rounded-md transition-all duration-300 ease-in-out',
          {
            '!my-0 max-w-full': isPoster,
            'discover-md:h-[207px] aspect-backdrop group m-0 w-full': !isPoster,
            'discover-md:hover:my-0 discover-md:hover:h-[237px] my-4': hasBackdrop,
            'cursor-pointer': onPress,
          },
        )}
        onClick={onPress}
      >
        {source ? (
          <img
            src={IMAGE_PATH + source}
            alt={source}
            height="100%"
            onError={() => setImageErrored(true)}
            className={classNames(className, {
              'aspect-poster h-fit max-h-[609px] min-h-[400px] object-contain': isPoster,
              'discover-md:w-[307px] discover-md:object-cover discover-md:-mt-4 discover-md:h-[270px] discover-md:group-hover:mt-0 h-full w-full object-contain transition-[margin-top] duration-300  ease-in-out':
                !isPoster,
            })}
          />
        ) : (
          <div
            className={classNames('flex flex-1 justify-center bg-slate-500 text-black', className, {
              'min-h-[400px] items-center': isPoster,
              'aspect-poster  max-h-[609px]': isPoster && !source,
            })}
          >
            {isPerson ? <UserIcon /> : video.isTv ? <TvIcon /> : <MovieIcon />}
          </div>
        )}

        {!isPoster && (
          <div
            className="transition-min-height absolute bottom-0 flex min-h-[70px] w-full flex-col justify-end pb-1 pt-3 duration-300 ease-in-out"
            style={{
              background:
                'linear-gradient(180deg, rgba(0, 0, 0, 0.54) 0%, rgba(0, 0, 0, 0) 0.01%, rgba(0, 0, 0, 0.54) 33.85%)',
            }}
          >
            <div className="transition-margin-top discover-md:group-hover:mt-3 line-clamp-2 px-2 font-sans text-2xl  text-white duration-300 ease-in-out">
              {video.videoName}
            </div>

            <div className="transition-max-height discover-md:roup-hover:max-h-0 line-clamp-2 flex max-h-16 flex-wrap overflow-hidden px-2 font-sans text-lg text-white duration-300 ease-in-out group-hover:max-h-0 ">
              {_.dropRight(genres).map(genre => (
                <span key={genre}>{genre}/</span>
              ))}

              <span>{_.last(genres)}</span>
            </div>
          </div>
        )}
      </div>
    )
  },
)

export default EntityImage
