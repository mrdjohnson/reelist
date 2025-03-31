import { PageContextServer } from 'vike/types'

import { TmdbClient } from '@reelist/utils/tmdbHelpers/TmdbClient'
import { TmdbOpenGraphFormatter } from '@reelist/utils/tmdbHelpers/TmdbOpenGraphFormatter'

async function data(pageContext: PageContextServer) {
  const { videoId, personId } = pageContext.urlParsed.search || {}
  let graphData = null

  if (videoId) {
    const video = await TmdbClient.getVideoById(videoId)

    graphData = await TmdbOpenGraphFormatter.fromVideo(video)
  } else if (personId) {
    const person = await TmdbClient.getPersonById(personId)

    graphData = await TmdbOpenGraphFormatter.fromPerson(person)
  }

  console.log('graphData:', JSON.stringify(graphData, null, 2))

  return graphData
}

export type Data = ReturnType<typeof data>

export { data }
