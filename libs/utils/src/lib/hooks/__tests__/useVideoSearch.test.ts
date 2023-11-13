import { renderHook } from '@testing-library/react'

import useVideoSearch from '@reelist/utils/hooks/useVideoSearch'
import {
  tmdbSearchPersonResultFactory,
  tmdbSearchVideoResultFactory,
} from '@reelist/models/tmdb/factories/TmdbSearchVideoFactory'
import { nockHelper } from '@reelist/apis/__testHelpers__/apiTestHelper'

describe('useVideoSearch', () => {
  let videoSearch: ReturnType<typeof useVideoSearch>

  beforeEach(() => {
    const { result } = renderHook(() => useVideoSearch())
    videoSearch = result.current
  })

  afterEach(() => {
    tmdbSearchVideoResultFactory.rewindSequence()
  })

  it('should return empty array if no search text', async () => {
    const videos = await videoSearch('')

    expect(videos).toEqual([])
  })

  it('should call TMDB API and map results', async () => {
    const movieResponses = tmdbSearchVideoResultFactory.buildList(2, { mediaType: 'movie' })
    const showResponses = tmdbSearchVideoResultFactory.buildList(2, { mediaType: 'tv' })

    nockHelper.get('/search/multi').reply(200, { results: movieResponses.concat(showResponses) })

    const videos = await videoSearch('any')

    expect(videos.map(video => video.videoId)).toEqual(['mv1', 'mv2', 'tv3', 'tv4'])
  })

  it('should handle person results correctly for deep search', async () => {
    const showResponse = tmdbSearchVideoResultFactory.build({ mediaType: 'tv' })
    const personMovieResponses = tmdbSearchVideoResultFactory.buildList(2, { mediaType: 'movie' })
    const personShowResponses = tmdbSearchVideoResultFactory.buildList(2, { mediaType: 'tv' })
    const movieResponse = tmdbSearchVideoResultFactory.build({ mediaType: 'movie' })

    const personResponse = tmdbSearchPersonResultFactory.build({
      knownFor: personMovieResponses.concat(personShowResponses),
    })

    nockHelper
      .get('/search/multi')
      .twice()
      .reply(200, { results: [showResponse, personResponse, movieResponse] })

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
