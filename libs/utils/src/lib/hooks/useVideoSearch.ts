import { callTmdb } from '@reelist/apis/api'
import _ from 'lodash'
import {
  createTmdbSearchVideoResult,
  createTmdbSearchVideosResultsFromSearchPerson,
  TmdbSearchMultiResultResponseType,
  TmdbSearchVideoResultResponseType,
  TmdbSearchVideoResultType,
} from '@reelist/models/tmdb/TmdbSearchVideo'

const isVideo = (
  json: TmdbSearchMultiResultResponseType,
): json is TmdbSearchVideoResultResponseType => json.mediaType !== 'person'

const useVideoSearch = () => {
  const videoSearch = async (
    searchText: string,
    options: Record<string, string | boolean> = {},
  ) => {
    if (!searchText) return []

    const { deepSearch = false, ...params } = options

    const searchResults = await callTmdb('/search/multi', { query: searchText, ...params }).then(
      item => _.get(item, 'data.data.results') as TmdbSearchMultiResultResponseType[],
    )

    if (!searchResults) return []

    if (deepSearch) {
      const videos: TmdbSearchVideoResultType[] = []

      searchResults.forEach(result => {
        if (result.mediaType === 'person') {
          videos.push(...createTmdbSearchVideosResultsFromSearchPerson(result))
        } else {
          videos.push(createTmdbSearchVideoResult(result))
        }
      })

      return videos
    }

    return _.filter(searchResults, isVideo).map(createTmdbSearchVideoResult)
  }

  return videoSearch
}

export default useVideoSearch
