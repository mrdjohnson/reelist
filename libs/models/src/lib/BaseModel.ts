import _ from 'lodash'
import { AnnotationsMap, makeAutoObservable } from 'mobx'

export default class BaseModel {
  ignoredFields: AnnotationsMap<this, never> = {}

  makeAutoObservable = (options: AnnotationsMap<this, never>) => {
    this.ignoredFields = options
    makeAutoObservable(this, options)
  }

  static init = (parseable: string | null) => {
    if (!parseable) return

    const parsed = JSON.parse(parseable)

    Object.assign(this, parsed)
  }

  toString() {
    const stringable: Record<string, unknown> = {}

    _.map(this, (value, key) => {
      if (_.isFunction(value)) return
      if (key in this.ignoredFields) return

      stringable[key] = value
    })

    const result = JSON.stringify(stringable)

    console.log('stringable: ', result)

    return result
  }
}
