import {
  tmdbDiscoverMovieFactory,
  tmdbDiscoverShowFactory,
} from '@reelist/interfaces/tmdb/__factories__/TmdbDiscoverResponseFactory'
import { TmdbVideoPartialMapper } from '@reelist/utils/tmdbHelpers/TmdbVideoPartialMapper'
import {
  tmdbSearchPersonFactory,
  tmdbSearchVideoFactory,
} from '@reelist/interfaces/tmdb/__factories__/TmdbSearchResponseFactory'

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

  describe('search', () => {
    it('should use correct values for search shows', async () => {
      const showResponse = tmdbSearchVideoFactory.build({ id: 765, mediaType: 'tv' })

      const show = TmdbVideoPartialMapper.fromTmdbSearchVideo(showResponse)

      expect(show.id).toBe(showResponse.id)
      expect(show.videoName).toBe(showResponse.title)
      expect(show.videoOriginalName).toBe(showResponse.originalTitle)
      expect(show.videoReleaseDate).toBe(showResponse.releaseDate)
      expect(show.videoId).toBe('tv765')
      expect(show.isTv).toBe(true)

      expect(show).toEqual(expect.objectContaining(tmdbDiscoverShowFactory.create(showResponse)))
    })

    it('should use correct values for search movies', async () => {
      const movieResponse = tmdbSearchVideoFactory.build({ id: 567, mediaType: 'movie' })

      const movie = TmdbVideoPartialMapper.fromTmdbSearchVideo(movieResponse)

      expect(movie.id).toBe(movieResponse.id)
      expect(movie.videoName).toBe(movieResponse.title)
      expect(movie.videoOriginalName).toBe(movieResponse.originalTitle)
      expect(movie.videoReleaseDate).toBe(movieResponse.releaseDate)
      expect(movie.videoId).toBe('mv567')
      expect(movie.isTv).toBe(false)

      expect(movie).toEqual(expect.objectContaining(tmdbDiscoverMovieFactory.create(movieResponse)))
    })

    it('should return a list from search person', () => {
      const showResponse = tmdbSearchVideoFactory.build({ id: 765, mediaType: 'tv' })
      const movieResponse = tmdbSearchVideoFactory.build({ id: 567, mediaType: 'movie' })

      const show = TmdbVideoPartialMapper.fromTmdbSearchVideo(showResponse)
      const movie = TmdbVideoPartialMapper.fromTmdbSearchVideo(movieResponse)

      const person = tmdbSearchPersonFactory.build({ knownFor: [showResponse, movieResponse] })

      const [knownForShow, knownForMovie] = TmdbVideoPartialMapper.fromTmdbSearchPerson(person)

      expect(show).toEqual(expect.objectContaining(knownForShow))
      expect(movie).toEqual(expect.objectContaining(knownForMovie))
    })
  })
})
