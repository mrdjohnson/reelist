import { UserTableType } from '@reelist/interfaces/tables/UserTable'
import { mockServer } from './apiTestHelper'
import inversionContainer from '@reelist/models/inversionContainer'
import UserStore from '@reelist/models/UserStore'
import Auth from '@reelist/models/Auth'
import { userFactory } from '@reelist/models/__factories__/UserFactory'

export async function createLoggedInUser(userResponse: Partial<UserTableType> = {}) {
  const user = await userFactory.transient({ loggedIn: true }).create(userResponse)

  if (!user) {
    throw new Error('user not found')
  }

  const auth = inversionContainer.get<Auth>(Auth)

  auth.setUser(user)

  return user
}
