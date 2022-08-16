import { storeContext } from '~/utils/store'
import { useContext } from 'react'

export const useStore = () => {
  const store = useContext(storeContext)

  return store
}
