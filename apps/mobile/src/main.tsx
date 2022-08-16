import { AppRegistry } from 'react-native'
import App from './App'

import 'react-native-url-polyfill/auto'

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
