export default interface IStorage {
  save: (key: string, value: unknown) => Promise<boolean>

  load: <T = unknown>(key: string) => Promise<T | null>

  remove: (key: string) => Promise<boolean>

  clear: () => Promise<boolean>
}

export const StorageInversionKey = 'IStorage'
