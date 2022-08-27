import AsyncStorage from '@react-native-async-storage/async-storage'

export const loadString = async (key: string) => {
  try {
    return await AsyncStorage.getItem(key)
  } catch {
    return null
  }
}

/**
 * Saves a string to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export const saveString = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

/**
 * Loads something from storage and runs it thru JSON.parse.
 *
 * @param key The key to fetch.
 */
export const load = async <T = unknown>(key: string) => {
  try {
    const almostThere = await AsyncStorage.getItem(key)

    if (!almostThere) return null

    return JSON.parse(almostThere) as T
  } catch {
    return null
  }
}

export const save = (key: string, value: unknown) => {
  return saveString(key, JSON.stringify(value))
}

export const remove = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key)

    return true
  } catch {
    console.error('unable to remove item from cache')
    return false
  }
}

/**
 * Burn it all to the ground.
 */
export const clear = async () => {
  try {
    await AsyncStorage.clear()

    return true
  } catch {
    console.error('unable to clear cache')

    return false
  }
}
