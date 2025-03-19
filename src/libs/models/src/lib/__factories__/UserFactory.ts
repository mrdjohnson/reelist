import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import { UserTableType } from '@reelist/interfaces/tables/UserTable'
import User from '@reelist/models/User'
import humps from 'humps'
import { mockServer } from '@reelist/apis/__testHelpers__/apiTestHelper'
import inversionContainer from '@reelist/models/inversionContainer'
import UserStore from '@reelist/models/UserStore'
import Auth from '@reelist/models/Auth'

export const userFactory = Factory.define<UserTableType, { loggedIn?: boolean }, User>(
  ({ sequence, params, onCreate, transientParams }) => {
    onCreate(async userTableJson => {
      mockServer.supabase.db.createProfile(userTableJson)

      const userStore = inversionContainer.get<UserStore>(UserStore)

      const user = await userStore.getUser(userTableJson.id)

      if (!user) {
        throw new Error('user not found')
      }

      const { loggedIn = false } = transientParams

      if (loggedIn) {
        const auth = inversionContainer.get<Auth>(Auth)

        await auth.setUser(user)
      }

      return user
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
