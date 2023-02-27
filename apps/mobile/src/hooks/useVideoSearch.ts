import { callTmdb } from '@reelist/apis/api'
import _ from 'lodash'
import Video from '@reelist/models/Video'
import { useStore } from '@reelist/utils/hooks/useStore'

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
