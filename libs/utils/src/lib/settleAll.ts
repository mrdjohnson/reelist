import _ from 'lodash'

export const settleAll = async <T>(promises: Promise<T>[]) => {
  const videoPromises: Array<{
    status: string
    value?: T | null
  }> = await Promise.allSettled(promises)

  return _.chain(videoPromises).map('value').compact().value()
}
