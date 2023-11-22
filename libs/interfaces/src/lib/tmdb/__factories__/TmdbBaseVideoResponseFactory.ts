import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import { TmdbBaseVideoResponseType } from '@reelist/interfaces/tmdb/TmdbBaseVideoResponseType'

export const tmdbBaseVideoFactory = Factory.define<
  TmdbBaseVideoResponseType,
  null,
  TmdbBaseVideoResponseType
>(({ sequence, params }) => {
  return {
    backdropPath: faker.image.imageUrl(),
    genreIds: [faker.datatype.number(), faker.datatype.number()],
    id: sequence,
    originalLanguage: faker.random.locale(),
    originCountry: [faker.address.countryCode(), faker.address.countryCode()],
    overview: faker.lorem.paragraph(),
    popularity: faker.datatype.number(),
    posterPath: faker.image.imageUrl(),
    status: faker.helpers.arrayElement(['Released', 'Post Production', 'In Production']),
    voteAverage: faker.datatype.float({ min: 0, max: 10 }),
    voteCount: faker.datatype.number(),
    ...params,
  }
})
