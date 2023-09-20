import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import { callTmdb } from '@reelist/apis/api'
import Person from '@reelist/models/Person'

class PersonStore {
  tmdbJsonByPersonId: Record<string, Person | null> = {}

  constructor() {
    makeAutoObservable(this)
  }

  makeUiPerson = (json: Person) => {
    return new Person(json)
  }

  getPersons = async (personIds: string[] | undefined) => {
    if (!_.isEmpty(personIds)) return []

    const persons: Array<Person | null> = await Promise.all(personIds.map(this.getPerson))

    return _.compact(persons)
  }

  getPerson = async (personId: string) => {
    const path = `/person/${personId}`

    let person: Person | null = this.tmdbJsonByPersonId[personId]

    if (_.isUndefined(person)) {
      person = await callTmdb(path, {
        append_to_response: 'images,combined_credits',
      }).then(item => _.get(item, 'data.data') || null)

      this.tmdbJsonByPersonId[personId] = person || null
    }

    const uiPerson = person && this.makeUiPerson(person)

    return uiPerson
  }
}

export default PersonStore
