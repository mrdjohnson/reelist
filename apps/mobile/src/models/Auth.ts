import { makeAutoObservable } from 'mobx'
import User, { LoggedOutUser } from '~/models/User'
import { Subscription, SupabaseClient } from '@supabase/supabase-js'

import secrets from '~/secrets/secrets-index'
import { save } from '~/utils/storage'
import { inject, injectable } from 'inversify'
const { TEST_EMAIL, TEST_PASSWORD } = secrets

@injectable()
export default class Auth {
  user = LoggedOutUser
  authListener: Subscription | null = null
  loading = true
  userProfile = null

  constructor(@inject(SupabaseClient) private supabase: SupabaseClient) {
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
      save('has_signed_in', true)
    }

    console.log('logged ' + (this.user.loggedIn ? 'in' : 'out'))
  }

  login = async () => {
    this.loading = true

    // let { error } = await supabase.auth.signIn({ provider: 'google' })

    const { user, session, error } = await this.supabase.auth.signIn({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    })

    if (error) {
      console.log('Error: ', error.message)
    } else if (user) {
      this.setUser(new User(user, this.supabase))
    }
  }

  signOut = async () => {
    return await this.supabase.auth.signOut()
  }

  logout = () => {
    this.setUser(LoggedOutUser)
    save('has_signed_in', null)
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

  signin = this.supabase.auth.signIn

  get loggedIn() {
    return this.user.loggedIn
  }

  get currentUserProfile() {
    if (this.userProfile) return this.userProfile

    this.getCurrentUserProfile()

    return null
  }
}
