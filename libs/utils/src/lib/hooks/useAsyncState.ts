import { useEffect, useState } from 'react'

/**
 * helper function for values that exist as a result of async calls
 *
 * @returns value or default value, refresher function, is loading
 */
const useAsyncState = <T>(
  defaultValue: T | (() => T),
  callback?: () => Promise<T>,
): [T, () => void, boolean] => {
  const [isRefreshing, setIsRefreshing] = useState(!!callback)
  const [value, setValue] = useState(defaultValue)

  const refresh = () => {
    setValue(defaultValue)
    setIsRefreshing(true)
  }

  useEffect(() => {
    if (isRefreshing) {
      callback?.()
        .then(setValue)
        .finally(() => setIsRefreshing(false))
    }
  }, [isRefreshing])

  return [value, refresh, isRefreshing]
}

export default useAsyncState
