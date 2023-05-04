import { callTmdb } from '@reelist/apis/api'
import _ from 'lodash'
import Video from '@reelist/models/Video'
import { useStore } from '@reelist/utils/hooks/useStore'

const useVideoDiscover = () => {
  const { videoStore } = useStore()

  const videoDiscover = async (params: Record<string, string>) => {
    const { tvGenres, movieGenres, tvProviders, movieProviders, ...sharedParams } = params

    const tvParams = {
      ...sharedParams,
      with_genres: tvGenres,
      with_providers: tvProviders,
    }

    const movieParams = {
      ...sharedParams,
      with_genres: movieGenres,
      with_providers: movieProviders,
    }

    const searchResults = await Promise.allSettled([
      callTmdb('/discover/tv', tvParams),
      callTmdb('/discover/movie', movieParams),
    ])
      .then(([tvShows, movies]) => {
        return [
          (_.get(tvShows, 'value.data.data.results') || []) as Video[],
          (_.get(movies, 'value.data.data.results') || []) as Video[],
        ]
      })
      .then(([tvShows, movies]) => {
        return [
          ...tvShows.map(tvShow => 'tv' + tvShow.id),
          ...movies.map(tvShow => 'mv' + tvShow.id),
        ]
      })
      .then(_.compact)

    if (!searchResults) return []

    return videoStore.getVideos(searchResults)
  }

  return videoDiscover
}

export default useVideoDiscover
