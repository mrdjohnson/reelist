import { renderHook } from '@testing-library/react'

import {
  tmdbDiscoverMovieFactory,
  tmdbDiscoverShowFactory,
} from '@reelist/interfaces/tmdb/__factories__/TmdbDiscoverResponseFactory'

import useVideoDiscover from '@reelist/utils/hooks/useVideoDiscover'
import TmdbDiscover from '@reelist/models/TmdbDiscover'
import { mockServer } from '@reelist/apis/__testHelpers__/apiTestHelper'
import { TmdbVideoPartialType } from '@reelist/interfaces/tmdb/TmdbVideoPartialType'

describe('useVideoDiscover', () => {
  let tmdbDiscover: ReturnType<typeof useVideoDiscover>
  let getVideos: TmdbDiscover['getVideos']

  beforeEach(() => {
    const { result } = renderHook(() => useVideoDiscover())

    tmdbDiscover = result.current
    getVideos = tmdbDiscover.getVideos
  })

  afterEach(() => {
    tmdbDiscoverMovieFactory.rewindSequence()
    tmdbDiscoverShowFactory.rewindSequence()
  })

  it('should return empty array if there are no results', async () => {
    mockServer.json('https://api.themoviedb.org/3/discover/*', { results: [] })

    const videos = await getVideos([])

    expect(videos).toEqual([])
  })

  it('should return only tv shows or only movies when it can', async () => {
    let videos: TmdbVideoPartialType[]

    const showResponses = tmdbDiscoverShowFactory.buildList(2)

    mockServer.json('https://api.themoviedb.org/3/discover/tv', { results: showResponses })
    mockServer.json('https://api.themoviedb.org/3/discover/movie', { results: [] })

    videos = await getVideos([])

    expect(videos.length).toBe(2)
    expect(videos.map(video => video.mediaType)).toEqual(['tv', 'tv'])

    mockServer.reset()

    const moviesResponses = tmdbDiscoverMovieFactory.buildList(2)

    mockServer.json('https://api.themoviedb.org/3/discover/tv', { results: [] })
    mockServer.json('https://api.themoviedb.org/3/discover/movie', { results: moviesResponses })

    videos = await getVideos([])

    expect(videos.length).toBe(2)
    expect(videos.map(video => video.mediaType)).toEqual(['mv', 'mv'])
  })

  it('should not call tv shows when movies only is selected', async () => {
    tmdbDiscover.mediaTypeSelectState.setSelectedOptions(['movies'])

    const showResponses = tmdbDiscoverShowFactory.buildList(2)

    mockServer.json('https://api.themoviedb.org/3/discover/tv', { results: showResponses })
    mockServer.json('https://api.themoviedb.org/3/discover/movie', { results: [] })

    const videos = await getVideos([])

    expect(videos).toEqual([])
  })

  it('should not call movies shows when tv only is selected', async () => {
    tmdbDiscover.mediaTypeSelectState.setSelectedOptions(['shows'])

    const moviesResponses = tmdbDiscoverMovieFactory.buildList(2)

    mockServer.json('https://api.themoviedb.org/3/discover/tv', { results: [] })
    mockServer.json('https://api.themoviedb.org/3/discover/movie', { results: moviesResponses })

    const videos = await getVideos([])

    expect(videos).toEqual([])
  })

  it('should mix movies and shows', async () => {
    tmdbDiscover.mediaTypeSelectState.setSelectedOptions(['both'])

    const showResponses = tmdbDiscoverShowFactory.buildList(2)

    const moviesResponses = tmdbDiscoverMovieFactory.buildList(2)

    mockServer.json('https://api.themoviedb.org/3/discover/tv', { results: showResponses })
    mockServer.json('https://api.themoviedb.org/3/discover/movie', { results: moviesResponses })

    const videos = await getVideos([])

    expect(videos.map(video => video.mediaType)).toEqual(['tv', 'mv', 'tv', 'mv'])
  })
})
