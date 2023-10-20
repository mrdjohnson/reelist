import { useEffect, useState } from 'react'
import { callTmdb } from '@reelist/apis/api'
import _ from 'lodash'
import Video from '@reelist/models/Video'
import { useStore } from '@reelist/utils/hooks/useStore'
import useSelectState, { SelectOption } from '@reelist/utils/hooks/useSelectState'
import useLocalStorageState from '@reelist/utils/hooks/useLocalStorageState'
import getGenres from '@reelist/utils/tmdbHelpers/getGenres'
import getWatchProviders from '@reelist/utils/tmdbHelpers/getWatchProviders'
import getRegions, { getDefaultRegions } from '@reelist/utils/tmdbHelpers/getRegions'
import axios from 'axios'

type WatchProvider = SelectOption & {
  displayPriorities: string[]
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

const getMediaTypes = async () => [
  { id: 'both', name: 'Movies & Shows' },
  { id: 'movies', name: 'Movies Only' },
  { id: 'shows', name: 'Shows Only' },
]

const useVideoDiscover = (beta = false) => {
  const { videoStore } = useStore()

  const [page, setPage] = useState(1)

  const videoTypesSelectState = useSelectState('Types', getVideoTypes)
  const genreSelectState = useSelectState('Genres', getGenres)
  const watchProviderSelectState = useSelectState('Watch Providers', getWatchProviders)
  const regionSelectState = useSelectState('Regions', getRegions, {
    getAlternativeDefaults: getDefaultRegions,
  })
  const mediaTypeSelectState = useSelectState('Movies & Shows', getMediaTypes, {
    isMulti: false,
    getAlternativeDefaults: () => ['both'],
  })
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

  const selectStatesLoaded =
    videoTypesSelectState.isLoadedFromSave &&
    mediaTypeSelectState.isLoadedFromSave &&
    genreSelectState.isLoadedFromSave &&
    watchProviderSelectState.isLoadedFromSave &&
    regionSelectState.isLoadedFromSave

  const selectedItems = [
    videoTypesSelectState,
    regionSelectState,
    genreSelectState,
    watchProviderSelectState,
  ].flatMap(selectState =>
    _.map(selectState.selectedOptions, (name, id) => ({ name, id, selectState })),
  )

  const videoFilter = (video: Video) => {
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

  // changing a region affects which providers are available
  useEffect(() => {
    const regions = _.keys(regionSelectState.selectedOptions)

    if (_.isEmpty(regions)) {
      watchProviderSelectState.setOptionsFilter(null)
      return
    }

    watchProviderSelectState.setOptionsFilter((option: WatchProvider) => {
      if (regionSeparationType === 'includes_every') {
        return _.every(regions, region => option.displayPriorities.includes(region))
      }

      // true if selected regions include any watch provider
      return !!_.find(regions, region => option.displayPriorities.includes(region))
    })
  }, [regionSelectState.selectedOptions, regionSeparationType])

  const getVideos = async (selectedGenres: string[]) => {
    const withoutIdentifier = (item: string) => item.split(':')[1]

    const selectedVideoTypes = videoTypesSelectState.selectedOptions
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
      watch_region: _.keys(selectedRegions).join(','),
      tvGenres: sharedGenres.concat(tvGenres).map(withoutIdentifier).join(genreSeparator),
      movieGenres: sharedGenres.concat(movieGenres).map(withoutIdentifier).join(genreSeparator),
      tvProviders: sharedProviders.concat(tvProviders).map(withoutIdentifier).join(','),
      movieProviders: sharedProviders.concat(movieProviders).map(withoutIdentifier).join(','),
    })
      .then(nextVideos => _.filter(nextVideos, videoFilter))
      .then(_.compact)
  }

  let videoDiscover = async (params: Record<string, string>) => {
    const { tvGenres, movieGenres, tvProviders, movieProviders, ...sharedParams } = params

    const mediaType = _.keys(mediaTypeSelectState.selectedOptions)[0]
    const tmdbCalls: Array<null | Promise<any>> = []

    if (mediaType === 'both' || mediaType === 'shows') {
      const tvParams = {
        ...sharedParams,
        with_genres: tvGenres,
        with_providers: tvProviders,
      }

      tmdbCalls.push(callTmdb('/discover/tv', tvParams))
    } else {
      tmdbCalls.push(null)
    }

    if (mediaType === 'both' || mediaType === 'movies') {
      const movieParams = {
        ...sharedParams,
        with_genres: movieGenres,
        with_providers: movieProviders,
      }

      tmdbCalls.push(callTmdb('/discover/movie', movieParams))
    } else {
      tmdbCalls.push(null)
    }

    const searchResults = await Promise.allSettled(tmdbCalls)
      .then(([tvShows, movies]) => {
        return [
          (_.get(tvShows, 'value.data.data.results') || []) as Video[],
          (_.get(movies, 'value.data.data.results') || []) as Video[],
        ]
      })
      .then(([tvShows, movies]) => {
        return [tvShows.map(tvShow => 'tv' + tvShow.id), movies.map(tvShow => 'mv' + tvShow.id)]
      })
      .then(all => _.zip(...all))
      .then(_.flatten)
      .then(_.compact)

    if (!searchResults) return []

    return videoStore.getVideos(searchResults)
  }

  if (beta) {
    videoDiscover = async (params: Record<string, string>) => {
      const { data: results } = await axios.post<Video[]>('/api/discover', params)

      return _.map(results, video => videoStore.makeUiVideo(video))
    }
  }

  return {
    getVideos,
    videoTypesSelectState,
    genreSelectState,
    watchProviderSelectState,
    regionSelectState,
    mediaTypeSelectState,
    genreSeparationType,
    setGenreSeparationType,
    typesSeparationType,
    setTypesSeparationType,
    regionSeparationType,
    setRegionSeparationType,
    page,
    setPage,
    toggleRegionSeparationType,
    toggleGenreSeparationType,
    selectedItems,
    selectStatesLoaded,
  }
}

// hard coded popular generes
const popularGeneresIdsByName = {
  base: [],
  comedy: ['shared:35'],
  actionAndAdventure: ['tv:10759', 'movie:28', 'movie:12'],
  drama: ['shared:18'],
  horror: ['shared:9648'],
  scifi: ['tv:10765', 'movie:878', 'movie:14'],
}

export default useVideoDiscover
