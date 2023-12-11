import _ from 'lodash'
import { callTmdb } from '@reelist/apis/api'

type Region = {
  iso31661: string
  englishName: string
  nativeName: string
}

const getRegions = () => {
  return callTmdb<{ results: Region[] }>('/watch/providers/regions')
    .then(item => _.get(item, 'data.data.results'))
    .then(items =>
      _.map(items, item => ({
        id: item.iso31661,
        name: item.englishName,
      })),
    )
}

export const getDefaultRegions = () => {
  if (!navigator) return []

  // TODO: default regions should not be based on languages, but based on user's location
  const options = _.chain(navigator.languages) // options look like: en-US, en
    .map(language => language.match(/-(.*)/)?.[1]) // only grab 'US' from options like: 'en-US'
    .compact() // removes empty values
    .value()

  return options
}

export default getRegions
