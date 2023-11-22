import _ from 'lodash'
import { callTmdb } from '@reelist/apis/api'
import { SelectOption } from '@reelist/utils/SelectState'

type Provider = {
  displayPriorities: Record<string, number>
  displayPriority: string
  logoPath: string
  providerName: string
  providerId: string
}

const getProvidersByType = async (type: string) => {
  const typeLabel = _.capitalize(type)

  return callTmdb<{ results: Provider[] }>(`/watch/providers/${type}`)
    .then(item => _.get(item, 'data.data.results'))
    .then(items => _.sortBy(items, 'displayPriority'))
    .then(items =>
      items.map(item => {
        const displayPriorities = _.keys(item.displayPriorities).map(_.toUpper)

        return {
          original: {
            id: 'shared:' + item.providerId,
            name: item.providerName,
            displayPriorities,
          },

          alternative: {
            id: type + ':' + item.providerId,
            name: `${item.providerName} (${typeLabel})`,
            displayPriorities,
          },
        }
      }),
    )
    .then(items => _.keyBy(items, 'original.id'))
}

export type WatchProviderOptionType = {
  id: string
  name: string
  displayPriorities: string[]
}

// todo; fill in the region when asking for the providers; or sort by selected region code using the (unused) displayPriorities field
// initial options: navigator.languages.filter(language => language.includes('-')).map(language => language.match(/-(.*)/)[1])
const getWatchProviders = async (): Promise<Array<WatchProviderOptionType>> => {
  const tvProvidersById = await getProvidersByType('tv')
  const movieProvidersById = await getProvidersByType('movie')

  const providerIds = _.uniq(_.keys(tvProvidersById).concat(_.keys(movieProvidersById)))

  const allProviders = providerIds.map(providerId => {
    const tvProvider = tvProvidersById[providerId]
    const movieProvider = movieProvidersById[providerId]

    const provider = tvProvider || movieProvider
    const { original, alternative } = provider

    // the id is already the same, make sure the name is too
    if (tvProvider?.original?.name === movieProvider?.original?.name) {
      return original
    } else {
      return alternative
    }
  })

  return allProviders
}

export default getWatchProviders
