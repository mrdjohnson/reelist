import { callTmdb } from '@reelist/apis/api'
import _ from 'lodash'
import {
  TmdbSearchMultiResponseType,
  TmdbSearchVideoResponse,
} from '@reelist/interfaces/tmdb/TmdbSearchResponse'
import { TmdbVideoPartialFormatter } from '@reelist/utils/tmdbHelpers/TmdbVideoPartialFormatter'
import { TmdbVideoPartialType } from '@reelist/interfaces/tmdb/TmdbVideoPartialType'

const isVideo = (json: TmdbSearchMultiResponseType): json is TmdbSearchVideoResponse => {
  return json.mediaType !== 'person'
}

const useVideoSearch = () => {
  const videoSearch = async (
    searchText: string,
    options: Record<string, string | boolean> = {},
  ) => {
    if (!searchText) return []

    const { deepSearch = false, ...params } = options

    const searchResults = await callTmdb<{
      results: TmdbSearchMultiResponseType[]
    }>('/search/multi', { query: searchText, ...params }).then(item =>
      _.get(item, 'data.data.results'),
    )

    if (!searchResults) return []

    if (deepSearch) {
      const videos: TmdbVideoPartialType[] = []

      searchResults.forEach(result => {
        // TODO: maybe add some kind of wording around if there is a connection here or not?
        if (result.mediaType === 'person') {
          videos.push(...TmdbVideoPartialFormatter.fromTmdbSearchPerson(result))
        } else {
          videos.push(TmdbVideoPartialFormatter.fromTmdbSearchVideo(result))
        }
      })

      return videos
    }

    return _.filter(searchResults, isVideo).map(TmdbVideoPartialFormatter.fromTmdbSearchVideo)
  }

  return videoSearch
}

export default useVideoSearch
