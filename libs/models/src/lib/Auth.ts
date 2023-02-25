import { makeAutoObservable } from 'mobx'
import User, { LoggedOutUser } from '@reelist/models/User'
import { Subscription, SupabaseClient } from '@supabase/supabase-js'
import { inject, injectable } from 'inversify'
import IStorage, { StorageInversionKey } from '@reelist/utils/storage/storage.interface'

@injectable()
export default class Auth {
  user = LoggedOutUser
  authListener: Subscription | null = null
  loading = true
  userProfile = null

  constructor(
    @inject(SupabaseClient) private supabase: SupabaseClient,
    @inject(StorageInversionKey) private storage: IStorage,
  ) {
    makeAutoObservable(this)

    this._initUserFromSession()
  }

  _initUserFromSession = () => {
    const currentSession = this.supabase.auth.session()

    if (currentSession?.user) {
      //todo change this to get profile?
      this.setUser(new User({ user: currentSession.user }, this.supabase))
    } else {
      this.setUser(LoggedOutUser)
    }
  }

  setUser = (user: User | null) => {
    this.user = user || LoggedOutUser
    this.loading = false

    if (this.user.loggedIn) {
      this.storage.save('has_signed_in', true)
    }

    console.log('logged ' + (this.user.loggedIn ? 'in' : 'out'))
  }

  signOut = async () => {
    return await this.supabase.auth.signOut()
  }

  logout = () => {
    this.setUser(LoggedOutUser)
    this.storage.save('has_signed_in', null)
  }

  getCurrentUserProfile = async () => {
    if (!this.user.loggedIn) return false

    this.loading = true

    const { data: profile, error } = await this.supabase
      .from('profiles')
      .select('*')
      .match({ id: this.user.id })
      .single()

    if (error) {
      this.loading = false
      this.needsProfile = true
    }

    this.userProfile = profile
  }

  get loggedIn() {
    return this.user.loggedIn
  }

  get currentUserProfile() {
    if (this.userProfile) return this.userProfile

    this.getCurrentUserProfile()

    return null
  }
}
