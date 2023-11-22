// import { createTmdbShow, TmdbShowResponseType } from './TmdbShow'
// import { createTmdbMovie, TmdbMovieResponseType } from './TmdbMovie'
//
// type Genre = {
//   id: number
//   name: string
// }
//
// export type TmdbCreditsResponseType = {
//   adult: boolean
//   gender: number
//   id: number
//   knownForDepartment: string
//   name: string
//   originalName: string
//   popularity: number
//   profilePath: string
//   character: string
//   creditId: string
//   order: number
// }
//
// export type TmdbVideoSharedResponseType = {
//   adult: boolean
//   backdropPath: string
//   genres: Genre[]
//   id: number
//   originalLanguage: string
//   overview: string
//   popularity: number
//   posterPath: string
//   originCountry: string[]
//   originalName: string
//   voteAverage: number
//   voteCount: number
//   status: string
//   tagline: string
//   credits: { cast: TmdbCreditsResponseType[] }
//   'watch/providers': { results: Array<{ id: number; name: string }> }
// } & {
//   mediaType: 'tv' | 'mv'
// }
//
// export const createTmdbVideo = (json: TmdbVideoType) => {
//   if (json.mediaType === 'tv') {
//     return createTmdbShow(json)
//   }
//
//   return createTmdbMovie(json)
// }
//
// export type TmdbVideo = ReturnType<typeof createTmdbVideo>
// export type TmdbVideoType = TmdbShowResponseType | TmdbMovieResponseType
