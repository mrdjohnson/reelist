import { callTmdb } from '@reelist/apis/api'
import _ from 'lodash'
import Video from '@reelist/models/Video'
import { useStore } from '@reelist/utils/hooks/useStore'

const useVideoDiscover = () => {
  const { videoStore } = useStore()

  const videoDiscover = async (params: Record<string, string>) => {
    const searchResults = await Promise.allSettled([
      callTmdb('/discover/tv', params),
      callTmdb('/discover/movie', params),
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

    // todo: this is not working for movies right now, its trying to get collections
    return videoStore.getVideos(searchResults)
  }

  return videoDiscover
}

export default useVideoDiscover
