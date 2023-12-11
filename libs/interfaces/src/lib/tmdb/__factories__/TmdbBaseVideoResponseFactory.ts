import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import { TmdbBaseVideoResponse } from '@reelist/interfaces/tmdb/TmdbBaseVideoResponse'

// any video creation SHOULD call this factory.
// this factory is reset after each test, ensuring that the id's will always be expected
export const tmdbBaseVideoFactory = Factory.define<
  TmdbBaseVideoResponse,
  null,
  TmdbBaseVideoResponse
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
