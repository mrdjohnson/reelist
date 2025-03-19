import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'

import { TmdbBasePersonResponse, TmdbPersonCreditResponse } from '../TmdbPersonResponse'
import _ from 'lodash'

export const tmdbBasePersonFactory = Factory.define<TmdbBasePersonResponse>(({ sequence }) => {
  return {
    id: sequence,
    name: faker.name.firstName() + ' ' + faker.name.lastName(),
    profilePath: faker.image.imageUrl(),
    gender: faker.datatype.number({ min: 0, max: 2 }),
  }
})

export const tmdbPersonCreditFactory = Factory.define<TmdbPersonCreditResponse>(() => {
  const basePerson = tmdbBasePersonFactory.build()

  return {
    ...basePerson,
    adult: faker.datatype.boolean(),
    originalName: _.snakeCase(basePerson.name),
    popularity: faker.datatype.number({ min: 10, max: 10000 }),
    character: faker.name.firstName(),
    creditId: 'credit_' + basePerson.id,
    order: basePerson.id,
  }
})
