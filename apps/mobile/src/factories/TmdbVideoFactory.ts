import { faker } from '@faker-js/faker'
import Video from '~/models/Video'

export const createTmdbVideo = (options: Partial<Video> = {}): Partial<Video> => {
  let tmdbVideo: Partial<Video>

  if (options.mediaType === 'movie') {
    tmdbVideo = {
      title: faker.lorem.sentence(),
      runtime: 5,
      video: true,
      originalTitle: '',
    }
  } else {
    tmdbVideo = {
      episodeRunTime: [30],
      numberOfEpisodes: 5,
      seasons: undefined,
      lastEpisodeToAir: undefined,
      nextEpisodeToAir: undefined,
      originalName: '',
    }
  }

  return {
    ...tmdbVideo,
    id: faker.random.alphaNumeric(),
    adult: false,
    backdropPath: faker.lorem.text(),
    genreIds: [],
    mediaType: 'movie',
    originalLanguage: '',
    overview: '',
    popularity: 0,
    posterPath: '',
    releaseDate: '',
    name: '',
    firstAirDate: '',
    originCountry: [],
    voteAverage: 0,
    voteCount: 0,
    ...options,
  }
}
