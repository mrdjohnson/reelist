import 'reflect-metadata'

import { AppRegistry } from 'react-native'
import App from './App'

import 'react-native-url-polyfill/auto'
import { configure } from 'mobx'

import inversionContainer from '@reelist/models/inversionContainer'
import { SupabaseClient } from '@supabase/supabase-js'
import supabase from '~/supabase'
import VideoApi from '@reelist/apis/VideoApi'
import Storage, {IStorage, StorageInversionKey} from '~/utils/storage'

inversionContainer.bind<SupabaseClient>(SupabaseClient).toConstantValue(supabase)
inversionContainer.bind<VideoApi>(VideoApi).toSelf().inSingletonScope()
inversionContainer.bind<IStorage>(StorageInversionKey).to(Storage).inSingletonScope()

configure({
  enforceActions: 'never',
  computedRequiresReaction: true,
  reactionRequiresObservable: false,
  observableRequiresReaction: false,
  disableErrorBoundaries: true,
})

// this is needed for the emulator
Promise.allSettled =
  Promise.allSettled ||
  (promises =>
    Promise.all(
      promises.map(p =>
        p
          ?.then(value => ({
            status: 'fulfilled',
            value,
          }))
          .catch(reason => ({
            status: 'rejected',
            reason,
          })),
      ),
    ))

AppRegistry.registerComponent('Mobile', () => App)
