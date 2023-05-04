import { callTmdb } from '@reelist/apis/api'
import _ from 'lodash'
import Video from '@reelist/models/Video'
import { useStore } from '@reelist/utils/hooks/useStore'

const useVideoSearch = () => {
  const { auth, videoStore } = useStore()

  const videoSearch = async (
    searchText: string,
    options: Record<string, string | boolean> = {},
  ) => {
    if (!searchText) return []

    const { deepSearch = false, ...params } = options

    const searchResults = await callTmdb('/search/multi', { query: searchText, ...params }).then(
      item => _.get(item, 'data.data.results') as Video[] | null,
    )

    if (!searchResults) return []

    if (deepSearch) {
      const getVideoId = (video: Video) => (video.mediaType === 'movie' ? 'mv' : 'tv') + video.id

      const videoIds: Array<string | null> = []

      searchResults.forEach(result => {
        if (result.mediaType === 'person') {
          // todo: actually search the person and then add all their videos
          videoIds.push(...result.knownFor?.map(getVideoId))
        } else {
          videoIds.push(getVideoId(result))
        }
      })

      return videoStore.getVideos(_.compact(videoIds))
    }

    return searchResults
      .filter(searchResult => ['movie', 'tv'].includes(searchResult.mediaType))
      .map(video => {
        return videoStore.makeUiVideo(video)
      })
  }

  return videoSearch
}

export default useVideoSearch
