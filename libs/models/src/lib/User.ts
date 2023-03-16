import { makeAutoObservable } from 'mobx'
import { PostgrestError, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js'
import humps, { Camelized } from 'humps'
import { createViewModel, IViewModel } from 'mobx-utils'
import VideoList from './VideoList'
import _ from 'lodash'

export type ProfileTableType = {
  id: string
  updated_at: string
  username: string
  avatar_url: string
  followed_list_ids: string[]
  followed_user_ids: string[]
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
  followedListIds: string[] = []
  followedUserIds: string[] = []
  updatedAt = ''
  username = ''
  avatarUrl = ''
  notificationId = ''
  name = ''

  _viewModel?: User & IViewModel<User> = undefined

  static supabase: SupabaseClient

  constructor(
    { user, loggedIn = true, profile }: UserConstructorType,
    private supabase: SupabaseClient,
  ) {
    makeAutoObservable(this)

    this.loggedIn = loggedIn

    Object.assign(this, user || profile)

    // this.name = user.name
    // this.imageUrl = user.imageUrl
    // this.watchedIds = user.watchedIds
  }

  isAdminOfList = (videoList: VideoList) => {
    return videoList.adminIds.includes(this.id)
  }

  followVideoList = (videoList: VideoList) => {
    this.viewModel.followedListIds = [...this.followedListIds, videoList.id]

    this.save()
  }

  toggleFollowingUser = (user: User) => {
    if (this.isFollowingUser(user)) {
      this.viewModel.followedUserIds = _.without(this.followedUserIds, user.id)
    } else {
      this.viewModel.followedUserIds = [...this.followedUserIds, user.id]
    }

    this.save()
  }

  unFollowVideoList = (videoList: VideoList) => {
    this.viewModel.followedListIds = _.without(this.viewModel.followedListIds, videoList.id)

    this.save()
  }

  isFollowingVideoList = (videoList: VideoList) => {
    return this.followedListIds.includes(videoList.id)
  }

  isFollowingUser = (user: User) => {
    return this.followedUserIds.includes(user.id)
  }

  get viewModel() {
    if (!this._viewModel) {
      this._viewModel = createViewModel<User>(this)
    }

    return this._viewModel
  }

  save = async () => {
    const userViewModel = this.viewModel

    // Map{'exampleField' -> 'exampleValue'} -> {example_field: 'exampleValue'}
    const changedFields = humps.decamelizeKeys(Object.fromEntries(userViewModel.changedValues))

    const { data: profile, error } = await this.supabase
      .from('profiles')
      .update(changedFields)
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

export const LoggedOutUser = new User(
  {
    profile: {
      id: '',
      followedListIds: [],
      followedUserIds: [],
      updatedAt: '',
      username: '',
      avatarUrl: '',
      notificationId: '',
      name: '',
    },

    loggedIn: false,
  },
  null,
)

const maybePrintError = (error: PostgrestError | null) => {
  if (error) {
    console.error('profile call was broken?', error.message)
    return true
  }

  return false
}

export default User
