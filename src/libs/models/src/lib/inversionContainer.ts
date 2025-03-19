import { Container } from 'inversify'

import Store from '@reelist/models/Store'
import AppState from '@reelist/models/AppState'
import VideoStore from '@reelist/models/VideoStore'
import TmdbDiscover from '@reelist/models/TmdbDiscover'
import Storage, { IStorage, StorageInversionKey } from '~/utils/storage'


const inversionContainer = new Container()

export function bindShared() {
  inversionContainer.bind<IStorage>(StorageInversionKey).to(Storage).inSingletonScope()
  inversionContainer.bind<Store>(Store).toSelf().inSingletonScope()
  inversionContainer.bind<AppState>(AppState).toSelf().inSingletonScope()
  inversionContainer.bind<VideoStore>(VideoStore).toSelf().inSingletonScope()
  inversionContainer.bind<TmdbDiscover>(TmdbDiscover).toSelf().inSingletonScope()
}

bindShared()

export default inversionContainer
