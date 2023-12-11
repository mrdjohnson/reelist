import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import { callTmdb } from '@reelist/apis/api'
import { TmdbPersonType, TmdbPersonByIdResponse } from '@reelist/interfaces/tmdb/TmdbPersonResponse'
import { TmdbPersonFormatter } from '@reelist/utils/tmdbHelpers/TmdbPersonFormatter'

class PersonStore {
  tmdbJsonByPersonId: Record<string, TmdbPersonType | null> = {}

  constructor() {
    makeAutoObservable(this)
  }

  getPerson = async (personId: string) => {
    const path = `/person/${personId}`

    let person: TmdbPersonType | null = this.tmdbJsonByPersonId[personId]
    let personResponse: TmdbPersonByIdResponse | null = null

    if (_.isUndefined(person)) {
      personResponse = await callTmdb<TmdbPersonByIdResponse>(path, {
        append_to_response: 'images,combined_credits',
      }).then(item => _.get(item, 'data.data') || null)

      this.tmdbJsonByPersonId[personId] = TmdbPersonFormatter.fromTmdbPersonById(personResponse)
    }

    return this.tmdbJsonByPersonId[personId]
  }
}

export default PersonStore
