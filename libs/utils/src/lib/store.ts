import { createContext } from 'react'
import inversionContainer from '@reelist/models/inversionContainer'
import Store from '@reelist/models/Store'

const store = inversionContainer.get<Store>(Store)
export const storeContext = createContext<Store>(store)
