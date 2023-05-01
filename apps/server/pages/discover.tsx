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
} from 'native-base'
import { AspectRatio, IAspectRatioProps, IImageProps, Image } from 'native-base'
import ReelistSelect, { useSelectState } from '@reelist/components/ReelistSelect'
import ActionButton from '@reelist/components/ActionButton'

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
      .then(nextVideos => {
        if (page === 1) {
          console.log('making new videos')
          setVideos(nextVideos)
        } else {
          console.log('adding to current videos')

          setVideos(videos.concat(nextVideos))
        }
      })
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
    <div suppressHydrationWarning style={{ display: 'contents' }}>
      <Flex height="100vh" maxHeight="100vh" padding="10px" maxWidth="1536px" alignSelf="center">
        <Flex flexDir="row" flexWrap="wrap" justifyContent="center" marginBottom="10px">
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

          <ReelistSelect selectState={sortTypesSelectState} />

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
                control={<Radio />}
                label="Genres Include Every"
              />

              <FormControlLabel
                value="includes_any"
                control={<Radio />}
                label="Genres Include Any"
              />
            </RadioGroup>
          </ReelistSelect>

          <ReelistSelect selectState={tvProviderSelectState} />
        </Flex>

        <ActionButton onPress={search} marginY="10px" width="100%">
          Search
        </ActionButton>

        <Box flex={1}>
          <FlatList
            contentContainerStyle={{
              display: 'flex',
              flexWrap: 'wrap',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
            data={videos}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: video }) => (
              <VideoImage
                video={video}
                key={video.id}
                marginBottom="15px"
                containerProps={{ width: '350px' }}
                isSmallImage={true}
                onPress={() => handleVideoSelection(video)}
              />
            )}
            extraData={videos}
            keyExtractor={video => video.id}
            onEndReached={getNextPage}
            onEndReachedThreshold={0.5}
          />
        </Box>

        <Slide in={showSelectedVideo} placement="right" display="flex" width="100vw" height="100vh">
          <Pressable
            flex={1}
            backgroundColor="black:alpha.40"
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
        <VideoImage video={video} padding="15px" containerProps={{ width: '350px' }} isSmallImage />

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
  containerProps?: IAspectRatioProps
  isSmallImage?: boolean
  onPress?: () => void
}

const VideoImage = observer(
  ({ video, containerProps, onPress, isSmallImage, ...imageProps }: VideoImageProps) => {
    const [hovered, setHovered] = useState(false)
    const [pressed, setPressed] = useState(false)

    const { source, ratio } = useMemo(() => {
      if (isSmallImage) {
        return { source: video.backdropPath, ratio: 16 / 9 }
      }

      return { source: video.posterPath, ratio: 2 / 3 }
    }, [video.backdropPath, video.posterPath, isSmallImage])

    if (!source) return null

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
          <AspectRatio ratio={ratio} {...containerProps}>
            <View>
              <Image
                source={{ uri: IMAGE_PATH + source }}
                alt={source}
                resizeMode="contain"
                rounded="sm"
                size="100%"
                {...imageProps}
              />
            </View>
          </AspectRatio>

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
  return navigator.languages // options look like: en-US, en
    .filter(language => language.includes('-')) // only grab 'en-US' like options
    .map(language => language.match(/-(.*)/)[1]) // only grab 'US' from each option
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
