import { makeAutoObservable } from 'mobx'
import { PostgrestError, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js'
import humps, { Camelized } from 'humps'
import { createViewModel, IViewModel } from 'mobx-utils'
import VideoList from '@reelist/models/VideoList'
import _ from 'lodash'
import { UserTableType } from '@reelist/interfaces/tables/UserTable'
import TableApi from '@reelist/apis/TableApi'
import inversionContainer from '@reelist/models/inversionContainer'
import Auth from '@reelist/models/Auth'

type ProfileType = Camelized<UserTableType>

// table values + any ui values
type UserType = ProfileType & {
  loggedIn?: boolean
}

type UserConstructorType = {
  user?: SupabaseUser
  profile?: ProfileType | null
}

type ToggleFollowingVideoListOverload = {
  (videoListId: string): Promise<string | null>
  (videoList: VideoList): Promise<string | null>
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

  private userApi: TableApi<UserTableType> | null = null

  constructor({ user, profile }: UserConstructorType) {
    Object.assign(this, user || profile)

    makeAutoObservable(this)
  }

  login = () => {
    this.loggedIn = true

    const supabase: SupabaseClient = inversionContainer.get<SupabaseClient>(SupabaseClient)
    this.userApi = new TableApi<UserTableType>('profiles', supabase)
  }

  isAdminOfList = (videoList: VideoList) => {
    return videoList.adminIds.includes(this.id)
  }

  toggleFollowingVideoList = (videoList: VideoList) => {
    this.viewModel.followedListIds = _.xor(this.followedListIds, [videoList.id])

    return this.save()
  }
  toggleFollowingUser = (user: User) => {
    this.viewModel.followedUserIds = _.xor(this.followedUserIds, [user.id])

    return this.save()
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
    if (!this.loggedIn) {
      throw new Error('Cannot save user without being logged in')
    }

    const userViewModel = this.viewModel

    // Map{'exampleField' -> 'exampleValue'} -> {example_field: 'exampleValue'}
    const changedFields = humps.decamelizeKeys(Object.fromEntries(userViewModel.changedValues))

    const { data: profile, error } = await this.userApi!.update(changedFields)
      .match({ id: userViewModel.id })
      .single()

    if (error) {
      console.error('failed to edit profile', error.message)
      return error.message
    } else if (profile) {
      userViewModel.submit()
    }

    return null
  }
}

export const LoggedOutUser = new User({
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
})

const maybePrintError = (error: PostgrestError | null) => {
  if (error) {
    console.error('profile call was broken?', error.message)
    return true
  }

  return false
}

export default User
