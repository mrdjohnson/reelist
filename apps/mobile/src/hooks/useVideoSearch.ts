import { callTmdb } from '~/api/api'
import _ from 'lodash'
import Video from '~/models/Video'
import { useStore } from './useStore'

const useVideoSearch = () => {
  const { auth, videoStore } = useStore()

  const videoSearch = async (searchText: string) => {
    if (!searchText) return []

    const searchResults = await callTmdb('/search/multi', searchText).then(
      item => _.get(item, 'data.data.results') as Video[] | null,
    )

    if (!searchResults) return []

    return searchResults
      .filter(searchResult => ['movie', 'tv'].includes(searchResult.mediaType))
      .map(video => {
        return videoStore.makeUiVideo(video)
      })
  }

  return videoSearch
}

export default useVideoSearch
