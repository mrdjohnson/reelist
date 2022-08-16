import secrets from '~/secrets/secrets-index'
import axios from 'axios'
import humps from 'humps'

const base_url = 'https://api.themoviedb.org/3'
const apiKey = secrets.TMDB_API_KEY

export const callTmdb = async (
  path: string,
  query: string | null = null,
  extra: string | null = '',
) => {
  if (__DEV__) return await localCallTmdb(path, query, extra)

  // // todo: remove this
  if (!__DEV__) return await localCallTmdb(path, query, extra)

  const response = await axios.get(secrets.SERVER_URL + '/api/tmdb', {
    params: {
      path,
      query: (query || '') + extra,
    },
  })

  console.log(secrets.SERVER_URL + '/api/tmdb?path=' + path + '&query=' + (query || '') + extra)

  return humps.camelizeKeys(response)
}

const localCallTmdb = async (
  path: string,
  query: string | null = null,
  extra: string | null = null,
) => {
  console.log('faux tmdb endpoint')

  try {
    let tmdbUrl = base_url + path + '?api_key=' + apiKey

    if (query) {
      tmdbUrl += '&query=' + encodeURI(query)
    }

    if (extra) {
      tmdbUrl += extra
    }

    const { data, status, statusText } = await axios.get(tmdbUrl)

    return { data: { data: humps.camelizeKeys(data), status, statusText } }
  } catch (error) {
    console.log('got error', error)
    return { error }
  }
}

export type UpdateType = {
  videoId: string

  season?: number
  seasonComplete: boolean

  episode?: number
  episodeComplete: boolean

  complete?: boolean
}

export const sendNotifications = async (update: UpdateType) => {
  // todo
}
