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

export const createDiscoverShow = (
  json: DiscoverVideoResponseType,
  genreIdMap: Record<number, string>,
) => {
  return createDiscoverVideo(json, true, genreIdMap)
}

export const createDiscoverMovie = (
  json: DiscoverVideoResponseType,
  genreIdMap: Record<number, string>,
) => {
  return createDiscoverVideo(json, false, genreIdMap)
}

export const createDiscoverVideo = (
  { id, ...json }: DiscoverVideoResponseType,
  isTv: boolean,
  genreIdMap: Record<number, string>,
) => {
  return {
    ...json,
    videoName: json.name || json.title,
    videoId: (isTv ? 'tv' : 'mv') + id,
    uiGenres: json.genreIds.map(genreId => genreIdMap[genreId]).sort(),
    isTv,
  }
}

export type DiscoverVideoType = ReturnType<typeof createDiscoverVideo>
