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

type SearchResponseType = { results: TmdbSearchMultiResponseType[] }

const useVideoSearch = () => {
  const videoSearch = async (
    searchText: string,
    options: Record<string, string | boolean> = {},
  ): Promise<{ videos: TmdbVideoPartialType[] }> => {
    if (!searchText) return { videos: [] }

    const { deepSearch = false, ...params } = options

    const searchResponse = await callTmdb<SearchResponseType>('/search/multi', {
      query: searchText,
      ...params,
    })

    const searchResults = _.get(searchResponse, 'data.data.results')

    if (!searchResults) return { videos: [] }

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

      return { videos }
    }

    return {
      videos: _.filter(searchResults, isVideo).map(TmdbVideoPartialFormatter.fromTmdbSearchVideo),
    }
  }

  return videoSearch
}

export default useVideoSearch
