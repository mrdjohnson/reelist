import {
  tmdbDiscoverMovieFactory,
  tmdbDiscoverShowFactory,
} from '@reelist/interfaces/tmdb/__factories__/TmdbDiscoverResponseFactory'
import { TmdbVideoPartialMapper } from '@reelist/utils/tmdbHelpers/TmdbVideoPartialMapper'

describe('TmdbVideoPartialMapper', () => {
  describe('discover', () => {
    it('should use correct values for shows', async () => {
      const showResponse = tmdbDiscoverShowFactory.build({ id: 765 })

      const show = TmdbVideoPartialMapper.fromTmdbDiscoverShow(showResponse)

      expect(show.id).toBe(showResponse.id)
      expect(show.videoName).toBe(showResponse.name)
      expect(show.videoOriginalName).toBe(showResponse.originalName)
      expect(show.videoReleaseDate).toBe(showResponse.firstAirDate)
      expect(show.videoId).toBe('tv765')
      expect(show.isTv).toBe(true)

      expect(show).toEqual(expect.objectContaining(tmdbDiscoverShowFactory.create(showResponse)))
    })

    it('should use correct values for movies', async () => {
      const movieResponse = tmdbDiscoverMovieFactory.build({ id: 567 })

      const movie = TmdbVideoPartialMapper.fromTmdbDiscoverMovie(movieResponse)

      expect(movie.id).toBe(movieResponse.id)
      expect(movie.videoName).toBe(movieResponse.title)
      expect(movie.videoOriginalName).toBe(movieResponse.originalTitle)
      expect(movie.videoReleaseDate).toBe(movieResponse.releaseDate)
      expect(movie.videoId).toBe('mv567')
      expect(movie.isTv).toBe(false)

      expect(movie).toEqual(expect.objectContaining(tmdbDiscoverMovieFactory.create(movieResponse)))
    })
  })
})
