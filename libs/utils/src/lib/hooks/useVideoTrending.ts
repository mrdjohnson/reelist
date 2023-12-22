import { callTmdb } from '@reelist/apis/api'
import _ from 'lodash'
import {
  TmdbSearchMultiResponseType,
  TmdbSearchVideoResponse,
} from '@reelist/interfaces/tmdb/TmdbSearchResponse'
import { TmdbVideoPartialFormatter } from '@reelist/utils/tmdbHelpers/TmdbVideoPartialFormatter'
import { TmdbVideoPartialType } from '@reelist/interfaces/tmdb/TmdbVideoPartialType'
import { useEffect, useState } from 'react'

const isVideo = (json: TmdbSearchMultiResponseType): json is TmdbSearchVideoResponse => {
  return json.mediaType !== 'person'
}

type SearchResponseType = { results: TmdbSearchMultiResponseType[] }

const useVideoTrending = () => {
  const [videos, setVideos] = useState<TmdbVideoPartialType[]>([])
  const getVideos = async () => {
    const trendingResponse = await callTmdb<SearchResponseType>('/trending/all/week')

    const trendingResults = _.get(trendingResponse, 'data.data.results')

    if (!trendingResults) return []

    const allVideos: TmdbVideoPartialType[] = []

    trendingResults.forEach(result => {
      // TODO: maybe add some kind of wording around if there is a connection here or not?
      if (result.mediaType === 'person') {
        allVideos.push(...TmdbVideoPartialFormatter.fromTmdbSearchPerson(result))
      } else {
        allVideos.push(TmdbVideoPartialFormatter.fromTmdbSearchVideo(result))
      }
    })

    return _.chain(allVideos).compact().uniqBy('videoId').value()
  }

  useEffect(() => {
    getVideos().then(setVideos)
  }, [])

  return videos
}

export default useVideoTrending
