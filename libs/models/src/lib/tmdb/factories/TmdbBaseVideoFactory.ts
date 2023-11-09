import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import {
  BaseMovie,
  BaseShow,
  createTmdbBaseVideo,
  TmdbBaseVideoResponseType,
  TmdbBaseVideoType,
  VideoMediaType,
} from '@reelist/models/tmdb/TmdbBaseVideo'

export const tmdbBaseVideoFactory = Factory.define<
  TmdbBaseVideoResponseType & VideoMediaType,
  null,
  TmdbBaseVideoType
>(({ sequence, params, onCreate }) => {
  onCreate(json => createTmdbBaseVideo(json))

  let extraData: BaseMovie | BaseShow

  const {
    name,
    title,
    firstAirDate,
    releaseDate,
    mediaType = faker.helpers.arrayElement(['tv', 'mv']),
    ...rest
  } = params

  if (mediaType === 'tv') {
    extraData = {
      name: name || faker.random.words(),
      firstAirDate: firstAirDate || faker.date.past().toISOString(),
    }
  } else {
    extraData = {
      title: title || faker.random.words(),
      releaseDate: releaseDate || faker.date.past().toISOString(),
    }
  }

  return {
    adult: faker.datatype.boolean(),
    backdropPath: faker.image.imageUrl(),
    genreIds: [faker.datatype.number(), faker.datatype.number()],
    id: sequence,
    originalLanguage: faker.random.locale(),
    overview: faker.lorem.paragraph(),
    popularity: faker.datatype.number(),
    posterPath: faker.image.imageUrl(),
    originCountry: [faker.address.countryCode(), faker.address.countryCode()],
    originalName: faker.random.words(),
    voteAverage: faker.datatype.float({ min: 0, max: 10 }),
    voteCount: faker.datatype.number(),
    video: faker.datatype.boolean(),
    status: faker.helpers.arrayElement(['Released', 'Post Production', 'In Production']),
    tagline: faker.lorem.sentence(),
    mediaType,
    ...extraData,
    ...rest,
  }
})
