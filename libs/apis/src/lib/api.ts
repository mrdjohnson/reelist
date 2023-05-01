import secrets from '@reelist/apis/secrets/secrets-index.json'
import axios from 'axios'
import humps from 'humps'

const base_url = 'https://api.themoviedb.org/3'
const apiKey = secrets.TMDB_API_KEY

export const callTmdb = async (path: string, queryParams: Record<string, string> = {}) => {
  // todo figure out how to get __DEV__ in the libraries
  // if (__DEV__) return await localCallTmdb(path, query, extra)

  // // // todo: remove this
  // if (!__DEV__) return await localCallTmdb(path, query, extra)

  queryParams['api_key'] = apiKey

  let params = '?' + new URLSearchParams(queryParams).toString()

  params = params.replace('%2C', ',')

  return await localCallTmdb(path, params)

  // const response = await axios.get(secrets.SERVER_URL + '/api/tmdb', {
  //   params: {
  //     path,
  //     query: (query || '') + extra,
  //   },
  // })

  // console.log(secrets.SERVER_URL + '/api/tmdb?path=' + path + '&query=' + (query || '') + extra)

  // return humps.camelizeKeys(response)
}

const localCallTmdb = async (path: string, params: string) => {
  // console.log('faux tmdb endpoint')

  try {
    const tmdbUrl = base_url + path + params

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
