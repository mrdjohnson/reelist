'use client'

import { observer } from 'mobx-react-lite'
import { useRouter } from 'next/router'

import { Dialog } from '@mui/material'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@mui/material'
import _ from 'lodash'
import { useStore } from '@reelist/utils/hooks/useStore'
import useLocalStorageState from '@reelist/utils/hooks/useLocalStorageState'
import useVideoDiscover from '@reelist/utils/hooks/useVideoDiscover'
import useVideoSearch from '@reelist/utils/hooks/useVideoSearch'
import { callTmdb } from '@reelist/apis/api'
import Video from '@reelist/models/Video'
import {
  Flex,
  View,
  useSafeArea,
  Row,
  Checkbox,
  Input,
  SearchIcon,
  Divider,
  CloseIcon,
  useBreakpointValue,
} from 'native-base'
import ReelistSelect, { useSelectState } from '@reelist/components/ReelistSelect'
import PillButton from '@reelist/components/PillButton'

// import 'tailwindcss/tailwind.css'
import NavBar from '~/components/NavBar'
import InfiniteScroll from './InfiniteScroll'
import VideoModal from './video/VideoModal'
import VideoImage from './video/VideoImage'

const REMOVE_ICON = (
  <View alignSelf="center" style={{ height: '100%' }}>
    <CloseIcon color="black" size="xs" />
  </View>
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

  const [tvGenreSeparationType, setTvGenreSeparationType] = useLocalStorageState(
    'tvGenreSeparationType',
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

  const pageRef = useRef(1)
  const [videos, setVideos] = useState<Video[]>([])

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
    const filteredVideos = _.chain(nextVideos).filter(videoFilter).compact().value()

    if (pageRef.current === 1) {
      console.log('making new videos')
      setVideos(filteredVideos)
    } else {
      console.log('adding to current videos')

      setVideos(videos.concat(filteredVideos))
    }
  }

  const discover = () => {
    const selectedVideoTypes = videoTypesSelectState.selectedOptions
    const selectedSortType = _.keys(sortTypesSelectState.selectedOptions)[0]
    const selectedRegions = regionSelectState.selectedOptions
    const selectedTvGenres = tvGenreSelectState.selectedOptions
    const selectedTvProviders = tvProviderSelectState.selectedOptions

    videoDiscover({
      with_type: _.keys(selectedVideoTypes).join(
        typesSeparationType === 'includes_any' ? ',' : '|',
      ),
      page: pageRef.current.toString(),
      sort_by: selectedSortType,
      watch_region: _.keys(selectedRegions).join(','),
      with_genres: _.keys(selectedTvGenres).join(
        typesSeparationType === 'includes_any' ? ',' : '|',
      ),
      with_providers: _.keys(selectedTvProviders).join(','),
    })
      .then(handleVideos)
      .catch(e => {})
  }

  const search = () => {
    videoSearch(searchText, { page: pageRef.current.toString() })
      .then(handleVideos)
      .catch(e => {})
  }

  const loadVideos = () => {
    const page = pageRef.current

    if (page > 10) {
      return
    }

    if (searchText) {
      search()
    } else {
      discover()
    }
  }

  const videoTypesSelectState = useSelectState('Types', getVideoTypes)
  const tvGenreSelectState = useSelectState('Tv Genres', getTvGenres)
  const tvProviderSelectState = useSelectState('Tv Providers', getTvProviders)
  const regionSelectState = useSelectState('Regions', getRegions, {
    getAlternativeDefaults: getDefaultRegions,
  })
  const sortTypesSelectState = useSelectState('Sort By', getSortTypes, {
    isMulti: false,
    getAlternativeDefaults: () => ['popularity.desc'],
  })

  useEffect(() => {
    pageRef.current = 1

    loadVideos()
  }, [
    videoTypesSelectState.selectedOptions,
    sortTypesSelectState.selectedOptions,
    tvGenreSelectState.selectedOptions,
    tvProviderSelectState.selectedOptions,
    regionSelectState.selectedOptions,
    tvGenreSeparationType,
    typesSeparationType,
    regionSeparationType,
  ])

  const getNextPage = () => {
    pageRef.current += 1

    loadVideos()
  }

  useEffect(() => {
    const { videoId } = router.query

    if (!videoId) {
      setShowSelectedVideo(false)
    } else if (!_.isArray(videoId)) {
      videoStore.getVideo(videoId).then(setSelectedVideo)
      setShowSelectedVideo(true)
    }
  }, [router.query])

  useEffect(() => {
    if (!searchText) {
      pageRef.current = 1
    }

    loadVideos()
  }, [searchText])

  const safeAreaProps = useSafeArea({
    safeAreaTop: true,
  })

  const handleVideoSelection = (video: Video) => {
    router.push(`/discover?videoId=${video.videoId}`)
  }

  const closeVideo = () => {
    router.replace('/discover')
  }

  const containerPadding = useBreakpointValue({
    base: 20,
    xl: 54,
  })

  const calculateContainerWidth = (possibleWidth: number) => {
    const itemWidth = 307 // width of each item in pixels
    const spacing = 20 // spacing between items in pixels

    const numItemsPerRow = Math.floor((possibleWidth + spacing) / (itemWidth + spacing))
    const containerWidth = numItemsPerRow * itemWidth + (numItemsPerRow - 1) * spacing
    return 1 + containerWidth > possibleWidth ? possibleWidth : containerWidth
  }

  const width = useMemo(() => {
    // const totalPadddingX = 40
    // const videoImageWidth = 327

    // let resultWidth = Math.floor((windowWidth - totalPadddingX) / videoImageWidth)

    const totalContainerPadding = containerPadding * 2
    return calculateContainerWidth(Math.min(windowWidth, 1619) - totalContainerPadding)
  }, [windowWidth])

  const toggleRegionSeparationType = () => {
    setRegionSeparationType(
      regionSeparationType === 'includes_every' ? 'includes_any' : 'includes_every',
    )
  }

  const toggleTvGenreSeparationType = () => {
    setTvGenreSeparationType(
      tvGenreSeparationType === 'includes_every' ? 'includes_any' : 'includes_every',
    )
  }

  const Header = () => (
    <div className="w-full">
      <Row>
        <SearchIcon size="md" alignSelf="center" paddingRight="12px" />

        {searchText ? (
          <PillButton
            label={searchText}
            height="35px"
            endIcon={REMOVE_ICON}
            variant="solid"
            onPress={() => setSearchText('')}
            borderWidth="0"
          />
        ) : (
          <Input
            placeholder="Search"
            variant="unstyled"
            fontSize="24px"
            height="35px"
            padding="0px"
            onSubmitEditing={e => setSearchText(e.target.value)}
          />
        )}
      </Row>

      <Divider backgroundColor="reelist.500" marginBottom="20px" marginTop="14px" />

      <div className="grid max-[673px]:flex-col max-[1000px]:grid-rows-1">
        <div className="flex row-start-1 max-[1000px]:row-start-2 max-[673px]:flex-col gap-2">
          <ReelistSelect selectState={videoTypesSelectState}>
            <div
              className="flex justify-center cursor-pointer"
              onClick={() =>
                setTypesSeparationType(
                  typesSeparationType === 'includes_every' ? 'includes_any' : 'includes_every',
                )
              }
            >
              <Checkbox
                value="includes_every"
                isChecked={typesSeparationType === 'includes_every'}
              />

              <div className="text-white ml-2">Types Must Include</div>
            </div>
          </ReelistSelect>

          <ReelistSelect selectState={regionSelectState}>
            <div
              className="flex justify-center cursor-pointer"
              onClick={toggleRegionSeparationType}
            >
              <Checkbox
                value="includes_every"
                isChecked={regionSeparationType === 'includes_every'}
              />

              <div className="text-white ml-2">Regions Must Include</div>
            </div>
          </ReelistSelect>

          <ReelistSelect selectState={tvGenreSelectState}>
            <div
              className="flex justify-center cursor-pointer"
              onClick={toggleTvGenreSeparationType}
            >
              <Checkbox
                value="includes_every"
                isChecked={tvGenreSeparationType === 'includes_every'}
              />

              <div className="text-white ml-2">Genres Must Include</div>
            </div>
          </ReelistSelect>

          <ReelistSelect selectState={tvProviderSelectState} />
        </div>

        <div className="max-[673px]:flex row-start-1 justify-center">
          <ReelistSelect
            selectState={sortTypesSelectState}
            alignSelf="flex-end"
            alignItems="end"
            justifyContent="end"
            flex={1}
          />
        </div>
      </div>

      <div className="hidden flex-row min-[673px]:flex gap-2">
        {[
          videoTypesSelectState,
          regionSelectState,
          tvGenreSelectState,
          tvProviderSelectState,
        ].flatMap(selectState =>
          _.map(selectState.selectedOptions, (name, id) => (
            <Button
              className="border border-solid border-red-400 text-white px-3 rounded-full mt-4"
              onClick={() => selectState.removeOption(id)}
              key={id}
            >
              {name}

              <CloseOutlinedIcon className="text-white text-[17px] pl-2" />
            </Button>
          )),
        )}
      </div>
    </div>
  )

  return (
    <div
      suppressHydrationWarning
      style={{
        minHeight: '100vh',
        height: 'fit-content',
        width: '100vw',
        background: 'radial-gradient(50% 50% at 50% 50%, #1A200F 0%, #131313 100%)',
        display: 'flex',
        justifyContent: 'center',
        // overflowY: 'scroll',
      }}
    >
      <Flex
        minHeight="100vh"
        marginX={`${containerPadding}px`}
        paddingTop="20px"
        width={width}
        maxWidth="1619px"
        alignSelf="center"
      >
        <NavBar path="/discover" />

        <InfiniteScroll onRefresh={getNextPage}>
          <Header />

          <div className="flex flex-wrap flex-row my-4 gap-y-5 lg:gap-y-12 gap-x-5 justify-center w-full">
            {videos.map(video => (
              <VideoImage
                video={video}
                containerProps={{ width: '307px' }}
                onPress={() => handleVideoSelection(video)}
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
          <div className="absolute top-2 right-3">
            <CloseOutlinedIcon
              className="cursor-pointer"
              sx={{ color: 'rgb(254, 83, 101)', fontSize: '35px' }}
              onClick={closeVideo}
            />
          </div>
          {selectedVideo && (
            <VideoModal
              video={selectedVideo}
              selectedRegions={_.keys(regionSelectState.selectedOptions)}
            />
          )}
        </Dialog>
      </Flex>
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

const getTvGenres = () => {
  return callTmdb('/genre/tv/list')
    .then(
      item =>
        _.get(item, 'data.data.genres') as Array<{
          id: string
          name: string
        }>,
    )
    .then(_.toArray)
}

// initial options: navigator.languages.filter(language => language.includes('-')).map(language => language.match(/-(.*)/)[1])
const getTvProviders = () => {
  return callTmdb('/watch/providers/tv')
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
    .then(items => items.map(item => ({ id: item.providerId, name: item.providerName })))
}

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
