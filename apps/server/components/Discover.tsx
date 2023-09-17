'use client'

import { observer } from 'mobx-react-lite'
import { useRouter } from 'next/router'
import Head from 'next/head'

import { Dialog, Drawer, Toolbar } from '@mui/material'
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
import ReelistAccordion, { ReelistAccordionSection } from '~/components/ReelistAccordion'
import NavBar from '~/components/NavBar'
import PillButton from './PillButton'
import CloseIcon from './heroIcons/CloseIcon'
import VideoGroup from './VideoGroup'
import DescendingIcon from './icons/DecendingIcon'
import AscendingIcon from './icons/AscendingIcon'
import Footer from './Footer'

enum PageState {
  HOME = 'HOME',
  SEARCH = 'SEARCH',
  INFINITE = 'INFINITE',
  NOT_LOADED = 'NOT_LOADED',
}

enum HomePageVideosState {
  LOADED = 'LOADED',
  LOADING = 'LOADING',
  NOT_LOADED = 'NOT_LOADED',
}

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

const Discover = observer(({ logo }: { logo: string }) => {
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
  const [homepageVideosState, setHomepageVideosState] = useState(HomePageVideosState.NOT_LOADED)

  const [homepageSections, setHomepageSections] = useState({})

  const initHomepageVideos = async () => {
    const base = await getVideos(null)
    const comedy = await getVideos(popularGeneresIdsByName.comedy)
    const actionAndAdventure = await getVideos(popularGeneresIdsByName.actionAndAdventure)
    const drama = await getVideos(popularGeneresIdsByName.drama)
    const horror = await getVideos(popularGeneresIdsByName.horror)
    const scifi = await getVideos(popularGeneresIdsByName.scifi)

    setHomepageSections({
      base,
      comedy,
      actionAndAdventure,
      drama,
      horror,
      scifi,
    })

    setHomepageVideosState(HomePageVideosState.LOADED)
  }

  const videoFilter = (video: Video) => {
    if (_.isEmpty(video.posterPath || video.backdropPath)) return false

    if (_.isEmpty(regionSelectState.selectedOptions)) return true

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

  const handleVideos = (nextVideos: Video[], name: string = 'base') => {
    const filteredVideos = searchText
      ? nextVideos
      : _.chain(nextVideos).filter(videoFilter).compact().value()

    if (page === 1) {
      console.log('making new videos')
      return filteredVideos
    } else {
      console.log('adding to current videos')

      return _.uniqBy(videos.concat(filteredVideos), 'videoId')
    }
  }

  const getVideos = async (selectedGenres: string[]) => {
    const withoutIdentifier = (item: string) => item.split(':')[1]

    const selectedVideoTypes = videoTypesSelectState.selectedOptions
    const selectedSortType = _.keys(sortTypesSelectState.selectedOptions)[0]
    const selectedRegions = regionSelectState.selectedOptions
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

    return await videoDiscover({
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
    }).then(handleVideos)
  }

  const discover = () => {
    getVideos(_.keys(genreSelectState.selectedOptions))
      .then(handleVideos)
      .then(finishLoadingVideos)
      .catch(e => {
        finishLoadingVideos([])
      })
  }

  const search = () => {
    videoSearch(searchText, { deepSearch: true, page: page.toString() })
      .then(handleVideos)
      .then(finishLoadingVideos)
      .catch(e => {
        finishLoadingVideos([])
      })
  }

  const loadVideos = () => {
    if (pageState === PageState.NOT_LOADED) return

    if (pageState === PageState.HOME) {
      if (homepageVideosState === HomePageVideosState.NOT_LOADED) {
        setHomepageVideosState(HomePageVideosState.LOADING)
        initHomepageVideos()
      }

      return
    }

    if (page > 10) {
      setIsLoadingVideos(false)
      return
    }

    setIsLoadingVideos(true)

    if (pageState === PageState.SEARCH) {
      search()
    } else {
      discover()
    }
  }

  const finishLoadingVideos = (loadedVideos: Video[]) => {
    setVideos(loadedVideos)

    if (page >= 10) {
      setIsLoadingVideos(false)
    }

    if (_.isEmpty(loadedVideos)) {
      setPage(page + 1)
    } else {
      setIsLoadingVideos(false)
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

  // every -> all elements are true
  const selectStatesLoaded =
    videoTypesSelectState.isLoadedFromSave &&
    sortTypesSelectState.isLoadedFromSave &&
    genreSelectState.isLoadedFromSave &&
    watchProviderSelectState.isLoadedFromSave &&
    regionSelectState.isLoadedFromSave

  const pageState = useMemo(() => {
    if (!selectStatesLoaded) return PageState.NOT_LOADED

    if (searchText) return PageState.SEARCH

    return _.isEmpty(genreSelectState.selectedOptions) ? PageState.HOME : PageState.INFINITE
  }, [selectStatesLoaded, genreSelectState.selectedOptions, searchText])

  useEffect(() => {
    // scroll to top
    window.scrollTo({
      top: 0,
    })

    if (page === 1) {
      loadVideos()
    } else {
      setPage(1)
    }
  }, [
    pageState,
    homepageVideosState,
    selectStatesLoaded,
    videoTypesSelectState.selectedOptions,
    sortTypesSelectState.selectedOptions,
    genreSelectState.selectedOptions,
    watchProviderSelectState.selectedOptions,
    regionSelectState.selectedOptions,
    genreSeparationType,
    typesSeparationType,
    regionSeparationType,
  ])

  const shouldHideOverflow = showSelectedVideo || showMobileFilterOptions

  useEffect(() => {
    if (shouldHideOverflow) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [shouldHideOverflow])

  useEffect(() => {
    loadVideos()
  }, [page])

  const getNextPage = useCallback(() => {
    if (isLoadingVideos || pageState === PageState.HOME || pageState === PageState.NOT_LOADED) {
      return
    }

    setPage(page + 1)
  }, [page, isLoadingVideos, pageState])

  useEffect(() => {
    const { videoId } = router.query

    if (!videoId) {
      setShowSelectedVideo(false)
      setSelectedVideo(null)
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
      return windowWidth
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

  // todo toggle watch provider based on regions (or make it the default option?)

  const handleKeyDown = event => {
    if (event.keyCode === 13) {
      event.preventDefault()
      setSearchText(event.target.value)
    }
  }

  const rightNavButton = (
    <div className="flex h-full cursor-pointer items-center text-white">
      {/* close icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="group-hover:text-reelist-red h-8 pl-2 transition-colors duration-200"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  )

  const selectedItems = [
    videoTypesSelectState,
    regionSelectState,
    genreSelectState,
    watchProviderSelectState,
  ].flatMap(selectState =>
    _.map(selectState.selectedOptions, (name, id) => ({ name, id, selectState })),
  )

  const shouldShowFooter =
    pageState === PageState.HOME && homepageVideosState === HomePageVideosState.LOADED

  return (
    <div
      suppressHydrationWarning
      className="bg-reelist-gradient-green flex min-h-screen w-screen flex-col "
    >
      <Head>
        <title>Discover</title>
      </Head>

      <NavBar
        path="/discover"
        logo={logo}
        rightButton={showMobileFilterOptions && rightNavButton}
        onRightButtonPressed={() => setShowMobileFilterOptions(false)}
      />

      <div
        className="discover-md:mt-[20px] flex h-full flex-col self-center px-[20px]"
        style={{ width }}
      >
        <InfiniteScroll
          onRefresh={getNextPage}
          isInfinite={pageState === PageState.SEARCH || pageState === PageState.INFINITE}
        >
          <div className="discover-md:hidden my-4 text-center text-2xl font-semibold text-gray-300">
            Discover
          </div>
          <div className="flex h-12 flex-row gap-2">
            <div className=" discover-md:border-b-0  border-reelist-red discover-md:mb-0 mb-2 flex h-12 w-full flex-row items-baseline border-0 border-b border-solid ">
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
                      stroke="currentColor"
                      className="h-5 justify-self-center stroke-2 pl-4 text-center align-baseline font-semibold"
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

            <div
              className="discover-md:hidden flex h-12 cursor-pointer items-baseline justify-center align-middle"
              onClick={() => setShowMobileFilterOptions(true)}
            >
              {/* filter icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-full w-6 text-gray-300"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
                />
              </svg>
            </div>
          </div>
          <div className="discover-md:block mb-4 hidden w-full ">
            <div className="bg-reelist-red mb-6 mt-3 h-[1px]" />

            <div className="discover-lg:grid-cols-2 grid-rows-auto mb-1 grid grid-cols-1 gap-2 max-[673px]:flex-col">
              <div className="discover-lg:row-start-1 discover-lg:col-span-2 discover-lg:col-start-1 row-start-2 flex flex-grow gap-2 max-[673px]:flex-col">
                <ReelistSelect
                  selectState={videoTypesSelectState}
                  disabled={pageState === PageState.SEARCH}
                >
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

                <ReelistSelect
                  selectState={regionSelectState}
                  disabled={pageState === PageState.SEARCH}
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
                </ReelistSelect>

                <ReelistSelect
                  selectState={genreSelectState}
                  disabled={pageState === PageState.SEARCH}
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
                </ReelistSelect>

                <ReelistSelect
                  selectState={watchProviderSelectState}
                  disabled={pageState === PageState.SEARCH}
                />
              </div>

              <div className="discover-md:justify-self-end discover-lg:col-start-2 row-start-1 justify-self-center">
                <ReelistSelect
                  selectState={sortTypesSelectState}
                  disabled={pageState === PageState.SEARCH}
                />
              </div>
            </div>

            <div className="flex flex-row flex-wrap gap-x-2">
              {_.map(selectedItems, ({ name, id, selectState }) => (
                <PillButton
                  className={
                    searchText
                      ? ' pointer-events-none mt-4 border-gray-500 text-gray-500 opacity-40'
                      : ' border-reelist-red mt-4 text-white'
                  }
                  onClick={() => selectState.removeOption(id)}
                  key={id}
                  rightIcon={<CloseIcon />}
                  label={name}
                />
              ))}
            </div>
          </div>

          {pageState === PageState.HOME ? (
            _.keys(popularGenereTitleByName).map(name => (
              <VideoGroup
                title={popularGenereTitleByName[name]}
                videos={homepageSections[name]}
                numItemsPerRow={numItemsPerRow}
                onViewMoreClicked={() =>
                  genreSelectState.setSelectedOptions(popularGeneresIdsByName[name])
                }
                isLoading={homepageVideosState === HomePageVideosState.LOADING}
                clippedOverride
              />
            ))
          ) : (
            <VideoGroup
              videos={videos}
              numItemsPerRow={numItemsPerRow}
              isLoading={isLoadingVideos}
            />
          )}

          {shouldShowFooter && <Footer />}
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

        {/* mobile filter options dialog sdaffa */}
        <Drawer
          open={showMobileFilterOptions}
          onClose={() => setShowMobileFilterOptions(false)}
          anchor="right"
          PaperProps={{
            style: {
              background:
                'radial-gradient(50% 50% at 50% 50%, rgba(21, 30, 1, 0.25) 0%, rgba(0, 0, 0, 0.45) 100%)',
              backdropFilter: 'blur(15px)',
              position: 'relative',
              overflowY: 'hidden',
              overflowX: 'clip',
              cursor: 'default',
            },
          }}
          classes={{ paper: 'm-1 relative p-2 w-full h-full' }}
          className="bg-reelist-dark cursor-pointer backdrop-blur-md"
          transitionDuration={{ exit: 50 }}
        >
          <Toolbar />

          <ReelistAccordion>
            <div className="discover-md:hidden my-4 text-center text-2xl font-semibold text-gray-300">
              Filters
            </div>

            <div className="left-0 right-0 top-0 bg-black">
              <input
                className="focus:shadow-outline border-reelist-red mb-4 w-full appearance-none border-0 border-b bg-transparent py-2 text-lg leading-tight text-gray-300 shadow outline-none"
                type="text"
                autoComplete="off"
                placeholder="Search Filter"
                onChange={e => setMobileFilterText(e.target.value)}
              />
            </div>

            <ReelistAccordionSection
              filterText={mobileFilterText}
              label={selectedItems.length + ' Selected'}
              index={0}
              totalCount={6}
            >
              <div className="relative flex flex-row flex-wrap gap-x-3 gap-y-3 overflow-y-scroll">
                {_.map(
                  selectedItems,
                  ({ name, id, selectState }) =>
                    name.toLowerCase().includes(mobileFilterText.toLowerCase()) && (
                      <PillButton
                        className="border-reelist-red p-3 text-white"
                        onClick={() => selectState.removeOption(id)}
                        key={id}
                        label={name}
                        rightIcon={<CloseIcon />}
                      />
                    ),
                )}
              </div>
            </ReelistAccordionSection>

            <ReelistAccordionSection
              selectState={sortTypesSelectState}
              filterText={mobileFilterText}
              index={1}
              totalCount={6}
            />

            <ReelistAccordionSection
              selectState={videoTypesSelectState}
              filterText={mobileFilterText}
              index={2}
              totalCount={6}
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
              filterText={mobileFilterText}
              index={3}
              totalCount={6}
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
              filterText={mobileFilterText}
              index={4}
              totalCount={6}
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
              filterText={mobileFilterText}
              index={5}
              totalCount={6}
            />
          </ReelistAccordion>
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

// todo; fill in the region when asking for the providers; or sort by selected region code using the (unused) displayPriorities field
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

// hard coded popular generes
const popularGeneresIdsByName = {
  base: [],
  comedy: ['shared:35'],
  actionAndAdventure: ['tv:10759', 'movie:28', 'movie:12'],
  drama: ['shared:18'],
  horror: ['shared:27'],
  scifi: ['tv:11', 'movie:878'],
}

const popularGenereTitleByName = {
  base: '',
  comedy: 'Comedy',
  actionAndAdventure: 'Action and Adventure',
  drama: 'Drama',
  horror: 'Horror',
  scifi: 'Sci-fi',
}

export default Discover
