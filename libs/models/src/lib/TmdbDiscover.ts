import { makeAutoObservable } from 'mobx'
import { inject, injectable } from 'inversify'
import SelectState, { SelectOption } from '@reelist/utils/SelectState'
import getGenres, { GenreOptionType } from '@reelist/utils/tmdbHelpers/getGenres'
import getWatchProviders, {
  WatchProviderOptionType,
} from '@reelist/utils/tmdbHelpers/getWatchProviders'
import getRegions, { getDefaultRegions } from '@reelist/utils/tmdbHelpers/getRegions'
import type IStorage from '@reelist/utils/storage/storage.interface'
import { StorageInversionKey } from '@reelist/utils/storage/storage.interface'
import LocalStorageValue from '@reelist/utils/storage/LocalStorageValue'
import _ from 'lodash'
import { callTmdb } from '@reelist/apis/api'
import {
  TmdbDiscoverMovieResponseType,
  TmdbDiscoverShowResponseType,
} from '@reelist/interfaces/tmdb/TmdbDiscoverVideoResponseType'
import { TmdbVideoPartialFormatter } from '@reelist/utils/tmdbHelpers/TmdbVideoPartialFormatter'
import { TmdbVideoPartialType } from '@reelist/interfaces/tmdb/TmdbVideoPartialType'

