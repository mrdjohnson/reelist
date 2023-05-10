import { observer } from 'mobx-react-lite'
import { useRouter } from 'next/router'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { RadioGroup, FormControlLabel, Radio } from '@mui/material'
import _ from 'lodash'
import { useStore } from '@reelist/utils/hooks/useStore'
import useLocalStorageState from '@reelist/utils/hooks/useLocalStorageState'
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
} from 'native-base'
import { AspectRatio, IAspectRatioProps, IImageProps, Image } from 'native-base'
import ReelistSelect, { useSelectState } from '@reelist/components/ReelistSelect'
import ActionButton from '@reelist/components/ActionButton'
import { IViewProps } from 'native-base/lib/typescript/components/basic/View/types'

const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500'

const useVideoDiscover = () => {
  const { videoStore } = useStore()

  const videoDiscover = async (params: Record<string, string>) => {
    const searchResults = await Promise.allSettled([
      callTmdb('/discover/tv', params),
      callTmdb('/discover/movie', params),
    ])
      .then(([tvShows, movies]) => {
        return [
          _.get(tvShows, 'value.data.data.results') as Video[] | null,
          _.get(movies, 'value.data.data.results') as Video[] | null,
        ]
      })
      .then(([tvShows, movies]) => {
        tvShows?.forEach(tvShow => (tvShow.mediaType = 'tv'))
        movies?.forEach(movie => (movie.mediaType = 'movie'))

        return [tvShows, movies]
      })
      .then(_.flatten)

    if (!searchResults) return []

    return searchResults.map(video => {
      return videoStore.makeUiVideo(video)
    })
  }

  return videoDiscover
}

const Discover = observer(() => {
  const router = useRouter()

  const { videoStore } = useStore()
  const videoDiscover = useVideoDiscover()

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

  const search = async () => {
    const page = pageRef.current

    if (page > 10) {
      return
    }

    const selectedVideoTypes = videoTypesSelectState.selectedOptions
    const selectedSortType = videoTypesSelectState.selectedOptions[0]
    const selectedRegions = regionSelectState.selectedOptions
    const selectedTvGenres = tvGenreSelectState.selectedOptions
    const selectedTvProviders = tvProviderSelectState.selectedOptions

    videoDiscover({
      with_type: selectedVideoTypes.join(typesSeparationType === 'includes_any' ? ',' : '|'),
      page: page.toString(),
      sort_by: selectedSortType,
      watch_region: selectedRegions.join(','),
      with_genres: selectedTvGenres.join(typesSeparationType === 'includes_any' ? ',' : '|'),
      with_providers: selectedTvProviders.join(','),
    })
      .then(videos => videos.filter(video => !!video.posterPath))
      .then(_.compact)
      .then(nextVideos => {
        if (page === 1) {
          console.log('making new videos')
          setVideos(nextVideos)
        } else {
          console.log('adding to current videos')

          setVideos(videos.concat(nextVideos))
        }
      })
      .catch(e => {})
  }

  const videoTypesSelectState = useSelectState('Types', getVideoTypes)
  const tvGenreSelectState = useSelectState('Tv Genres', getTvGenres)
  const tvProviderSelectState = useSelectState('Tv Providers', getTvProviders)
  const regionSelectState = useSelectState('Regions', getRegions)
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

    search()
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
    search()
  }, [])

  const safeAreaProps = useSafeArea({
    safeAreaTop: true,
  })

  const handleVideoSelection = (video: Video) => {
    router.push(`/discover?videoId=${video.videoId}`)
  }

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
        paddingX={['20px', '20px', '54px']}
        paddingTop="20px"
        width="min(1619px, 100vw)"
        maxWidth="min(1619px, 100vw)"
        alignSelf="center"
      >
        <Input
          placeholder="Search"
          leftElement={<SearchIcon />}
          variant="unstyled"
          fontSize="24px"
        />

        <Divider backgroundColor="reelist.500" marginBottom="20px" />

        <Flex
          flexWrap="wrap"
          marginBottom="10px"
          space="10px"
          justifyContent="space-between"
          flexDirection={['column-reverse', 'column-reverse', 'row']}
        >
          <Row space="10px">
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
            }}
            data={videos}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: video }) => (
              <VideoImage
                video={video}
                key={video.id}
                containerProps={{ width: '307px' }}
                isSmallImage={true}
                onPress={() => handleVideoSelection(video)}
              />
            )}
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

        <Slide in={showSelectedVideo} placement="right" display="flex" width="100vw" height="100vh">
          <Pressable
            flex={1}
            backgroundColor="black:alpha.40"
            style={{backdropFilter: 'blur(16px)'}}
            onPress={router.back}
            {...safeAreaProps}
          />

          <Box
            flex={1}
            padding="2"
            _text={{
              color: 'orange.600',
            }}
            bg="gray.200"
            maxWidth="400px"
            height="100%"
            position="absolute"
            right="0"
          >
            {selectedVideo && <VideoSection video={selectedVideo} />}
          </Box>
        </Slide>
      </Flex>
    </div>
  )
})

