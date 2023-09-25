'use client'

import { observer } from 'mobx-react-lite'
import { useRouter } from 'next/router'

import SearchIcon from '@mui/icons-material/Search'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@mui/material'
import _ from 'lodash'
import { useStore } from '@reelist/utils/hooks/useStore'
import useVideoDiscover from '@reelist/utils/hooks/useVideoDiscover'
import useVideoSearch from '@reelist/utils/hooks/useVideoSearch'
import Video from '@reelist/models/Video'
import Person from '@reelist/models/Person'
import ReelistSelect from '~/components/ReelistSelect'

import InfiniteScroll from './InfiniteScroll'
import VideoModal from './video/VideoModal'
import ReelistAccordion, { ReelistAccordionSection } from '~/components/ReelistAccordion'
import NavBar from '~/components/NavBar'
import PillButton from './PillButton'
import CloseIcon from './heroIcons/CloseIcon'
import VideoGroup from './VideoGroup'
import Footer from './Footer'
import PersonModal from './video/PersonModal'
import Popup from '~/components/Popup'
import classNames from 'classnames'

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

const Discover = observer(() => {
  const router = useRouter()

  const { videoStore, personStore } = useStore()
  const {
    getVideos,
    videoTypesSelectState,
    genreSelectState,
    watchProviderSelectState,
    regionSelectState,
    sortTypesSelectState,
    genreSeparationType,
    typesSeparationType,
    setTypesSeparationType,
    regionSeparationType,
    page,
    setPage,
    toggleRegionSeparationType,
    toggleGenreSeparationType,
    selectedItems,
    selectStatesLoaded,
  } = useVideoDiscover()
  const videoSearch = useVideoSearch()

  const windowWidth = useWindowWidth()

  const [searchText, setSearchText] = useState('')

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [showSelectedPerson, setShowSelectedPerson] = useState(false)

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [showSelectedVideo, setShowSelectedVideo] = useState(false)
  const [showMobileFilterOptions, setShowMobileFilterOptions] = useState(false)
  const [mobileFilterText, setMobileFilterText] = useState('')

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

  const handleVideos = (nextVideos: Video[]) => {
    if (page === 1) {
      console.log('making new videos')
      return nextVideos
    } else {
      console.log('adding to current videos')

      return _.uniqBy(videos.concat(nextVideos), 'videoId')
    }
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

    if(page === 1) {
      setVideos([])
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

    if (_.isEmpty(loadedVideos)) {
      setPage(page + 1)
    } else {
      setIsLoadingVideos(false)
    }
  }

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

  const shouldHideOverflow = showSelectedVideo || showMobileFilterOptions || showSelectedPerson

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
    const { videoId, personId } = router.query

    if (!videoId) {
      setShowSelectedVideo(false)
      setSelectedVideo(null)
    } else if (!_.isArray(videoId)) {
      videoStore.getVideo(videoId).then(setSelectedVideo)
      setShowSelectedVideo(true)
    }

    if (!personId) {
      setShowSelectedPerson(false)
      setSelectedPerson(null)
    } else if (!_.isArray(personId)) {
      personStore.getPerson(personId).then(setSelectedPerson)
      setShowSelectedPerson(true)
    }
  }, [router.query])

  const handleVideoSelection = (video: Video) => {
    router.push(`/discover?videoId=${video.videoId}`, undefined, { shallow: true })
  }

  const closePopup = () => {
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

  const isMobile = windowWidth < 674

  const closeNavBar = () => {
    if (showMobileFilterOptions) {
      setShowMobileFilterOptions(false)
    } else if (showSelectedPerson || showSelectedVideo) {
      closePopup()
    }
  }

  // todo toggle watch provider based on regions (or make it the default option?)

  const handleKeyDown = event => {
    if (event.keyCode === 13) {
      event.preventDefault()
      setSearchText(event.target.value)
    }
  }

  const rightNavButton = (
    <div className="flex h-full w-fit cursor-pointer items-center text-white">
      {/* close icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="group-hover:text-reelist-red h-8 transition-colors duration-200"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  )

  const shouldShowFooter =
    pageState === PageState.HOME && homepageVideosState === HomePageVideosState.LOADED

  const shouldShowCloseButton =
    isMobile && (showMobileFilterOptions || showSelectedVideo || showSelectedPerson)

  return (
    <div
      suppressHydrationWarning
      className="bg-reelist-gradient-green flex min-h-screen w-screen flex-col "
    >
      <NavBar
        path="/discover"
        rightButton={shouldShowCloseButton && rightNavButton}
        onRightButtonPressed={closeNavBar}
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
          <div className="flex h-12 flex-row gap-2 discover-md:mb-5">
            <div className=" border-reelist-red mb-2 flex h-12 w-full flex-row items-baseline border-0 border-b border-solid ">
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
                  className="focus:shadow-outline discover-md:leading-[35px] w-full appearance-none border-0 bg-transparent py-2 text-xl leading-[30px] text-gray-300 shadow outline-none"
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

          <div
            className={classNames('discover-md:block mb-4 hidden w-full ', searchText && '!hidden')}
          >
            <div className="discover-lg:grid-cols-2 grid-rows-auto mb-1 grid grid-cols-1 gap-2 max-[673px]:flex-col">
              <div className="discover-lg:row-start-1 discover-lg:col-span-2 discover-lg:col-start-1 row-start-2 flex flex-grow gap-2 max-[673px]:flex-col">
                <ReelistSelect
                  selectState={videoTypesSelectState}
                  disabled={pageState === PageState.SEARCH}
                >
                  <div
                    className="flex cursor-pointer justify-center text-xl"
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
                    className="flex cursor-pointer justify-center text-xl"
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

                  <p className="my-2 text-xl text-white">
                    {_.isEmpty(regionSelectState.selectedOptions)
                      ? `No Region filter selected, all watch providers are selectable`
                      : `${watchProviderSelectState.options?.length} Watch Providers are available based on selected Regions`}
                  </p>
                </ReelistSelect>

                <ReelistSelect
                  selectState={genreSelectState}
                  disabled={pageState === PageState.SEARCH}
                >
                  <div
                    className="flex cursor-pointer justify-center text-xl"
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
                >
                  <div className="pb-3">
                    <p className="mb-2 text-xl  text-white">
                      {_.isEmpty(regionSelectState.selectedOptions)
                        ? `No Region filter selected, displaying all ${watchProviderSelectState.options?.length} items`
                        : `${watchProviderSelectState.options?.length} Watch Providers are available based on selected Regions:`}
                    </p>

                    {_.map(regionSelectState.selectedOptions, (name, id) => (
                      <PillButton
                        onClick={() => regionSelectState.removeOption(id)}
                        key={id}
                        label={name}
                        rightIcon={<CloseIcon />}
                      />
                    ))}
                  </div>
                </ReelistSelect>
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
                  onClick={() => selectState.removeOption(id)}
                  key={id}
                  rightIcon={<CloseIcon />}
                  label={name}
                  disabled={!!searchText}
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
        <Popup isOpen={showSelectedVideo} isMobile={isMobile}>
          <div className="no-scrollbar relative overflow-scroll overscroll-none">
            {selectedVideo && (
              <VideoModal
                video={selectedVideo}
                selectedRegions={_.keys(regionSelectState.selectedOptions)}
              />
            )}
          </div>
        </Popup>

        <Popup isOpen={showSelectedPerson} isMobile={isMobile}>
          <div className="no-scrollbar relative overflow-scroll overscroll-none">
            {selectedPerson && <PersonModal person={selectedPerson} />}
          </div>
        </Popup>

        {/* mobile filter options dialog sdaffa */}
        <Popup
          isOpen={showMobileFilterOptions}
          isMobile={isMobile}
          onClose={() => setShowMobileFilterOptions(false)}
          classes={{ paper: 'relative p-2 w-full h-full' }}
        >
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
                className="flex cursor-pointer justify-center text-xl"
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
                className="flex cursor-pointer justify-center text-xl"
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

              <p className="my-2 text-xl text-white">
                {_.isEmpty(regionSelectState.selectedOptions)
                  ? `No Region filter selected, all watch providers are selectable`
                  : `${watchProviderSelectState.options?.length} Watch Providers are available based on selected Regions`}
              </p>
            </ReelistAccordionSection>

            <ReelistAccordionSection
              selectState={genreSelectState}
              filterText={mobileFilterText}
              index={4}
              totalCount={6}
            >
              <div
                className="flex cursor-pointer justify-center text-xl"
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
            >
              <div className="pb-3">
                <p className="mb-2 text-xl  text-white">
                  {_.isEmpty(regionSelectState.selectedOptions)
                    ? `No Region filter selected, displaying all ${watchProviderSelectState.options?.length} items`
                    : `${watchProviderSelectState.options?.length} Watch Providers are available based on selected Regions:`}
                </p>

                {_.map(regionSelectState.selectedOptions, (name, id) => (
                  <PillButton
                    onClick={() => regionSelectState.removeOption(id)}
                    key={id}
                    label={name}
                    rightIcon={<CloseIcon />}
                  />
                ))}
              </div>
            </ReelistAccordionSection>
          </ReelistAccordion>
        </Popup>
      </div>
    </div>
  )
})

// hard coded popular generes
const popularGeneresIdsByName = {
  base: [],
  comedy: ['shared:35'],
  actionAndAdventure: ['tv:10759', 'movie:28', 'movie:12'],
  drama: ['shared:18'],
  horror: ['shared:9648'],
  scifi: ['tv:10765', 'movie:878', 'movie:14'],
}

const popularGenereTitleByName = {
  base: '',
  comedy: 'Comedy',
  actionAndAdventure: 'Action & Adventure',
  drama: 'Drama',
  horror: 'Mystery',
  scifi: 'Sci-fi & Fantasy',
}

export default Discover
