'use client'

import { observer } from 'mobx-react-lite'
import { useRouter } from 'next/router'

import { Dialog } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@mui/material'
import _ from 'lodash'
import { useStore } from '@reelist/utils/hooks/useStore'
import useLocalStorageState from '@reelist/utils/hooks/useLocalStorageState'
import useVideoDiscover from '@reelist/utils/hooks/useVideoDiscover'
import useVideoSearch from '@reelist/utils/hooks/useVideoSearch'
import { callTmdb } from '@reelist/apis/api'
import Video from '@reelist/models/Video'
import ReelistSelect, { useSelectState } from '~/components/ReelistSelect'

import NavBar from '~/components/NavBar'
import InfiniteScroll from './InfiniteScroll'
import VideoModal from './video/VideoModal'
import VideoImage from './video/VideoImage'

const useWindowWidth = () => {
  const [width, setWidth] = useState(window?.innerWidth)
  const handleResize = () => setWidth(window?.innerWidth)

  useEffect(() => {
    handleResize()

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return width
}

const Discover = observer(() => {
  const router = useRouter()

  const { videoStore } = useStore()
  const videoDiscover = useVideoDiscover()
  const videoSearch = useVideoSearch()

  const windowWidth = useWindowWidth()

  const [searchText, setSearchText] = useState('')

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [showSelectedVideo, setShowSelectedVideo] = useState(true)

  const [genreSeparationType, setGenreSeparationType] = useLocalStorageState(
    'genreSeparationType',
    'includes_any',
  )
  const [typesSeparationType, setTypesSeparationType] = useLocalStorageState(
    'typesSeparationType',
    'includes_any',
  )
  const [regionSeparationType, setRegionSeparationType] = useLocalStorageState(
    'regionSeparationType',
    'includes_any',
  )

  const [page, setPage] = useState(1)
  const [videos, setVideos] = useState<Video[]>([])
  const loadingRef = useRef(false)

  const videoFilter = (video: Video) => {
    if (_.isEmpty(video.posterPath || video.backdropPath)) return false

    const mustIncludeAllRegions = regionSeparationType === 'includes_every'

    // if there is a regions filter, actualy filter by it
    for (const region in regionSelectState.selectedOptions) {
      const regionExists = !_.isEmpty(video.providers[region])

      if (mustIncludeAllRegions && !regionExists) {
        return false
      } else if (regionExists) {
        return true
      }
    }

    return false
  }

  const handleVideos = (nextVideos: Video[]) => {
    const filteredVideos = searchText
      ? nextVideos
      : _.chain(nextVideos).filter(videoFilter).compact().value()

    if (page === 1) {
      console.log('making new videos')
      setVideos(filteredVideos)
    } else {
      console.log('adding to current videos')

      setVideos(videos.concat(filteredVideos))
    }
  }

  const discover = () => {
    const withoutIdentifier = (item: string) => item.split(':')[1]

    const selectedVideoTypes = videoTypesSelectState.selectedOptions
    const selectedSortType = _.keys(sortTypesSelectState.selectedOptions)[0]
    const selectedRegions = regionSelectState.selectedOptions
    const selectedGenres = _.keys(genreSelectState.selectedOptions)
    const selectedWatchProviders = _.keys(watchProviderSelectState.selectedOptions)

    const {
      shared: sharedGenres = [],
      tv: tvGenres = [],
      movie: movieGenres = [],
    } = _.groupBy(selectedGenres, item => item.split(':')[0])

    const {
      shared: sharedProviders = [],
      tv: tvProviders = [],
      movie: movieProviders = [],
    } = _.groupBy(selectedWatchProviders, item => item.split(':')[0])

    const genreSeparator = genreSeparationType === 'includes_any' ? ',' : '|'

    videoDiscover({
      with_type: _.keys(selectedVideoTypes).join(
        typesSeparationType === 'includes_any' ? ',' : '|',
      ),
      page: page.toString(),
      sort_by: selectedSortType,
      watch_region: _.keys(selectedRegions).join(','),
      tvGenres: sharedGenres.concat(tvGenres).map(withoutIdentifier).join(genreSeparator),
      movieGenres: sharedGenres.concat(movieGenres).map(withoutIdentifier).join(genreSeparator),
      tvProviders: sharedProviders.concat(tvProviders).map(withoutIdentifier).join(','),
      movieProviders: sharedProviders.concat(movieProviders).map(withoutIdentifier).join(','),
    })
      .then(handleVideos)
      .catch(e => {})
      .finally(() => {
        loadingRef.current = false
      })
  }

  const search = () => {
    videoSearch(searchText, { deepSearch: true, page: page.toString() })
      .then(handleVideos)
      .catch(e => {})
      .finally(() => {
        loadingRef.current = false
      })
  }

  const loadVideos = () => {
    if (page > 10 || loadingRef.current) {
      return
    }

    loadingRef.current = true

    if (searchText) {
      search()
    } else {
      discover()
    }
  }

  const videoTypesSelectState = useSelectState('Types', getVideoTypes)
  const genreSelectState = useSelectState('Genres', getGenres)
  const watchProviderSelectState = useSelectState('Watch Providers', getProviders)
  const regionSelectState = useSelectState('Regions', getRegions, {
    getAlternativeDefaults: getDefaultRegions,
  })
  const sortTypesSelectState = useSelectState('Sort By', getSortTypes, {
    isMulti: false,
    getAlternativeDefaults: () => ['popularity.desc'],
  })

  useEffect(() => {
    setPage(1)
    loadVideos()
  }, [
    videoTypesSelectState.selectedOptions,
    sortTypesSelectState.selectedOptions,
    genreSelectState.selectedOptions,
    watchProviderSelectState.selectedOptions,
    regionSelectState.selectedOptions,
    genreSeparationType,
    typesSeparationType,
    regionSeparationType,
    searchText,
  ])

  useEffect(() => {
    loadVideos()
  }, [page, searchText])

  const getNextPage = useCallback(() => {
    if (loadingRef.current) return

    setPage(page + 1)
  }, [page])

  useEffect(() => {
    const { videoId } = router.query

    if (!videoId) {
      setShowSelectedVideo(false)
    } else if (!_.isArray(videoId)) {
      videoStore.getVideo(videoId).then(setSelectedVideo)
      setShowSelectedVideo(true)
    }
  }, [router.query])

  const handleVideoSelection = (video: Video) => {
    router.push(`/discover?videoId=${video.videoId}`, undefined, { shallow: true })
  }

  const closeVideo = () => {
    router.replace('/discover', undefined, { shallow: true })
  }

  const containerPadding = 20

  const calculateContainerWidth = (possibleWidth: number) => {
    const itemWidth = 307 // width of each item in pixels
    const spacing = 20 // spacing between items in pixels

    const numItemsPerRow = Math.floor((possibleWidth + spacing) / (itemWidth + spacing))
    const containerWidth = numItemsPerRow * itemWidth + (numItemsPerRow - 1) * spacing
    return 1 + containerWidth > possibleWidth ? possibleWidth : containerWidth
  }

  const width = useMemo(() => {
    const totalContainerPadding = containerPadding * 2

    return calculateContainerWidth(Math.min(windowWidth, 1800) - totalContainerPadding)
  }, [windowWidth])

  const toggleRegionSeparationType = () => {
    setRegionSeparationType(
      regionSeparationType === 'includes_every' ? 'includes_any' : 'includes_every',
    )
  }

  const toggleGenreSeparationType = () => {
    setGenreSeparationType(
      genreSeparationType === 'includes_every' ? 'includes_any' : 'includes_every',
    )
  }

  const handleKeyDown = event => {
    if (event.keyCode === 13) {
      event.preventDefault()
      setSearchText(event.target.value)
    }
  }

  return (
    <div
      suppressHydrationWarning
      className="m-h-screen flex h-fit w-screen justify-center"
      style={{
        background: 'radial-gradient(50% 50% at 50% 50%, #1A200F 0%, #131313 100%)',
      }}
    >
      <div className="mx-[20px] flex min-h-screen flex-col self-center pt-[20px]" style={{ width }}>
        <NavBar path="/discover" />

        <InfiniteScroll onRefresh={getNextPage}>
          <div className="w-full">
            <div className="flex h-[40px] w-full flex-row items-baseline">
              <SearchIcon className="mr-4 h-full justify-center self-center text-3xl text-gray-300" />

              {searchText ? (
                <Button
                  className="font-inter bg-reelist-red group h-fit items-center rounded-full border px-3 text-xl text-black hover:text-white"
                  onClick={() => setSearchText('')}
                >
                  {/* {searchText}

                  <CloseOutlinedIcon className="h-full pl-2 text-lg text-center align-baseline" /> */}

                  <div className="flex items-center justify-center">
                    {searchText}

                    <CloseOutlinedIcon className="h-full justify-self-center pl-4 text-center align-baseline text-lg " />
                  </div>
                </Button>
              ) : (
                <input
                  className="focus:shadow-outline w-full appearance-none border-0 bg-transparent py-2 text-xl leading-tight text-gray-300 shadow outline-none"
                  type="text"
                  autoComplete="off"
                  placeholder="Search"
                  onKeyDown={handleKeyDown}
                />
              )}
            </div>

            <div className="bg-reelist-red mb-6 mt-3 h-[1px]" />

            <div className="discover-lg:grid-cols-2 grid-rows-auto mb-1 grid grid-cols-1 gap-2 max-[673px]:flex-col">
              <div className="discover-lg:row-start-1 discover-lg:col-span-2 discover-lg:col-start-1 row-start-2 flex flex-grow gap-2 max-[673px]:flex-col">
                <ReelistSelect selectState={videoTypesSelectState} disabled={searchText}>
                  <div
                    className="flex cursor-pointer justify-center"
                    onClick={() =>
                      setTypesSeparationType(
                        typesSeparationType === 'includes_every'
                          ? 'includes_any'
                          : 'includes_every',
                      )
                    }
                  >
                    <input
                      type="checkbox"
                      value="includes_every"
                      checked={typesSeparationType === 'includes_every'}
                      className="accent-reelist-red bg-reelist-red border-reelist-red cursor-pointer border border-solid text-lg"
                    />

                    <div className="ml-2 text-white">Types Must Include All Selected</div>
                  </div>
                </ReelistSelect>

                <ReelistSelect selectState={regionSelectState} disabled={searchText}>
                  <div
                    className="flex cursor-pointer justify-center"
                    onClick={toggleRegionSeparationType}
                  >
                    <input
                      type="checkbox"
                      value="includes_every"
                      checked={regionSeparationType === 'includes_every'}
                      className="accent-reelist-red bg-reelist-red border-reelist-red cursor-pointer border border-solid text-lg"
                    />

                    <div className="ml-2 text-white">Regions Must Include All Selected</div>
                  </div>
                </ReelistSelect>

                <ReelistSelect selectState={genreSelectState} disabled={searchText}>
                  <div
                    className="flex cursor-pointer justify-center"
                    onClick={toggleGenreSeparationType}
                  >
                    <input
                      type="checkbox"
                      value="includes_every"
                      checked={genreSeparationType === 'includes_every'}
                      className="accent-reelist-red bg-reelist-red border-reelist-red cursor-pointer border border-solid text-lg"
                    />

                    <div className="ml-2 text-white">Genres Must Include All Selected</div>
                  </div>
                </ReelistSelect>

                <ReelistSelect selectState={watchProviderSelectState} disabled={searchText} />
              </div>

              <div className="discover-md:justify-self-end discover-lg:col-start-2 row-start-1 justify-self-center">
                <ReelistSelect selectState={sortTypesSelectState} disabled={searchText} />
              </div>
            </div>

            <div className="flex flex-row flex-wrap gap-x-2">
              {[
                videoTypesSelectState,
                regionSelectState,
                genreSelectState,
                watchProviderSelectState,
              ].flatMap(selectState =>
                _.map(selectState.selectedOptions, (name, id) => (
                  <Button
                    className={
                      'font-inter mt-4 rounded-full border border-solid px-3  hover:border-red-600 hover:text-red-600' +
                      (searchText
                        ? ' pointer-events-none border-gray-500 text-gray-500 opacity-40'
                        : ' border-red-400 text-white')
                    }
                    onClick={() => selectState.removeOption(id)}
                    key={id}
                    disableRipple
                  >
                    {name}

                    <CloseOutlinedIcon className=" pl-2 text-[17px]" />
                  </Button>
                )),
              )}
            </div>
          </div>

          <div className="my-4 flex w-full flex-row flex-wrap gap-x-5">
            {videos.map(video => (
              <VideoImage
                video={video}
                containerProps={{ width: '307px' }}
                onPress={() => handleVideoSelection(video)}
                key={video.videoId}
              />
            ))}
          </div>
        </InfiniteScroll>

        <Dialog
          open={showSelectedVideo}
          onClose={closeVideo}
          hideBackdrop
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.49)',
            backdropFilter: 'blur(15px)',
            cursor: 'pointer',
          }}
          PaperProps={{
            style: {
              background:
                'radial-gradient(50% 50% at 50% 50%, rgba(21, 30, 1, 0.25) 0%, rgba(0, 0, 0, 0.45) 100%)',
              backdropFilter: 'blur(15px)',
              maxWidth: '1619px',
              position: 'relative',
              padding: '38px',
              paddingRight: '60px',
              overflowY: 'scroll',
              overflowX: 'clip',
              cursor: 'default',
            },
          }}
          transitionDuration={{ exit: 50 }}
        >
          <div className="absolute right-3 top-4 lg:top-2">
            <CloseOutlinedIcon
              className="cursor-pointer"
              sx={{ color: 'rgb(254, 83, 101)', fontSize: '35px' }}
              onClick={closeVideo}
            />
          </div>

          <div className="no-scrollbar relative overflow-scroll overscroll-none">
            {selectedVideo && (
              <VideoModal
                video={selectedVideo}
                selectedRegions={_.keys(regionSelectState.selectedOptions)}
              />
            )}

            {/* todo: this overflow container stops the background content from scrolling but leaves a strange 1px scrolling effect */}
            <div className="absolute top-0 -z-10 h-[calc(100%+1px)] w-full bg-transparent" />
          </div>
        </Dialog>
      </div>
    </div>
  )
})

