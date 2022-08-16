import React, { createContext } from 'react'
import Store from '~/models/Store'

const store = new Store()
export const storeContext = createContext<Store>(store)

const Provider = storeContext.Provider

export const StoreProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <Provider value={store}>{children}</Provider>
}
