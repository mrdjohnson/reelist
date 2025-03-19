import { useEffect, useMemo, useState } from 'react'
import { useStore } from '@reelist/utils/hooks/useStore'
import LocalStorageValue from '@reelist/utils/storage/LocalStorageValue'

const useLocalStorageState = <T>(key: string, initialValue: T): [T, (nextItem: T) => void] => {
  const { storage } = useStore()

  const localStorageValue = useMemo(() => {
    return new LocalStorageValue(key, initialValue, storage)
  }, [])

  useEffect(() => {
    localStorageValue.load()
  }, [])

  return [localStorageValue.value, localStorageValue.setValue]
}

export default useLocalStorageState
