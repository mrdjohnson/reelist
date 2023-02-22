import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import Auth from './Auth'
import supabase from '~/supabase'
import User, { ProfileTableType } from '~/models/User'
import humps from 'humps'

class UserStore {
  storeAuth: Auth
  userById: Record<string, User | null> = {}
  followedUsers: User[] = []

  constructor(auth: Auth) {
    makeAutoObservable(this, {
      storeAuth: false,
    })

    this.storeAuth = auth
  }

  makeUiUser = (profileData: ProfileTableType, loggedIn: boolean = false) => {
    const profile = humps.camelizeKeys<ProfileTableType>(profileData)

    return new User({ profile, loggedIn })
  }

  getFollowedUsers = async () => {
    if (!_.isEmpty(this.followedUsers)) return this.followedUsers

    const followedUsers = await this.getUsers(this.storeAuth.user.followedUserIds)

    this.followedUsers = followedUsers

    return followedUsers
  }

  getUser = async (userId: string) => {
    if (!userId) return null

    const { data: userJson, error } = await supabase
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

    const { data: userJsons, error } = await supabase
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
    const { data: userJson, error } = await supabase
      .from<ProfileTableType>('profiles')
      .upsert({ id: authId })
      .single()

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