// export default Discover

const getRegions = () => {
  return callTmdb('/watch/providers/regions')
    .then(
      item =>
        _.get(item, 'data.data.results') as Array<{
          iso31661: string
          englishName: string
          nativeName: string
        }>,
    )
    .then(items =>
      items.map(item => ({
        id: item.iso31661,
        name: item.englishName,
      })),
    )
}

const getDefaultRegions = () => {
  if (!navigator) return []

  const options = navigator.languages // options look like: en-US, en
    .filter(language => language.includes('-')) // only grab 'en-US' like options
    .map(language => language.match(/-(.*)/)[1]) // only grab 'US' from each option

  return options
}

const getGenresByType = async (type: string) => {
  const typeLabel = _.capitalize(type)

  return callTmdb(`/genre/${type}/list`)
    .then(
      item =>
        _.get(item, 'data.data.genres') as Array<{
          id: string
          name: string
        }>,
    )
    .then(_.toArray)
    .then(items =>
      items.map(item => ({
        original: {
          id: 'shared:' + item.id,
          name: item.name,
        },
        alternative: {
          id: type + ':' + item.id,
          name: `${item.name} (${typeLabel})`,
        },
      })),
    )
    .then(items => _.keyBy(items, 'original.id'))
}

const getGenres = async () => {
  const tvGenresById = await getGenresByType('tv')
  const movieGenresById = await getGenresByType('movie')

  const genreIds = _.uniq(_.keys(tvGenresById).concat(_.keys(movieGenresById)))

  const allGenres = []

  genreIds.forEach(genreId => {
    const tvGenre = tvGenresById[genreId]
    const movieGenre = movieGenresById[genreId]

    const genre = tvGenre || movieGenre
    const { original, alternative } = genre

    // the id is already the same, make sure the name is too
    if (tvGenre?.original?.name === movieGenre?.original?.name) {
      allGenres.push(original)
    } else {
      allGenres.push(alternative)
    }
  })

  return _.sortBy(allGenres, 'name')
}

