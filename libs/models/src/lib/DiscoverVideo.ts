export type DiscoverVideoResponseType = {
  adult?: boolean
  backdropPath: string
  genreIds: number[]
  id: number
  originalLanguage: string
  originalTitle?: string
  overview: string
  popularity: number
  posterPath: string
  releaseDate?: string
  title?: string
  name?: string
  video?: boolean
  voteAverage: number
  voteCount: number
}

export const createDiscoverShow = (json: DiscoverVideoResponseType) => {
  return createDiscoverVideo(json, true)
}

export const createDiscoverMovie = (json: DiscoverVideoResponseType) => {
  return createDiscoverVideo(json, false)
}

export const createDiscoverVideo = ({ id, ...json }: DiscoverVideoResponseType, isTv: boolean) => {
  return {
    ...json,
    videoName: json.name || json.title,
    videoId: (isTv ? 'tv' : 'mv') + id,
    isTv,
  }
}

export type DiscoverVideoType = ReturnType<typeof createDiscoverVideo>
