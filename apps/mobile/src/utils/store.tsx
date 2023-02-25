import React, { createContext } from 'react'
import inversionContainer from '~/models/inversionContainer'
import Store from '~/models/Store'

const store = inversionContainer.get<Store>(Store)
export const storeContext = createContext<Store>(store)

const Provider = storeContext.Provider

export const StoreProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <Provider value={store}>{children}</Provider>
}