const getProvidersByType = async (type: string) => {
  const typeLabel = _.capitalize(type)

  return callTmdb(`/watch/providers/${type}`)
    .then(
      item =>
        _.get(item, 'data.data.results') as Array<{
          displayPriority: string
          logoPath: string
          providerName: string
          providerId: string
        }>,
    )
    .then(items => _.sortBy(items, 'displayPriority'))
    .then(items =>
      items.map(item => ({
        original: {
          id: 'shared:' + item.providerId,
          name: item.providerName,
        },
        alternative: {
          id: type + ':' + item.providerId,
          name: `${item.providerName} (${typeLabel})`,
        },
      })),
    )
    .then(items => _.keyBy(items, 'original.id'))
}

// initial options: navigator.languages.filter(language => language.includes('-')).map(language => language.match(/-(.*)/)[1])
const getProviders = async () => {
  const tvProvidersById = await getProvidersByType('tv')
  const movieProvidersById = await getProvidersByType('movie')

  const providerIds = _.uniq(_.keys(tvProvidersById).concat(_.keys(movieProvidersById)))

  const allProviders = []

  providerIds.forEach(providerId => {
    const tvProvider = tvProvidersById[providerId]
    const movieProvider = movieProvidersById[providerId]

    const provider = tvProvider || movieProvider
    const { original, alternative } = provider

    // the id is already the same, make sure the name is too
    if (tvProvider?.original?.name === movieProvider?.original?.name) {
      allProviders.push(original)
    } else {
      allProviders.push(alternative)
    }
  })

  return allProviders
}

//todo make sure this works for tv shows AND movies
const getVideoTypes = async () => [
  { id: '0', name: 'Documentary' },
  { id: '1', name: 'News' },
  { id: '2', name: 'Miniseries' },
  { id: '3', name: 'Reality' },
  { id: '4', name: 'Scripted' },
  { id: '5', name: 'Talk Show' },
  { id: '6', name: 'Video' },
]

const getSortTypes = async () => [
  { id: 'popularity.desc', name: 'Popularity (Desc)' },
  { id: 'popularity.asc', name: 'Popularity (Asc)' },
  { id: 'first_air_date.desc', name: 'First Air Date (Desc)' },
  { id: 'first_air_date.asc', name: 'First Air Date (Asc)' },
  { id: 'vote_average.desc', name: 'Vote Average (Desc)' },
  { id: 'vote_average.asc', name: 'Vote Average (Asc)' },
]

export default Discover
