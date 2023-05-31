import { observer } from 'mobx-react-lite'
import { useRouter } from 'next/router'

import { Backdrop, Dialog } from '@mui/material'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { RadioGroup, FormControlLabel, Radio } from '@mui/material'
import _ from 'lodash'
import { useStore } from '@reelist/utils/hooks/useStore'
import useLocalStorageState from '@reelist/utils/hooks/useLocalStorageState'
import useVideoDiscover from '@reelist/utils/hooks/useVideoDiscover'
import useVideoSearch from '@reelist/utils/hooks/useVideoSearch'
import { callTmdb } from '@reelist/apis/api'
import Video from '@reelist/models/Video'
import {
  Box,
  FlatList,
  Flex,
  Pressable,
  Slide,
  View,
  useSafeArea,
  Text,
  Center,
  Row,
  PresenceTransition,
  Button,
  Checkbox,
  Input,
  SearchIcon,
  Divider,
  Icon,
  CloseIcon,
  ITextProps,
  Modal,
  ScrollView,
  useBreakpointValue,
} from 'native-base'
import { AspectRatio, IAspectRatioProps, IImageProps, Image } from 'native-base'
import ReelistSelect, { useSelectState } from '@reelist/components/ReelistSelect'
import ActionButton from '@reelist/components/ActionButton'
import { IViewProps } from 'native-base/lib/typescript/components/basic/View/types'
import PillButton from '@reelist/components/PillButton'

const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500'

const REMOVE_ICON = (
  <View alignSelf="center" style={{ height: '100%' }}>
    <CloseIcon color="black" size="xs" />
  </View>
)