export default Discover

const VideoSection = ({ video }: { video: Video }) => {
  return (
    <>
      <Center>
        <VideoImage video={video} padding="15px" containerProps={{ width: '307px' }} isFullImage />

        <Text>{video.videoName}</Text>
      </Center>

      <Text>{_.map(video.genres, 'name').join(', ')}</Text>

      <Text paddingTop="5 px">Find on: </Text>
      <Flex flexDir="row" flexWrap="wrap" paddingLeft="7px">
        <Row space={2}>
          {video.networks.map(network => (
            <AspectRatio width="70px">
              <Image
                source={{ uri: IMAGE_PATH + network.logoPath }}
                resizeMode="contain"
                rounded="sm"
                size="100%"
              />
            </AspectRatio>
          ))}
        </Row>
      </Flex>

      <Text paddingTop="10px">{video.overview}</Text>
    </>
  )
}

type VideoImageProps = IImageProps & {
  video: Video
  containerProps?: IViewProps
  isFullImage?: boolean
  onPress?: () => void
}

const VideoImage = observer(
  ({ video, containerProps, onPress, isFullImage, ...imageProps }: VideoImageProps) => {
    const [hovered, setHovered] = useState(false)
    const [pressed, setPressed] = useState(false)

    const source = video.posterPath

    if (!source) return null

    const imageSizeProps: IImageProps = isFullImage
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

          <PresenceTransition
            visible={hovered}
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
              transition: {
                duration: 250,
                restDisplacementThreshold: 300,
              },
            }}
          >
            <View
              backgroundColor="black:alpha.40"
              position="absolute"
              bottom="0"
              width="100%"
              roundedBottom="sm"
            >
              <Text color="white" textAlign="center">
                {video.videoName}
              </Text>
            </View>
          </PresenceTransition>
        </View>
      </Pressable>
    )
  },
)

const getRegions = async () => [
  { id: '0', name: 'Documentary' },
  { id: '1', name: 'News' },
  { id: '2', name: 'Miniseries' },
  { id: '3', name: 'Reality' },
  { id: '4', name: 'Scripted' },
  { id: '5', name: 'Talk Show' },
  { id: '6', name: 'Video' },
]

const getDefaultRegions = async () => [
  { id: '0', name: 'Documentary' },
  { id: '1', name: 'News' },
  { id: '2', name: 'Miniseries' },
  { id: '3', name: 'Reality' },
  { id: '4', name: 'Scripted' },
  { id: '5', name: 'Talk Show' },
  { id: '6', name: 'Video' },
]

const getTvGenres = async () => [
  { id: '0', name: 'Documentary' },
  { id: '1', name: 'News' },
  { id: '2', name: 'Miniseries' },
  { id: '3', name: 'Reality' },
  { id: '4', name: 'Scripted' },
  { id: '5', name: 'Talk Show' },
  { id: '6', name: 'Video' },
]

// initial options: navigator.languages.filter(language => language.includes('-')).map(language => language.match(/-(.*)/)[1])
const getTvProviders = async () => [
  { id: '0', name: 'Documentary' },
  { id: '1', name: 'News' },
  { id: '2', name: 'Miniseries' },
  { id: '3', name: 'Reality' },
  { id: '4', name: 'Scripted' },
  { id: '5', name: 'Talk Show' },
  { id: '6', name: 'Video' },
]

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
