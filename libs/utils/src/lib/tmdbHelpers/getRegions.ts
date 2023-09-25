import _ from 'lodash'
import { callTmdb } from '@reelist/apis/api'

const getRegions = () => {
  return callTmdb('/watch/providers/regions')
    .then(
      item =>
        _.get(item, 'data.data.results') as Array<{
          iso31661: string
          englishName: string
          nativeName: string
        }>,
    )
    .then(items =>
      items.map(item => ({
        id: item.iso31661,
        name: item.englishName,
      })),
    )
}

export const getDefaultRegions = () => {
  if (!navigator) return []

  const options = navigator.languages // options look like: en-US, en
    .filter(language => language.includes('-')) // only grab 'en-US' like options
    .map(language => language.match(/-(.*)/)[1]) // only grab 'US' from each option

  return options
}

export default getRegions
