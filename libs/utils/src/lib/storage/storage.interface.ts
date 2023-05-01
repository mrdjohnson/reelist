export default interface IStorage {
  save: (key: string, value: unknown) => Promise<boolean>

  load: <T>(key: string) => Promise<T | null>

  remove: (key: string) => Promise<boolean>

  clear: () => Promise<boolean>
}

export const StorageInversionKey = 'IStorage'
