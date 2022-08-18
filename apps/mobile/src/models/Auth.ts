import { makeAutoObservable } from 'mobx'
import User, { LoggedOutUser } from '~/models/User'
import supabase from '~/supabase'
import { Subscription } from '@supabase/supabase-js'

import secrets from '~/secrets/secrets-index'
const { TEST_EMAIL, TEST_PASSWORD } = secrets

export default class Auth {
  user = LoggedOutUser
  authListener: Subscription | null = null
  loading = true
  userProfile = null

  constructor() {
    makeAutoObservable(this)

    this._initUserFromSession()
  }

  _initUserFromSession = () => {
    const currentSession = supabase.auth.session()

    if (currentSession?.user) {
      //todo change this to get profile?
      this.setUser(new User({ user: currentSession.user }))
    } else {
      this.setUser(LoggedOutUser)
    }
  }

  setUser = (user: User) => {
    this.user = user
    this.loading = false

    console.log('logged ' + (user.loggedIn ? 'in' : 'out'))
  }

  login = async () => {
    this.loading = true

    // let { error } = await supabase.auth.signIn({ provider: 'google' })

    const { user, session, error } = await supabase.auth.signIn({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    })

    if (error) {
      console.log('Error: ', error.message)
    } else if (user) {
      this.setUser(new User(user))
    }
  }

  logout = () => {
    this.setUser(LoggedOutUser)
  }

  getCurrentUserProfile = async () => {
    if (!this.user.loggedIn) return false

    this.loading = true

    const { data: profile, error } = await supabase
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
