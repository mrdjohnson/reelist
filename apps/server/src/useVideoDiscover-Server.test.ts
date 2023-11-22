import { renderHook } from '@testing-library/react'

import {
  tmdbSearchPersonFactory,
  tmdbSearchVideoFactory,
} from '@reelist/interfaces/tmdb/__factories__/TmdbSearchResponseFactory'
import { nockHelper } from '@reelist/apis/__testHelpers__/apiTestHelper'
import {
  tmdbDiscoverMovieFactory,
  tmdbDiscoverShowFactory,
} from '@reelist/interfaces/tmdb/__factories__/TmdbDiscoverResponseFactory'
import TmdbDiscover from '@reelist/models/TmdbDiscover'
import { TmdbVideo } from '@reelist/models/tmdb/TmdbVideo'

// import { SupabaseClient } from '@supabase/supabase-js'
// import { createClient } from '@supabase/supabase-js'
//
// import IStorage, { StorageInversionKey } from '@reelist/utils/storage/storage.interface'
// import { injectable } from 'inversify'
//
// import inversionContainer from '@reelist/models/inversionContainer'
//
// const supbaseClient = createClient('mock_url', 'mock_key')
//
// inversionContainer.bind<SupabaseClient>(SupabaseClient).toConstantValue(supbaseClient)
//
// @injectable()
// class MockStorage implements IStorage {
//   save = jest.fn().mockImplementation((key: string, value: unknown) => Promise.resolve(true))
//
//   load = jest.fn().mockImplementation(<T>(key: string) => Promise.resolve(null))
//
//   remove = jest.fn().mockImplementation((key: string) => Promise.resolve(true))
//
//   clear = jest.fn().mockImplementation(() => Promise.resolve(true))
// }
//
// inversionContainer.bind<IStorage>(StorageInversionKey).to(MockStorage).inSingletonScope()

import useVideoDiscover from '@reelist/utils/hooks/useVideoDiscover'

describe('useVideoDiscover', () => {
  let videoDiscover: ReturnType<typeof useVideoDiscover>
  let getVideos: (selectedGenres: string[]) => Promise<TmdbVideo[]>

  beforeEach(() => {
    const { result } = renderHook(() => useVideoDiscover())
    videoDiscover = result.current
    getVideos = videoDiscover.getVideos
  })

  afterEach(() => {
    tmdbDiscoverMovieFactory.rewindSequence()
    tmdbDiscoverShowFactory.rewindSequence()
  })

  it('should return empty array if ', async () => {
    const videos = await getVideos([])

    expect(videos).toEqual([])
  })

  // it('should call TMDB API and map results', async () => {
  //   const movieResponses = tmdbSearchVideoFactory.buildList(2, { mediaType: 'movie' })
  //   const showResponses = tmdbSearchVideoFactory.buildList(2, { mediaType: 'tv' })
  //
  //   nockHelper.get('/search/multi').reply(200, { results: movieResponses.concat(showResponses) })
  //
  //   const videos = await getVideos('any')
  //
  //   expect(videos.map(video => video.videoId)).toEqual(['mv1', 'mv2', 'tv3', 'tv4'])
  // })
  //
  // it('should handle person results correctly for deep search', async () => {
  //   const showResponse = tmdbSearchVideoFactory.build({ mediaType: 'tv' })
  //   const personMovieResponses = tmdbSearchVideoFactory.buildList(2, { mediaType: 'movie' })
  //   const personShowResponses = tmdbSearchVideoFactory.buildList(2, { mediaType: 'tv' })
  //   const movieResponse = tmdbSearchVideoFactory.build({ mediaType: 'movie' })
  //
  //   const personResponse = tmdbSearchPersonFactory.build({
  //     knownFor: personMovieResponses.concat(personShowResponses),
  //   })
  //
  //   nockHelper
  //     .get('/search/multi')
  //     .twice()
  //     .reply(200, { results: [showResponse, personResponse, movieResponse] })
  //
  //   const videos = await getVideos('any', { deepSearch: false })
  //
  //   expect(videos.map(video => video.videoId)).toEqual(['tv1', 'mv6'])
  //
  //   const deepSearchVideos = await getVideos('any', { deepSearch: true })
  //
  //   expect(deepSearchVideos.map(video => video.videoId)).toEqual([
  //     'tv1',
  //     'mv2',
  //     'mv3',
  //     'tv4',
  //     'tv5',
  //     'mv6',
  //   ])
  // })
})
