import 'reflect-metadata'

import { AppRegistry } from 'react-native'
import App from './App'

import 'react-native-url-polyfill/auto'
import { configure } from 'mobx'

import inversionContainer from '~/models/inversionContainer'
import { SupabaseClient } from '@supabase/supabase-js'
import supabase from '~/supabase'

inversionContainer.bind<SupabaseClient>(SupabaseClient).toConstantValue(supabase)

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
