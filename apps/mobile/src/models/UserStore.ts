import _ from 'lodash'
import Auth from './Auth'
import User, { ProfileTableType } from '~/models/User'
import humps from 'humps'
import { inject, injectable } from 'inversify'
import { SupabaseClient } from '@supabase/supabase-js'

@injectable()
class UserStore {
  userById: Record<string, User | null> = {}
  followedUsers: User[] = []

  constructor(
    @inject(Auth) private storeAuth: Auth,
    @inject(SupabaseClient) private supabase: SupabaseClient,
  ) {}

  makeUiUser = (profileData: ProfileTableType, loggedIn: boolean = false) => {
    const profile = humps.camelizeKeys<ProfileTableType>(profileData)

    return new User({ profile, loggedIn }, this.supabase)
  }

  getFollowedUsers = async () => {
    if (!_.isEmpty(this.followedUsers)) return this.followedUsers

    const followedUsers = await this.getUsers(this.storeAuth.user.followedUserIds)

    this.followedUsers = followedUsers

    return followedUsers
  }

  getUser = async (userId: string) => {
    if (!userId) return null

    const { data: userJson, error } = await this.supabase
      .from<ProfileTableType>('profiles')
      .select('*')
      .match({ id: userId })
      .single()

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

    const { data: userJsons, error } = await this.supabase
      .from<ProfileTableType>('profiles')
      .select('*')
      .in('id', userIds)

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
    const { data: userJson, error } = await this.supabase
      .from<ProfileTableType>('profiles')
      .upsert({ id: authId })
      .single()

    if (userJson) {
      debugger
      return this.makeUiUser(userJson, true)
    }

    if (error) {
      console.error('failed to getOrCreateUser:', error.message)
    }

    return null
  }
}

export default UserStore