const useWindowWidth = () => {
  const [width, setWidth] = useState(window.innerWidth)
  const handleResize = () => setWidth(window.innerWidth)

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
    'includes_every',
  )
  const [typesSeparationType, setTypesSeparationType] = useLocalStorageState(
    'typesSeparationType',
    'includes_every',
  )

  const pageRef = useRef(1)
  const [videos, setVideos] = useState<Video[]>([])

  const handleVideos = (nextVideos: Video[]) => {
    const filteredVideos = _.chain(nextVideos)
      .filter(video => !!(video.posterPath && video.backdropPath))
      .compact()
      .value()

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
    const selectedSortType = videoTypesSelectState.selectedOptions[0]
    const selectedRegions = regionSelectState.selectedOptions
    const selectedTvGenres = tvGenreSelectState.selectedOptions
    const selectedTvProviders = tvProviderSelectState.selectedOptions

    videoDiscover({
      with_type: selectedVideoTypes.join(typesSeparationType === 'includes_any' ? ',' : '|'),
      page: pageRef.current.toString(),
      sort_by: selectedSortType,
      watch_region: selectedRegions.join(','),
      with_genres: selectedTvGenres.join(typesSeparationType === 'includes_any' ? ',' : '|'),
      with_providers: selectedTvProviders.join(','),
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
  }, [
    videoTypesSelectState.selectedOptions,
    sortTypesSelectState.selectedOptions,
    tvGenreSelectState.selectedOptions,
    tvGenreSelectState.selectedOptions,
    tvProviderSelectState.selectedOptions,
    regionSelectState.selectedOptions,
    tvGenreSeparationType,
    typesSeparationType,
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
    lg: 54,
  })

  //   function calculateContainerWidthOld(itemCount: number): number {
  //     const totalItemsWidth = itemCount * itemWidth
  //     const totalSpacingWidth = (itemCount - 1) * spacing
  //     const totalWidth = totalItemsWidth + totalSpacingWidth + containerPadding * 2
  //     const maxWidth = window.innerWidth - 40 // maximum width minus 20 pixels for safety

  //     return totalWidth <= maxWidth ? totalWidth : maxWidth
  //   }

  function calculateContainerWidth(possibleWidth: number) {
    const itemWidth = 307 // width of each item in pixels
    const spacing = 20 // spacing between items in pixels

    const numItemsPerRow = Math.floor((possibleWidth + spacing) / (itemWidth + spacing))
    debugger
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

  return (
    <div
      suppressHydrationWarning
      style={{
        height: '100vh',
        width: '100vw',
        background: 'radial-gradient(50% 50% at 50% 50%, #1A200F 0%, #131313 100%)',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Flex
        height="100vh"
        maxHeight="100vh"
        marginX={`${containerPadding}px`}
        paddingTop="20px"
        width={width}
        maxWidth="1619px"
        alignSelf="center"
      >
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

        <Flex
          flexWrap="wrap-reverse"
          marginBottom="10px"
          space="10px"
          justifyContent="space-between"
          flexDirection={['column-reverse', 'column-reverse', 'row']}
        >
          <Row space="10px" flexWrap="wrap">
            <ReelistSelect selectState={videoTypesSelectState}>
              <RadioGroup
                name="types-radio"
                value={typesSeparationType}
                onChange={e => setTypesSeparationType(e.target.value)}
                row
              >
                <FormControlLabel
                  value="includes_every"
                  control={<Radio />}
                  label="Types Include Every"
                />

                <FormControlLabel
                  value="includes_any"
                  control={<Radio />}
                  label="Types Include Any"
                />
              </RadioGroup>
            </ReelistSelect>

            <ReelistSelect selectState={regionSelectState} />

            <ReelistSelect selectState={tvGenreSelectState}>
              <RadioGroup
                name="types-radio"
                value={tvGenreSeparationType}
                onChange={e => setTvGenreSeparationType(e.target.value)}
                row
              >
                <FormControlLabel
                  value="includes_every"
                  control={<Checkbox color="white" _text={{ color: 'white' }} />}
                  label="Genres Must Have All of selected"
                  color="white"
                />

                {/* <FormControlLabel
                value="includes_any"
                control={<Radio />}
                label="Genres Can Have any of selected"
              /> */}
              </RadioGroup>
            </ReelistSelect>

            <ReelistSelect selectState={tvProviderSelectState} />
          </Row>

          <ReelistSelect selectState={sortTypesSelectState} alignSelf="flex-end" />
        </Flex>

        <Box flex={1}>
          <FlatList
            contentContainerStyle={{
              display: 'flex',
              flexWrap: 'wrap',
              flexDirection: 'row',
              marginBottom: '15px',
              rowGap: 50,
              columnGap: 20,
              justifyContent: 'center',
              width
            }}
            data={videos}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: video }) => (
              <VideoImage
                video={video}
                containerProps={{ width: '307px' }}
                onPress={() => handleVideoSelection(video)}
              />
            )}
            keyExtractor={video => video.videoId}
            extraData={videos}
            onEndReached={getNextPage}
            onEndReachedThreshold={0.5}
          />

          {/* <FlatList
            contentContainerStyle={{
              display: 'flex',
              flexWrap: 'wrap',
              flexDirection: 'row',
              marginBottom: '15px',
              rowGap: 50,
              columnGap: 21,
            }}
            data={_.times(100)}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: number }) => (
              <Button backgroundColor="reelist.600" margin="5px">
                {number}
              </Button>
            )}
            extraData={videos}
            onEndReached={getNextPage}
            onEndReachedThreshold={0.5}
          /> */}
        </Box>

        <Dialog
          open={showSelectedVideo}
          onClose={closeVideo}
          hideBackdrop
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.49)',
            backdropFilter: 'blur(15px)',
            // cursor: 'pointer',
          }}
          PaperProps={{
            style: {
              background:
                'radial-gradient(50% 50% at 50% 50%, rgba(21, 30, 1, 0.25) 0%, rgba(0, 0, 0, 0.45) 100%)',
              backdropFilter: 'blur(15px)',
              maxWidth: '100vw',
              position: 'relative',
              padding: '38px',
              paddingRight: '60px',
              overflowY: 'scroll',
              overflowX: 'clip',
            },
          }}
          transitionDuration={{ exit: 50 }}
        >
          {selectedVideo && (
            <VideoSection
              video={selectedVideo}
              selectedRegions={regionSelectState.selectedOptions}
            />
          )}
        </Dialog>
      </Flex>
    </div>
  )
})

