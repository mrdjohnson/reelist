import React, { createContext } from 'react'
import inversionContainer from '@reelist/models/inversionContainer'
import Store from '@reelist/models/Store'

const store = inversionContainer.get<Store>(Store)
export const storeContext = createContext<Store>(store)

const Provider = storeContext.Provider

export const StoreProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <Provider value={store}>{children}</Provider>
}
