import { useEffect, useState } from 'react'
import { useStore } from '@reelist/utils/hooks/useStore'

const useLocalStorageState = <T>(key: string, initialValue: T): [T, (nextItem: T) => void] => {
  const { storage } = useStore()

  const [state, setState] = useState<T>(initialValue)

  useEffect(() => {
    storage.load<T>(key).then(nextValue => {
      if (nextValue) {
        setState(nextValue)
      }
    })
  }, [])

  const setValue = (value: T) => {
    setState(value)
    storage.save(key, value)
  }

  return [state, setValue]
}

export default useLocalStorageState
