import { tmdbBaseVideoFactory } from '@reelist/models/tmdb/factories/TmdbBaseVideoFactory'
import { createTmdbBaseVideo } from '@reelist/models/tmdb/TmdbBaseVideo'

describe('TmdbBaseVideo', () => {
  it('should use correct header for shows', () => {
    const id = 123
    const name = 'Example Name'
    const mediaType = 'tv'

    const showResponse = tmdbBaseVideoFactory.build({ id, name, mediaType })
    const show = createTmdbBaseVideo(showResponse)

    expect(show.id).toBe(id)
    expect(show.videoName).toBe(name)
    expect(show.videoId).toBe('tv123')
    expect(show.isTv).toBe(true)
    expect(show.tmdbPath).toBe('/tv/123')
  })

  it('should use correct header for movies', () => {
    const id = 123
    const title = 'Example Title'
    const mediaType = 'mv'

    const movieResponse = tmdbBaseVideoFactory.build({ id, title, mediaType })
    const movie = createTmdbBaseVideo(movieResponse)

    expect(movie.id).toBe(id)
    expect(movie.videoName).toBe(title)
    expect(movie.videoId).toBe('mv123')
    expect(movie.isTv).toBe(false)
    expect(movie.tmdbPath).toBe('/movie/123')
  })

  it('should create shows and movies correctly', async () => {
    const shows = await tmdbBaseVideoFactory.createList(3, { mediaType: 'tv' })
    const movies = await tmdbBaseVideoFactory.createList(3, { mediaType: 'mv' })

    shows.forEach((show, index) => {
      const id = index + 1

      expect(show.isTv).toBe(true)
      expect(show.videoId).toBe('tv' + id)
    })

    movies.forEach((movie, index) => {
      const id = index + 4

      expect(movie.isTv).toBe(false)
      expect(movie.videoId).toBe('mv' + id)
    })
  })
})
