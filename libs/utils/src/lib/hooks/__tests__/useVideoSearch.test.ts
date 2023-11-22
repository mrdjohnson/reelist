import { renderHook } from '@testing-library/react'

import useVideoSearch from '@reelist/utils/hooks/useVideoSearch'
import {
  tmdbSearchPersonFactory,
  tmdbSearchVideoFactory,
} from '@reelist/interfaces/tmdb/__factories__/TmdbSearchResponseFactory'
import { mockServer } from '@reelist/apis/__testHelpers__/apiTestHelper'

describe('useVideoSearch', () => {
  let videoSearch: ReturnType<typeof useVideoSearch>

  beforeEach(() => {
    const { result } = renderHook(() => useVideoSearch())
    videoSearch = result.current
  })

  afterEach(() => {
    tmdbSearchVideoFactory.rewindSequence()
    tmdbSearchPersonFactory.rewindSequence()
  })

  it('should return empty array if no search text', async () => {
    const videos = await videoSearch('')

    expect(videos).toEqual([])
  })

  it('should call TMDB API and map results', async () => {
    const movieResponses = tmdbSearchVideoFactory.buildList(2, { mediaType: 'movie' })
    const showResponses = tmdbSearchVideoFactory.buildList(2, { mediaType: 'tv' })

    mockServer.json('https://api.themoviedb.org/3/search/multi', {
      results: movieResponses.concat(showResponses),
    })

    const videos = await videoSearch('any')

    expect(videos.map(video => video.videoId)).toEqual(['mv1', 'mv2', 'tv3', 'tv4'])
  })

  it('should handle person results correctly for deep search', async () => {
    const showResponse = tmdbSearchVideoFactory.build({ mediaType: 'tv' })
    const personMovieResponses = tmdbSearchVideoFactory.buildList(2, { mediaType: 'movie' })
    const personShowResponses = tmdbSearchVideoFactory.buildList(2, { mediaType: 'tv' })
    const movieResponse = tmdbSearchVideoFactory.build({ mediaType: 'movie' })

    const personResponse = tmdbSearchPersonFactory.build({
      knownFor: personMovieResponses.concat(personShowResponses),
    })

    mockServer.json('https://api.themoviedb.org/3/search/multi*', {
      results: [showResponse, personResponse, movieResponse],
    })

    const videos = await videoSearch('any', { deepSearch: false })

    expect(videos.map(video => video.videoId)).toEqual(['tv1', 'mv6'])

    const deepSearchVideos = await videoSearch('any', { deepSearch: true })

    expect(deepSearchVideos.map(video => video.videoId)).toEqual([
      'tv1',
      'mv2',
      'mv3',
      'tv4',
      'tv5',
      'mv6',
    ])
  })
})
