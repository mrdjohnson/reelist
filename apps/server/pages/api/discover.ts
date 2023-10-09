import type { NextApiRequest, NextApiResponse } from 'next'
import _ from 'lodash'

import { callTmdb } from '@reelist/apis/api'
import Video from '@reelist/models/Video'
import { getDiscoverVideos } from '@reelist/apis/TmdbVideoApi'

export default async function discover(req: NextApiRequest, res: NextApiResponse) {
  const { body: params, method } = req

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${method} Not Allowed`)

    return
  }

  const { tvGenres, movieGenres, tvProviders, movieProviders, homePage, ...sharedParams } = params

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
      return [...tvShows.map(tvShow => 'tv' + tvShow.id), ...movies.map(tvShow => 'mv' + tvShow.id)]
    })
    .then(_.compact)
    .then(_.toArray)
    .then(getDiscoverVideos)

  res.status(200).json(searchResults)
}
