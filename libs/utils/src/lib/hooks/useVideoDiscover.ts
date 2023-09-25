import { useEffect, useState } from 'react'
import { callTmdb } from '@reelist/apis/api'
import _ from 'lodash'
import Video from '@reelist/models/Video'
import { useStore } from '@reelist/utils/hooks/useStore'
import useSelectState, { SelectOption } from '@reelist/utils/hooks/useSelectState'
import useLocalStorageState from '@reelist/utils/hooks/useLocalStorageState'
import getGenres from '@reelist/utils/tmdbHelpers/getGenres'
import getWatchProviders from '@reelist/utils/tmdbHelpers/getWatchProviders'
import getRegions, {getDefaultRegions} from '@reelist/utils/tmdbHelpers/getRegions'

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

const getSortTypes = async () => [
  { id: 'popularity.desc', name: 'Popularity (Desc)' },
  { id: 'popularity.asc', name: 'Popularity (Asc)' },
  { id: 'first_air_date.desc', name: 'First Air Date (Desc)' },
  { id: 'first_air_date.asc', name: 'First Air Date (Asc)' },
  { id: 'vote_average.desc', name: 'Vote Average (Desc)' },
  { id: 'vote_average.asc', name: 'Vote Average (Asc)' },
]

const useVideoDiscover = () => {
  const { videoStore } = useStore()

  const [page, setPage] = useState(1)

  const videoTypesSelectState = useSelectState('Types', getVideoTypes)
  const genreSelectState = useSelectState('Genres', getGenres)
  const watchProviderSelectState = useSelectState('Watch Providers', getWatchProviders)
  const regionSelectState = useSelectState('Regions', getRegions, {
    getAlternativeDefaults: getDefaultRegions,
  })
  const sortTypesSelectState = useSelectState('Sort By', getSortTypes, {
    isMulti: false,
    getAlternativeDefaults: () => ['popularity.desc'],
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
    sortTypesSelectState.isLoadedFromSave &&
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
      // true if selected regions include any watch provider
      return _.intersection(option.displayPriorities, regions).length > 0
    })
  }, [regionSelectState.selectedOptions])

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
    })
      .then(nextVideos => _.filter(nextVideos, videoFilter))
      .then(_.compact)
  }

  const videoDiscover = async (params: Record<string, string>) => {
    const { tvGenres, movieGenres, tvProviders, movieProviders, ...sharedParams } = params

    const tvParams = {
      ...sharedParams,
      with_genres: tvGenres,
      with_providers: tvProviders,
    }

    const movieParams = {
      ...sharedParams,
      with_genres: movieGenres,
      with_providers: movieProviders,
    }

    const searchResults = await Promise.allSettled([
      callTmdb('/discover/tv', tvParams),
      callTmdb('/discover/movie', movieParams),
    ])
      .then(([tvShows, movies]) => {
        return [
          (_.get(tvShows, 'value.data.data.results') || []) as Video[],
          (_.get(movies, 'value.data.data.results') || []) as Video[],
        ]
      })
      .then(([tvShows, movies]) => {
        return [
          ...tvShows.map(tvShow => 'tv' + tvShow.id),
          ...movies.map(tvShow => 'mv' + tvShow.id),
        ]
      })
      .then(_.compact)

    if (!searchResults) return []

    return videoStore.getVideos(searchResults)
  }

  return {
    getVideos,
    videoTypesSelectState,
    genreSelectState,
    watchProviderSelectState,
    regionSelectState,
    sortTypesSelectState,
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

export default useVideoDiscover
