import { storeContext } from '@reelist/utils/store'
import { useContext } from 'react'
import Store from '@reelist/models/Store'

export const useStore = () => {
  const store: Store = useContext(storeContext)

  return store
}
