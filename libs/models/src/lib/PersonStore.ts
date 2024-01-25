import { makeAutoObservable } from 'mobx'
import { TmdbPersonType } from '@reelist/interfaces/tmdb/TmdbPersonResponse'
import { TmdbClient } from '@reelist/utils/tmdbHelpers/TmdbClient'

class PersonStore {
  tmdbJsonByPersonId: Record<string, TmdbPersonType | null> = {}

  constructor() {
    makeAutoObservable(this)
  }

  getPerson = async (personId: string) => {
    if (!this.tmdbJsonByPersonId[personId]) {
      this.tmdbJsonByPersonId[personId] = await TmdbClient.getPersonById(personId)
    }

    return this.tmdbJsonByPersonId[personId]
  }
}

export default PersonStore
