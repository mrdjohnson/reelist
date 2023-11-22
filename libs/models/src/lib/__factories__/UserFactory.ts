import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import { UserTableType } from '@reelist/interfaces/tables/UserTable'
import User from '@reelist/models/User'
import humps from 'humps'

export const userFactory = Factory.define<UserTableType, { loggedIn?: boolean }, User>(
  ({ sequence, params, onCreate, transientParams }) => {
    onCreate(userTableJson => {
      const { loggedIn = false } = transientParams

      const profile = humps.camelizeKeys<UserTableType>(userTableJson)

      return new User({ profile, loggedIn })
    })

    return {
      id: `user_${sequence}`,
      username: faker.internet.userName(),
      avatar_url: faker.internet.avatar(),
      name: faker.name.firstName(),
      notificationId: '',
      followed_list_ids: [],
      followed_user_ids: [],
      updated_at: '',
    }
  },
)

export const loggedInUserFactory = userFactory.transient({ loggedIn: true })
