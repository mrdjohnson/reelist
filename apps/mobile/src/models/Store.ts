import { inject, injectable } from 'inversify'

import AppState from '~/models/AppState'
import Auth from '~/models/Auth'
import VideoListStore from '~/models/VideoListStore'
import VideoStore from '~/models/VideoStore'
import UserStore from '~/models/UserStore'
import { SupabaseClient } from '@supabase/supabase-js'

@injectable()
class Store {
  @inject(Auth) public auth: Auth
  @inject(AppState) public appState: AppState
  @inject(VideoStore) public videoStore: VideoStore
  @inject(UserStore) public userStore: UserStore
  @inject(VideoListStore) public videoListStore: VideoListStore
  @inject(SupabaseClient) public supabase: SupabaseClient
}

export default Store
