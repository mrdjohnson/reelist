import { faker } from '@faker-js/faker'
import { DiscoverVideoResponseType } from '@reelist/models/DiscoverVideo'

export const createFakeDiscoverVideo = (
  options: Partial<DiscoverVideoResponseType> = {},
): DiscoverVideoResponseType => {
  return {
    adult: faker.datatype.boolean(),
    backdropPath: faker.image.imageUrl(),
    genreIds: [faker.datatype.number(), faker.datatype.number()],
    id: faker.datatype.number(),
    originalLanguage: faker.random.locale(),
    originalTitle: faker.random.words(),
    overview: faker.lorem.paragraph(),
    popularity: faker.datatype.number(),
    posterPath: faker.image.imageUrl(),
    releaseDate: faker.date.past().toISOString().split('T')[0],
    name: faker.random.words(),
    title: faker.random.words(),
    video: faker.datatype.boolean(),
    voteAverage: faker.datatype.float({ min: 0, max: 10, precision: 0.1 }),
    voteCount: faker.datatype.number(),
    ...options,
  }
}
