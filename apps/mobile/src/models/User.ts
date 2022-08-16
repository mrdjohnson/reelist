import supabase, { SupabaseUser } from '~/supabase'
import { makeAutoObservable } from 'mobx'
import { PostgrestError } from '@supabase/supabase-js'
import humps, { Camelized } from 'humps'
import { IViewModel } from 'mobx-utils'

type ProfileTableType = {
  id: string
  updated_at: string
  username: string
  avatar_url: string
  following_lists: string[]
  notificationId: string
  name: string
}

type ProfileType = Camelized<ProfileTableType>

// table values + any ui values
type UserType = ProfileType & {
  loggedIn?: boolean
}

type UserConstructorType = {
  user?: SupabaseUser
  loggedIn?: boolean
  profile?: ProfileType | null
}

class User implements UserType {
  id = ''
  loggedIn = false
  followingLists = []
  updatedAt = ''
  username = ''
  avatarUrl = ''
  notificationId = ''
  name = ''

  constructor({ user, loggedIn = true, profile }: UserConstructorType) {
    makeAutoObservable(this)

    this.loggedIn = loggedIn

    Object.assign(this, user || profile)

    // this.name = user.name
    // this.imageUrl = user.imageUrl
    // this.watchedIds = user.watchedIds
  }

  static fromAuthId = async (profileId: string) => {
    let profile: ProfileTableType | null = null

    const maybePrintErrorAndThrow = (error: PostgrestError | null) => {
      if (error) {
        console.error('profile call was broken?', error.message)
        throw error
      }
    }

    const { data: userProfile, error: findProfileError } = await supabase
      .from<ProfileTableType>('profiles')
      .select('*')
      .match({ id: profileId })
      .maybeSingle()

    maybePrintErrorAndThrow(findProfileError)

    if (userProfile) {
      profile = userProfile
    } else {
      const { data, error: createProfileError } = await supabase
        .from<ProfileTableType>('profiles')
        .insert({ id: profileId })
        .maybeSingle()

      maybePrintErrorAndThrow(createProfileError)

      profile = data
    }

    return new User({ profile: humps.camelizeKeys(profile), loggedIn: true })
  }

  static save = async (userViewModel: User & IViewModel<User>) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ name: userViewModel.name, avatar_url: userViewModel.avatarUrl })
      .match({ id: userViewModel.id })
      .single()

    if (error) {
      console.error('failed to edit profile', error.message)
      return error.message
    } else if (profile) {
      userViewModel.submit()
    }
  }
}

export const LoggedOutUser = new User({
  profile: {
    id: '',
    followingLists: [],
    updatedAt: '',
    username: '',
    avatarUrl: '',
    notificationId: '',
    name: '',
  },

  loggedIn: false,
})

export default User
