import {
  tmdbDiscoverMovieFactory,
  tmdbDiscoverShowFactory,
} from '@reelist/interfaces/tmdb/__factories__/TmdbDiscoverResponseFactory'
import { TmdbVideoPartialFormatter } from '@reelist/utils/tmdbHelpers/TmdbVideoPartialFormatter'
import {
  tmdbSearchMovieFactory,
  tmdbSearchPersonFactory,
  tmdbSearchShowFactory,
  tmdbSearchVideoFactory,
} from '@reelist/interfaces/tmdb/__factories__/TmdbSearchResponseFactory'

describe('TmdbVideoPartialMapper', () => {
  describe('discover', () => {
    it('should use correct values for shows', async () => {
      const showResponse = tmdbDiscoverShowFactory.build({ id: 765 })

      const show = TmdbVideoPartialFormatter.fromTmdbShow(showResponse)

      expect(show.id).toBe(showResponse.id)
      expect(show.videoName).toBe(showResponse.name)
      expect(show.videoOriginalName).toBe(showResponse.originalName)
      expect(show.videoReleaseDate.isSame(showResponse.firstAirDate)).toBe(true)
      expect(show.videoId).toBe('tv765')
      expect(show.isTv).toBe(true)

      expect(show).toEqual(expect.objectContaining(tmdbDiscoverShowFactory.create(showResponse)))
    })

    it('should use correct values for movies', async () => {
      const movieResponse = tmdbDiscoverMovieFactory.build({ id: 567 })

      const movie = TmdbVideoPartialFormatter.fromTmdbMovie(movieResponse)

      expect(movie.id).toBe(movieResponse.id)
      expect(movie.videoName).toBe(movieResponse.title)
      expect(movie.videoOriginalName).toBe(movieResponse.originalTitle)
      expect(movie.videoReleaseDate.isSame(movieResponse.releaseDate)).toBe(true)
      expect(movie.videoId).toBe('mv567')
      expect(movie.isTv).toBe(false)

      expect(movie).toEqual(expect.objectContaining(tmdbDiscoverMovieFactory.create(movieResponse)))
    })
  })

  describe('search', () => {
    it('should use correct values for search shows', async () => {
      const showResponse = tmdbSearchShowFactory.build({ id: 765, mediaType: 'tv' })

      const show = TmdbVideoPartialFormatter.fromTmdbSearchVideo(showResponse)

      expect(show.id).toBe(showResponse.id)
      expect(show.videoName).toBe(showResponse.name)
      expect(show.videoOriginalName).toBe(showResponse.originalName)
      expect(show.videoReleaseDate.isSame(showResponse.firstAirDate)).toBe(true)
      expect(show.videoId).toBe('tv765')
      expect(show.isTv).toBe(true)

      expect(show).toEqual(expect.objectContaining(tmdbDiscoverShowFactory.create(showResponse)))
    })

    it('should use correct values for search movies', async () => {
      const movieResponse = tmdbSearchMovieFactory.build({ id: 567, mediaType: 'movie' })

      const movie = TmdbVideoPartialFormatter.fromTmdbSearchVideo(movieResponse)

      expect(movie.id).toBe(movieResponse.id)
      expect(movie.videoName).toBe(movieResponse.title)
      expect(movie.videoOriginalName).toBe(movieResponse.originalTitle)
      expect(movie.videoReleaseDate.isSame(movieResponse.releaseDate)).toBe(true)
      expect(movie.videoId).toBe('mv567')
      expect(movie.isTv).toBe(false)

      expect(movie).toEqual(expect.objectContaining(tmdbDiscoverMovieFactory.create(movieResponse)))
    })

    it('should return a list from search person', () => {
      const showResponse = tmdbSearchVideoFactory.build({ id: 765, mediaType: 'tv' })
      const movieResponse = tmdbSearchVideoFactory.build({ id: 567, mediaType: 'movie' })

      const show = TmdbVideoPartialFormatter.fromTmdbSearchVideo(showResponse)
      const movie = TmdbVideoPartialFormatter.fromTmdbSearchVideo(movieResponse)

      const person = tmdbSearchPersonFactory.build({ knownFor: [showResponse, movieResponse] })

      const [knownForShow, knownForMovie] = TmdbVideoPartialFormatter.fromTmdbSearchPerson(person)

      expect(show.videoId).toEqual(knownForShow.videoId)
      expect(movie.videoId).toEqual(knownForMovie.videoId)
    })
  })
})
