import { useEffect, useState } from 'react'

const useRefresh = (callback: () => Promise<unknown>): [boolean, () => void] => {
  const [refreshing, setRefreshing] = useState(true)

  const refresh = () => {
    setRefreshing(true)
  }

  useEffect(() => {
    if (refreshing) {
      callback().then(() => setRefreshing(false))
    }
  }, [refreshing])

  return [refreshing, refresh]
}

export default useRefresh
