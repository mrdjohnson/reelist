import {
  tmdbSearchPersonResultFactory,
  tmdbSearchVideoResultFactory,
} from '@reelist/models/tmdb/factories/TmdbSearchVideoFactory'
import { createTmdbSearchVideosResultsFromSearchPerson } from '@reelist/models/tmdb/TmdbSearchVideo'

describe('TmdbSearchVideo', () => {
  it('should return null if media type is a person', () => {
    const showResponse = tmdbSearchVideoResultFactory.build({ mediaType: 'tv', id: 123 })
    const movieResponse = tmdbSearchVideoResultFactory.build({ mediaType: 'movie', id: 345 })

    const person = tmdbSearchPersonResultFactory.build({
      knownFor: [showResponse, movieResponse],
    })

    const [show, movie] = createTmdbSearchVideosResultsFromSearchPerson(person)

    expect(show.videoName).toBe(showResponse.title)
    expect(show.videoId).toBe('tv123')

    expect(movie.videoName).toBe(movieResponse.title)
    expect(movie.videoId).toBe('mv345')
  })

  it('should use correct values for shows', async () => {
    const id = 456
    const title = 'Example Name'
    const mediaType = 'tv'

    const show = await tmdbSearchVideoResultFactory.create({ id, title, mediaType })

    expect(show.id).toBe(id)
    expect(show.videoName).toBe(title)
    expect(show.videoId).toBe('tv456')
    expect(show.isTv).toBe(true)
  })

  it('should use correct values for movies', async () => {
    const id = 789
    const title = 'Example Title'
    const mediaType = 'movie'

    const movie = await tmdbSearchVideoResultFactory.create({ id, title, mediaType })

    expect(movie.id).toBe(id)
    expect(movie.videoName).toBe(title)
    expect(movie.videoId).toBe('mv789')
    expect(movie.isTv).toBe(false)
  })
})
