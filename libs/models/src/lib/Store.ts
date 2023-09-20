import { inject, injectable } from 'inversify'

import AppState from '@reelist/models/AppState'
import Auth from '@reelist/models/Auth'
import VideoListStore from '@reelist/models/VideoListStore'
import VideoStore from '@reelist/models/VideoStore'
import PersonStore from '@reelist/models/PersonStore'
import UserStore from '@reelist/models/UserStore'
import { SupabaseClient } from '@supabase/supabase-js'
import type IStorage from '@reelist/utils/storage/storage.interface'
import { StorageInversionKey } from '@reelist/utils/storage/storage.interface'

@injectable()
class Store {
  personStore: PersonStore = new PersonStore()

  constructor(
    @inject(Auth) public auth: Auth,
    @inject(AppState) public appState: AppState,
    @inject(VideoStore) public videoStore: VideoStore,
    @inject(UserStore) public userStore: UserStore,
    @inject(VideoListStore) public videoListStore: VideoListStore,
    @inject(SupabaseClient) public supabase: SupabaseClient,
    @inject(StorageInversionKey) public storage: IStorage,
  ) {}
}

export default Store
