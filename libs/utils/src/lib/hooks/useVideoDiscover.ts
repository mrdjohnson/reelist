import { useEffect } from 'react'
import _ from 'lodash'
import { useStore } from '@reelist/utils/hooks/useStore'
import { SelectOption } from '@reelist/utils/SelectState'
type WatchProvider = SelectOption & {
  displayPriorities: string[]
}

const useVideoDiscover = (beta = false) => {
  const { tmdbDiscover } = useStore()

  const { regionSelectState, watchProviderSelectState, regionSeparationType, getVideos } =
    tmdbDiscover

  useEffect(() => {
    tmdbDiscover.initFromStorage()
  }, [])

  // changing a region affects which providers are available
  useEffect(() => {
    const regions = _.keys(regionSelectState.selectedOptions)

    if (_.isEmpty(regions)) {
      watchProviderSelectState.setOptionsFilter(null)
      return
    }

    watchProviderSelectState.setOptionsFilter((option: WatchProvider) => {
      if (regionSeparationType === 'includes_every') {
        return _.every(regions, region => option.displayPriorities.includes(region))
      }

      // true if selected regions include any watch provider
      return !!_.find(regions, region => option.displayPriorities.includes(region))
    })
  }, [regionSelectState.selectedOptions, regionSeparationType])

  return tmdbDiscover
}

// hard coded popular generes
const popularGeneresIdsByName = {
  base: [],
  comedy: ['shared:35'],
  actionAndAdventure: ['tv:10759', 'movie:28', 'movie:12'],
  drama: ['shared:18'],
  horror: ['shared:9648'],
  scifi: ['tv:10765', 'movie:878', 'movie:14'],
}

export default useVideoDiscover
