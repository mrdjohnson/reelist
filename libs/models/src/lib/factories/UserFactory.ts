import { faker } from '@faker-js/faker'
import User, { ProfileTableType } from '@reelist/models/User'
import { Camelized } from 'humps'

export const createUser = (
  options: Partial<Camelized<ProfileTableType> & { loggedIn: boolean }> = {},
): User => {
  const { loggedIn: loggedInOption, ...profileOptions } = options

  const loggedIn = loggedInOption === undefined ? true : loggedInOption

  const profile: Camelized<ProfileTableType> = {
    id: faker.lorem.slug(),
    updatedAt: '',
    followedListIds: [],
    followedUserIds: [],
    username: faker.internet.userName(),
    avatarUrl: faker.internet.avatar(),
    name: faker.name.firstName(),
    notificationId: '',
    ...profileOptions,
  }

  return new User({
    loggedIn,
    profile,
  })
}
