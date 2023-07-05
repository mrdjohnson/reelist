import _ from 'lodash'
import Auth from './Auth'
import User from '@reelist/models/User'
import humps from 'humps'
import { inject, injectable } from 'inversify'
import { SupabaseClient } from '@supabase/supabase-js'
import { UserTableType } from '@reelist/interfaces/tables/UserTable'
import TableApi from '@reelist/apis/TableApi'

@injectable()
class UserStore {
  userById: Record<string, User | null> = {}
  followedUsers: User[] = []

  private userApi: TableApi<UserTableType>

  constructor(
    @inject(Auth) private storeAuth: Auth,
    @inject(SupabaseClient) private supabase: SupabaseClient,
  ) {
    this.userApi = new TableApi<UserTableType>('profiles', supabase)
  }

  makeUiUser = (profileData: UserTableType, loggedIn: boolean = false) => {
    const profile = humps.camelizeKeys<UserTableType>(profileData)

    return new User({ profile, loggedIn }, this.userApi)
  }

  getFollowedUsers = async () => {
    if (!_.isEmpty(this.followedUsers)) return this.followedUsers

    const followedUsers = await this.getUsers(this.storeAuth.user.followedUserIds)

    this.followedUsers = followedUsers

    return followedUsers
  }

  getUser = async (userId: string) => {
    if (!userId) return null

    const { data: userJson, error } = await this.userApi.match({ id: userId }).single()

    if (userJson) {
      return this.makeUiUser(userJson)
    }

    if (error) {
      console.error('failed to getUser:', error.message)
    }

    return null
  }

  getUsers = async (userIds: string[]) => {
    if (_.isEmpty(userIds)) return []

    const { data: userJsons, error } = await this.userApi.selectAll.in('id', userIds)

    if (userJsons) {
      return userJsons.map(user => this.makeUiUser(user))
    }

    if (error) {
      console.error('failed to getUsers:', error.message)
    }

    return []
  }

  getOrCreateUser = async (authId: string) => {
    console.log('getting user')
    const { data: userJson, error } = await this.userApi.upsert({ id: authId }).single()

    if (userJson) {
      return this.makeUiUser(userJson, true)
    }

    if (error) {
      console.error('failed to getOrCreateUser:', error.message)
    }

    return null
  }
}

export default UserStore