// export default Discover

const VideoSection = observer(
  ({ video, selectedRegions }: { video: Video; selectedRegions: string[] }) => {
    useEffect(() => {
      video.fetchWatchProviders()
    }, [])

    const providers = useMemo(() => {
      return _.chain(selectedRegions)
        .flatMap(region => video.providers[region]?.flatrate)
        .compact()
        .uniqBy('providerId')
        .value()
    }, [video.providers])

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          maxWidth: '100%',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <VideoImage
          video={video}
          marginRight="50px"
          containerProps={{ alignSelf: 'center' }}
          isPoster
        />

        <Flex width={['300px', '440px', '600px']} height="609px" maxHeight="609px">
          <Text fontSize="48px" numberOfLines={2} adjustsFontSizeToFit>
            {video.videoName}
          </Text>

          <Text>
            {_.map(video.genres, 'name').join('/')} ‧ {video.durationOrSeasons}
          </Text>

          <Divider backgroundColor="reelist.500" marginBottom="35px" marginTop="28px" />

          <Text flexWrap="wrap">{video.overview}</Text>

          <Text>{selectedRegions.join(', ')}</Text>

          <View alignSelf="bottom">
            <Text fontSize="24px" paddingY="35px">
              {providers.length === 0 ? 'Not available in provided regions' : 'Available on'}
            </Text>
            <ScrollView horizontal>
              {providers.map(provider => (
                <AspectRatio width="70px">
                  <Image
                    source={{ uri: IMAGE_PATH + provider.logoPath }}
                    resizeMode="contain"
                    rounded="sm"
                    size="100%"
                  />
                </AspectRatio>
              ))}
            </ScrollView>
          </View>
        </Flex>
      </div>
    )
  },
)

type VideoImageProps = IImageProps & {
  video: Video
  containerProps?: IViewProps
  isPoster?: boolean
  onPress?: () => void
}

const videoTextProps: ITextProps = {
  paddingX: '10px',
  numberOfLines: 2,
  ellipsizeMode: 'clip',
  color: 'white',
}

const VideoImage = observer(
  ({ video, containerProps, onPress, isPoster, ...imageProps }: VideoImageProps) => {
    const [hovered, setHovered] = useState(false)
    const [pressed, setPressed] = useState(false)

    const source = isPoster ? video.posterPath : video.backdropPath

    if (!source) return null

    const imageSizeProps: IImageProps = isPoster
      ? {
          resizeMode: 'contain',
          width: '406',
          height: '609',
        }
      : {
          resizeMode: 'object-fit',
          width: '307px',
          height: '207px',
        }

    const fullImage = !onPress

    return (
      <Pressable
        onHoverIn={() => setHovered(true)}
        onPressIn={() => setPressed(true)}
        onHoverOut={() => setHovered(false)}
        onPressOut={() => setPressed(false)}
        isPressed={pressed}
        onLongPress={() => console.log('long pressed: ', video.videoName)}
        onPress={onPress}
        disabled={fullImage}
        {...containerProps}
      >
        <View
          position="relative"
          style={{
            transform: [{ scale: fullImage || pressed ? 1 : hovered ? 0.99 : 0.97 }],
          }}
        >
          <Image
            source={{ uri: IMAGE_PATH + source }}
            alt={source}
            rounded="sm"
            {...imageProps}
            {...imageSizeProps}
          />
          {!isPoster && (
            <View
              position="absolute"
              bottom="0"
              width="100%"
              roundedBottom="sm"
              minHeight="85px"
              paddingTop="10px"
              style={{
                background:
                  'linear-gradient(180deg, rgba(0, 0, 0, 0.54) 0%, rgba(0, 0, 0, 0) 0.01%, rgba(0, 0, 0, 0.54) 33.85%)',
              }}
            >
              <Text {...videoTextProps} fontSize="24px">
                {video.videoName}
              </Text>

              <Text {...videoTextProps} fontSize="15px">
                {video.durationOrSeasons}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    )
  },
)

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
