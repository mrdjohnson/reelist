import 'reflect-metadata'

import inversionContainer from '@reelist/models/inversionContainer'
import Storage, { IStorage, StorageInversionKey } from '~/utils/storage'

inversionContainer.bind<IStorage>(StorageInversionKey).to(Storage).inSingletonScope()
