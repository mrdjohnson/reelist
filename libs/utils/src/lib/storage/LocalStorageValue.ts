import type IStorage from '@reelist/utils/storage/storage.interface'
import { makeAutoObservable } from 'mobx'

export default class LocalStorageValue<T> {
  constructor(private key: string, public value: T, private storage: IStorage) {
    makeAutoObservable(this)
  }

  load = () => {
    this.storage.load<T>(this.key).then(nextValue => {
      if (nextValue !== undefined) {
        this.value = nextValue
      }
    })
  }

  setValue = (value: T) => {
    this.value = value
    return this.storage.save(this.key, value)
  }
}
