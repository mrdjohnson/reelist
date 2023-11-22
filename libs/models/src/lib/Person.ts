import _ from 'lodash'
import { flow, makeAutoObservable } from 'mobx'
import { Decamelized } from 'humps'
import Video from './Video'

type CastMember = {
  id: number
  name: string
  character: string
  order: number
  profilePath: string
}

type Credits = {
  cast: Video[]
}

class Person {
  id!: number
  adult!: boolean
  alsoKnownAs!: string[]
  biography!: string
  birthday!: string
  deathday!: string
  gender!: number
  homepage!: string
  imdbId!: string
  knownForDepartment!: string
  name!: string
  placeOfBirth!: string
  popularity!: number
  profilePath!: string
  combinedCredits?: Credits
  media: Video[] = []

  constructor(json: Person) {
    Object.assign(this, json)
    this.media = json.combinedCredits?.cast || []
    // makeAutoObservable(this)
  }

  _assignValuesFromJson = (json: Person) => {
    Object.assign(this, json)
  }
}

export type PersonJsonType = Decamelized<Person>

export default Person
