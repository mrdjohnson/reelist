import { inject, injectable } from 'inversify'

import AppState from '@reelist/models/AppState'
import VideoStore from '@reelist/models/VideoStore'
import TmdbDiscover from '@reelist/models/TmdbDiscover'
import PersonStore from '@reelist/models/PersonStore'
import type IStorage from '@reelist/utils/storage/storage.interface'
import { StorageInversionKey } from '@reelist/utils/storage/storage.interface'

@injectable()
class Store {
  personStore: PersonStore = new PersonStore()

  constructor(
    @inject(AppState) public appState: AppState,
    @inject(VideoStore) public videoStore: VideoStore,
    @inject(TmdbDiscover) public tmdbDiscover: TmdbDiscover,
    @inject(StorageInversionKey) public storage: IStorage,
  ) {}
}

export default Store
