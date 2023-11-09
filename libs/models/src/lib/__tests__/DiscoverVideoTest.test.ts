import {
  createDiscoverMovie,
  createDiscoverShow,
  DiscoverVideoResponseType,
} from '@reelist/models/DiscoverVideo'
import { createFakeDiscoverVideo } from '@reelist/models/factories/DiscoverVideoFactory'

describe('DiscoverVideo', () => {
  let json: DiscoverVideoResponseType

  beforeEach(() => {
    json = createFakeDiscoverVideo()
  })

  describe('createDiscoverMovie', () => {
    it('should return a DiscoverVideo with isTv false', () => {
      const movie = createDiscoverMovie(json)

      expect(movie.isTv).toBe(false)
      expect(movie.videoId).toBe('mv' + json.id)
    })

    it('should have a videoName based on title', () => {
      delete json.name

      const movie = createDiscoverMovie(json)

      expect(movie.videoName).toEqual(json.title)
    })
  })

  describe('createDiscoverShow', () => {
    it('should return a DiscoverVideo with isTv true', () => {
      const json = createFakeDiscoverVideo()
      const show = createDiscoverShow(json)

      expect(show.isTv).toBe(true)
      expect(show.videoId).toBe('tv' + json.id)
    })

    it('should have a videoName based on name', () => {
      delete json.title

      const show = createDiscoverShow(json)

      expect(show.videoName).toEqual(json.name)
    })
  })
})
