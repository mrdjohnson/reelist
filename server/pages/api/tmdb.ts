import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'

const base_url = 'https://api.themoviedb.org/3'
const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY!

export default async function tmdb(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { path, query },
    method,
  } = req

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${method} Not Allowed`)

    return
  }

  let tmdbUrl = base_url + path + '?api_key=' + apiKey

  if (query) {
    tmdbUrl += '&query=' + encodeURI(query as string)
  }

  console.log('requesting tmdb', tmdbUrl)

  const { data, status, statusText } = await axios.get(tmdbUrl)

  res.status(200).json({ data, status, statusText })
}