// hard coded popular generes
const popularGeneresIdsByName = {
  base: [],
  comedy: ['shared:35'],
  actionAndAdventure: ['tv:10759', 'movie:28', 'movie:12'],
  drama: ['shared:18'],
  horror: ['shared:9648'],
  scifi: ['tv:10765', 'movie:878', 'movie:14'],
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

const getMediaTypes = async () => [
  { id: 'both', name: 'Movies & Shows' },
  { id: 'movies', name: 'Movies Only' },
  { id: 'shows', name: 'Shows Only' },
]

@injectable()
class TmdbDiscover {
  videoTypesSelectState: SelectState<SelectOption>
  genreSelectState: SelectState<GenreOptionType>
  watchProviderSelectState: SelectState<WatchProviderOptionType>
  regionSelectState: SelectState<SelectOption>
  mediaTypeSelectState: SelectState<SelectOption>
  page = 1
  homepageSections = {}

  isLoadingHomepageSections = false

  genreSeparationTypeStorage = new LocalStorageValue(
    'genreSeparationType',
    'includes_any',
    this.storage,
  )
  typesSeparationTypeStorage = new LocalStorageValue(
    'typesSeparationType',
    'includes_any',
    this.storage,
  )
  regionSeparationTypeStorage = new LocalStorageValue(
    'regionSeparationType',
    'includes_any',
    this.storage,
  )

  constructor(@inject(StorageInversionKey) private storage: IStorage) {
    this.videoTypesSelectState = new SelectState('Types', getVideoTypes)

    this.genreSelectState = new SelectState('Genres', getGenres)
    this.watchProviderSelectState = new SelectState('Watch Providers', getWatchProviders)
    this.regionSelectState = new SelectState('Regions', getRegions, getDefaultRegions)

    const getDefaultMediaTypes = () => ['both']
    const mediaTypeIsMulti = false
    this.mediaTypeSelectState = new SelectState(
      'Movies & Shows',
      getMediaTypes,
      getDefaultMediaTypes,
      mediaTypeIsMulti,
    )

    makeAutoObservable(this)
  }

  initFromStorage = async () => {
    if (this.selectStatesLoaded) return

    this.videoTypesSelectState.lazyLoadFromStorage(this.storage)
    this.genreSelectState.lazyLoadFromStorage(this.storage)
    this.watchProviderSelectState.lazyLoadFromStorage(this.storage)
    this.regionSelectState.lazyLoadFromStorage(this.storage)
    this.mediaTypeSelectState.lazyLoadFromStorage(this.storage)

    this.genreSeparationTypeStorage.load()
    this.typesSeparationTypeStorage.load()
    this.regionSeparationTypeStorage.load()
  }

  toggleRegionSeparationType = () => {
    if (this.regionSeparationType === 'includes_any') {
      this.regionSeparationTypeStorage.setValue('excludes_any')
    } else {
      this.regionSeparationTypeStorage.setValue('includes_any')
    }
  }

  toggleGenreSeparationType = () => {
    if (this.genreSeparationType === 'includes_any') {
      this.genreSeparationTypeStorage.setValue('excludes_any')
    } else {
      this.genreSeparationTypeStorage.setValue('includes_any')
    }
  }

  toggleTypesSeparationType = () => {
    if (this.typesSeparationType === 'includes_any') {
      this.typesSeparationTypeStorage.setValue('excludes_any')
    } else {
      this.typesSeparationTypeStorage.setValue('includes_any')
    }
  }

  setPage = (value: number) => {
    this.page = value
  }

  getVideos = async (selectedGenres: string[] | null) => {
    const withoutIdentifier = (item: string) => item.split(':')[1]

    const selectedVideoTypes = this.videoTypesSelectState.selectedOptions
    const selectedRegions = this.regionSelectState.selectedOptions
    const selectedWatchProviders = _.keys(this.watchProviderSelectState.selectedOptions)

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

    const genreSeparator = this.genreSeparationType === 'includes_any' ? ',' : '|'

    return await this.videoDiscover({
      with_type: _.keys(selectedVideoTypes).join(
        this.typesSeparationType === 'includes_any' ? ',' : '|',
      ),
      page: this.page.toString(),
      watch_region: _.keys(selectedRegions).join(','),
      tvGenres: sharedGenres.concat(tvGenres).map(withoutIdentifier).join(genreSeparator),
      movieGenres: sharedGenres.concat(movieGenres).map(withoutIdentifier).join(genreSeparator),
      tvProviders: sharedProviders.concat(tvProviders).map(withoutIdentifier).join(','),
      movieProviders: sharedProviders.concat(movieProviders).map(withoutIdentifier).join(','),
    })
  }

  private videoDiscover = async (params: Record<string, string>) => {
    const { tvGenres, movieGenres, tvProviders, movieProviders, ...sharedParams } = params

    const mediaType = _.keys(this.mediaTypeSelectState.selectedOptions)[0]
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

    const getDataList = <T>(data: any): T[] => {
      return _.get(data, 'value.data.data.results') || []
    }

    const searchResults = await Promise.allSettled(tmdbCalls)
      .then(([tvShows, movies]) => {
        return {
          shows: getDataList<TmdbDiscoverShowResponseType>(tvShows),
          movies: getDataList<TmdbDiscoverMovieResponseType>(movies),
        }
      })
      .then(({ shows, movies }) => {
        return [
          shows.map(TmdbVideoPartialFormatter.fromTmdbShow),
          movies.map(TmdbVideoPartialFormatter.fromTmdbMovie),
        ]
      })
      .then(all => _.zip(...all))
      .then(_.flatten)
      .then(_.compact)

    return searchResults
  }

  fetchHomepageVideos = async () => {
    this.isLoadingHomepageSections = true

    const base = await this.getVideos(null)
    const comedy = await this.getVideos(popularGeneresIdsByName.comedy)
    const actionAndAdventure = await this.getVideos(popularGeneresIdsByName.actionAndAdventure)
    const drama = await this.getVideos(popularGeneresIdsByName.drama)
    const horror = await this.getVideos(popularGeneresIdsByName.horror)
    const scifi = await this.getVideos(popularGeneresIdsByName.scifi)

    this.homepageSections = {
      base,
      comedy,
      actionAndAdventure,
      drama,
      horror,
      scifi,
    }

    this.isLoadingHomepageSections = false
  }

  clearHomepageVideos = () => {
    this.homepageSections = {}
  }

  private get genreMap() {
    const tvMap: Record<number, string> = {}
    const movieMap: Record<number, string> = {}

    this.genreSelectState.options?.forEach(({ id: genreId, originalId, originalName }) => {
      if (genreId.startsWith('shared:')) {
        tvMap[originalId] = originalName
        movieMap[originalId] = originalName
      } else if (genreId.startsWith('tv:')) {
        tvMap[originalId] = originalName
      } else if (genreId.startsWith('movie:')) {
        movieMap[originalId] = originalName
      }
    })

    return { tvMap, movieMap }
  }

  get tvGenreMap() {
    return this.genreMap.tvMap
  }

  get movieGenreMap() {
    return this.genreMap.movieMap
  }

  mapGenres(video: TmdbVideoPartialType) {
    const genreMap = video.isTv ? this.tvGenreMap : this.movieGenreMap

    return video.genreIds.map(genreId => genreMap[genreId])
  }

  get selectedItems() {
    return [
      this.videoTypesSelectState,
      this.regionSelectState,
      this.genreSelectState,
      this.watchProviderSelectState,
    ].flatMap(selectState =>
      _.map(selectState.selectedOptions, (name, id) => ({ name, id, selectState })),
    )
  }

  get selectStatesLoaded() {
    return (
      this.videoTypesSelectState.isLoadedFromSave &&
      this.mediaTypeSelectState.isLoadedFromSave &&
      this.genreSelectState.isLoadedFromSave &&
      this.watchProviderSelectState.isLoadedFromSave &&
      this.regionSelectState.isLoadedFromSave
    )
  }

  get genreSeparationType() {
    return this.genreSeparationTypeStorage.value
  }

  get typesSeparationType() {
    return this.typesSeparationTypeStorage.value
  }

  get regionSeparationType() {
    return this.regionSeparationTypeStorage.value
  }
}

export default TmdbDiscover
