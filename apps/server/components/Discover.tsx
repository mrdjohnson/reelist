'use client'

import { observer } from 'mobx-react-lite'
import { useRouter } from 'next/router'
import Head from 'next/head'

import { Box, Dialog, Drawer, Fab, Skeleton, SwipeableDrawer, Typography } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
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

import InfiniteScroll from './InfiniteScroll'
import VideoModal from './video/VideoModal'
import VideoImage from './video/VideoImage'
import ReelistAccordion, { ReelistAccordionSection } from '~/components/ReelistAccordion'

const DescendingIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="h-5 w-5"
  >
    <path
      fillRule="evenodd"
      d="M2 3.75A.75.75 0 012.75 3h11.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zM2 7.5a.75.75 0 01.75-.75h7.508a.75.75 0 010 1.5H2.75A.75.75 0 012 7.5zM14 7a.75.75 0 01.75.75v6.59l1.95-2.1a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 111.1-1.02l1.95 2.1V7.75A.75.75 0 0114 7zM2 11.25a.75.75 0 01.75-.75h4.562a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
      clipRule="evenodd"
    />
  </svg>
)

const AscendingIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="h-5 w-5"
  >
    <path
      fillRule="evenodd"
      d="M2 3.75A.75.75 0 012.75 3h11.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zM2 7.5a.75.75 0 01.75-.75h6.365a.75.75 0 010 1.5H2.75A.75.75 0 012 7.5zM14 7a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02l-1.95-2.1v6.59a.75.75 0 01-1.5 0V9.66l-1.95 2.1a.75.75 0 11-1.1-1.02l3.25-3.5A.75.75 0 0114 7zM2 11.25a.75.75 0 01.75-.75H7A.75.75 0 017 12H2.75a.75.75 0 01-.75-.75z"
      clipRule="evenodd"
    />
  </svg>
)

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
  const [showSelectedVideo, setShowSelectedVideo] = useState(false)
  const [showMobileFilterOptions, setShowMobileFilterOptions] = useState(false)
  const [mobileFilterText, setMobileFilterText] = useState('')

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
  const [isLoadingVideos, setIsLoadingVideos] = useState(false)

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

      setVideos(_.uniqBy(videos.concat(filteredVideos), 'videoId'))
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
        setIsLoadingVideos(false)
      })
  }

  const search = () => {
    videoSearch(searchText, { deepSearch: true, page: page.toString() })
      .then(handleVideos)
      .catch(e => {})
      .finally(() => {
        setIsLoadingVideos(false)
      })
  }

  const loadVideos = () => {
    if (page > 10 || isLoadingVideos) {
      return
    }

    setIsLoadingVideos(true)

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
    // todo: scroll back to top
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
    if (showSelectedVideo) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [showSelectedVideo])

  useEffect(() => {
    loadVideos()
  }, [page, searchText])

  const getNextPage = useCallback(() => {
    if (isLoadingVideos) return

    setPage(page + 1)
  }, [page, isLoadingVideos])

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
  const totalContainerPadding = containerPadding * 2

  const itemWidth = 307 // width of each item in pixels
  const spacing = 20 // spacing between items in pixels

  const numItemsPerRow = useMemo(() => {
    const possibleItemsPerRow = Math.floor((windowWidth + spacing) / (itemWidth + spacing))

    return Math.min(possibleItemsPerRow, 5)
  }, [windowWidth])

  const width = useMemo(() => {
    const nextWidth = numItemsPerRow * itemWidth + (numItemsPerRow - 1) * spacing

    if (windowWidth <= 673) {
      return windowWidth - totalContainerPadding
    }

    return nextWidth
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
      toggleDrawer(false)
    }
  }
  const [open, setOpen] = useState(false)
  const toggleDrawer = (nextOpen: boolean) => {
    setOpen(nextOpen)
  }
  const [selectedAccordion, setSelectedAccordion] = useState('')

  const selectAccordion = (label: string) => {
    if (label === selectedAccordion) {
      setSelectedAccordion('')
    } else {
      setSelectedAccordion(label)
    }
  }

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  return (
    <div
      suppressHydrationWarning
      className="flex min-h-screen w-screen flex-col"
      style={{
        background: 'radial-gradient(50% 50% at 50% 50%, #1A200F 0%, #131313 100%)',
      }}
    >
      <Head>
        <title>Discover</title>
      </Head>

      <Fab
        className="bg-reelist-red discover-md:hidden fixed bottom-5 right-5 flex opacity-70 "
        onClick={() => toggleDrawer(true)}
      >
        {/* filter icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          className="h-6 w-6 text-white "
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
          />
        </svg>
      </Fab>

      <div
        className="discover-md:mt-[20px] flex h-full flex-col self-center px-[20px]"
        style={{ width }}
      >
        <InfiniteScroll onRefresh={getNextPage}>
          <div className="discover-md:block mb-4 hidden w-full ">
            <div className="flex h-[40px] w-full flex-row items-baseline">
              <SearchIcon className="mr-4 h-full justify-center self-center text-3xl text-gray-300" />

              {searchText ? (
                <Button
                  className="font-inter bg-reelist-red group h-fit items-center rounded-full border px-3 text-xl text-black hover:text-white"
                  onClick={() => setSearchText('')}
                >
                  <div className="flex items-center justify-center">
                    {searchText}

                    {/* close icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 justify-self-center pl-4 text-center align-baseline "
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
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

                    {/* close icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-4 pl-2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                )),
              )}
            </div>
          </div>

          <div
            className="discover-md:justify-items-stretch mb-4 grid w-full  flex-1 justify-center justify-items-center gap-x-5"
            style={{ gridTemplateColumns: `repeat(${numItemsPerRow}, minmax(0, 1fr))` }}
          >
            {videos.map(video => (
              <VideoImage
                video={video}
                containerProps={{ width: '307px' }}
                onPress={() => handleVideoSelection(video)}
                key={video.videoId}
              />
            ))}
          </div>

          {isLoadingVideos && (
            <div className="flex justify-center ">
              {/* arrow refresh aka loading icon */}

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mb-8 h-16 w-16 animate-spin text-gray-500"
              >
                <path
                  fillRule="evenodd"
                  d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </InfiniteScroll>

        {/* selected video dialog */}
        <Dialog
          open={showSelectedVideo}
          onClose={closeVideo}
          hideBackdrop
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
          classes={{ paper: 'my-4 discover-md:my-0' }}
          className="bg-transparent-dark cursor-pointer backdrop-blur-md"
          transitionDuration={{ exit: 50 }}
        >
          <div
            className="text-reelist-red absolute right-2 top-2 cursor-pointer lg:top-2"
            onClick={closeVideo}
          >
            {/* close icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-8"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <div className="no-scrollbar relative overflow-scroll overscroll-none">
            {selectedVideo && (
              <VideoModal
                video={selectedVideo}
                selectedRegions={_.keys(regionSelectState.selectedOptions)}
              />
            )}
          </div>
        </Dialog>

        {/* mobile filter options dialog */}
        <Dialog
          open={showMobileFilterOptions}
          onClose={() => setShowMobileFilterOptions(false)}
          hideBackdrop
          PaperProps={{
            style: {
              background:
                'radial-gradient(50% 50% at 50% 50%, rgba(21, 30, 1, 0.25) 0%, rgba(0, 0, 0, 0.45) 100%)',
              backdropFilter: 'blur(15px)',
              maxWidth: '1619px',
              position: 'relative',
              overflowY: 'hidden',
              overflowX: 'clip',
              cursor: 'default',
            },
          }}
          classes={{ paper: 'm-1 relative p-2 pr-6 w-full h-full' }}
          className="bg-transparent-dark cursor-pointer backdrop-blur-md"
          transitionDuration={{ exit: 50 }}
        >
          <div
            className="text-reelist-red fixed right-2 top-2 z-10 cursor-pointer"
            onClick={() => setShowMobileFilterOptions(false)}
          >
            {/* close icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <div className="top-0 right-0 left-0 bg-black">
            <input
              className="focus:shadow-outline border-reelist-red mb-4 w-full appearance-none border-0 border-b bg-transparent py-2 text-lg leading-tight text-gray-300 shadow outline-none"
              type="text"
              autoComplete="off"
              placeholder="Filter"
              onChange={e => setMobileFilterText(e.target.value)}
            />
          </div>

          <ReelistAccordion>
            <ReelistAccordionSection
              selectState={sortTypesSelectState}
              disabled={searchText}
              filterText={mobileFilterText}
              index={0}
              totalCount={5}
            />

            <ReelistAccordionSection
              selectState={videoTypesSelectState}
              disabled={searchText}
              filterText={mobileFilterText}
              index={1}
              totalCount={5}
            >
              <div
                className="flex cursor-pointer justify-center"
                onClick={() =>
                  setTypesSeparationType(
                    typesSeparationType === 'includes_every' ? 'includes_any' : 'includes_every',
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
            </ReelistAccordionSection>

            <ReelistAccordionSection
              selectState={regionSelectState}
              disabled={searchText}
              filterText={mobileFilterText}
              index={2}
              totalCount={5}
            >
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
            </ReelistAccordionSection>

            <ReelistAccordionSection
              selectState={genreSelectState}
              disabled={searchText}
              filterText={mobileFilterText}
              index={3}
              totalCount={5}
            >
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
            </ReelistAccordionSection>

            <ReelistAccordionSection
              selectState={watchProviderSelectState}
              disabled={searchText}
              filterText={mobileFilterText}
              index={4}
              totalCount={5}
            />
          </ReelistAccordion>
        </Dialog>

        {/* mobile options drawer */}
        <Drawer
          anchor="bottom"
          open={open}
          onClose={() => toggleDrawer(false)}
          PaperProps={{
            className:
              'relative h-full bg-transparent-dark backdrop-blur-md rounded-t-lg p-3 m-1 mb-0 text-white',
          }}
        >
          <div
            className="text-reelist-red fixed right-2 top-2 cursor-pointer"
            onClick={() => toggleDrawer(false)}
          >
            {/* close icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <div className="box no-scrollbar overflow-scroll overflow-x-clip pr-4">
            <div className="flex h-[40px] w-full flex-row items-baseline">
              <SearchIcon className="mr-4 h-full justify-center self-center text-3xl text-gray-300" />

              {searchText ? (
                <Button
                  className="font-inter bg-reelist-red group h-fit items-center rounded-full border px-3 text-xl text-black hover:text-white"
                  onClick={() => setSearchText('')}
                >
                  <div className="flex items-center justify-center">
                    {searchText}

                    {/* close icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 justify-self-center pl-4 text-center align-baseline "
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
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

            <div className="flex w-full justify-center">
              <Button
                className={
                  'font-inter group flex w-fit justify-start self-center rounded-l-md rounded-r-md pl-4 pr-2 text-left align-baseline text-lg text-black hover:text-white' +
                  (searchText ? ' pointer-events-none bg-gray-500 opacity-40' : ' bg-reelist-red ')
                }
                onClick={() => setShowMobileFilterOptions(true)}
                disableRipple
              >
                {/* filter icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="mr-2 h-5 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
                  />
                </svg>
                Filter Options
              </Button>
            </div>

            <div
              className={
                'm-0 m-3 w-full ' + (searchText ? 'text-gray-500 opacity-40' : 'text-white')
              }
            >
              Filters:
            </div>

            <div className="relative flex flex-row flex-wrap gap-x-3 gap-y-3">
              {[
                videoTypesSelectState,
                regionSelectState,
                genreSelectState,
                watchProviderSelectState,
              ].flatMap(selectState =>
                _.map(selectState.selectedOptions, (name, id) => (
                  <Button
                    className={
                      'font-inter rounded-full border border-solid p-3  hover:border-red-600 hover:text-red-600' +
                      (searchText
                        ? ' pointer-events-none border-gray-500 text-gray-500 opacity-40'
                        : ' border-red-400 text-white')
                    }
                    onClick={() => selectState.removeOption(id)}
                    key={id}
                    disableRipple
                  >
                    {name}

                    {/* close icon */}

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 justify-self-center pl-4 text-center align-baseline "
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                )),
              )}
            </div>
          </div>
        </Drawer>
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
  { id: 'popularity.desc', name: 'Popularity (Desc)', icon: DescendingIcon },
  { id: 'popularity.asc', name: 'Popularity (Asc)', icon: AscendingIcon },
  { id: 'first_air_date.desc', name: 'First Air Date (Desc)', icon: DescendingIcon },
  { id: 'first_air_date.asc', name: 'First Air Date (Asc)', icon: AscendingIcon },
  { id: 'vote_average.desc', name: 'Vote Average (Desc)', icon: DescendingIcon },
  { id: 'vote_average.asc', name: 'Vote Average (Asc)', icon: AscendingIcon },
]

export default Discover
