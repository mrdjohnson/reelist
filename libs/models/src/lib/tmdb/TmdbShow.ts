// import moment from 'moment'
// import { extendObservable } from 'mobx'
// import _ from 'lodash'
// import { TmdbVideoSharedResponseType } from './TmdbVideo'
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
// export type TmdbTvSeasonShowResponseType = {
//   airDate: string
//   episodeCount: number
//   id: number
//   name: string
//   overview: string
//   posterPath: string
//   seasonNumber: number
//   voteAverage: number
// }
//
// export type TmdbTvSeasonMap = Record<
//   number,
//   TmdbTvSeasonShowResponseType & {
//     episodes: TmdbTvEpisodeResponseType[]
//   }
// >
//
// export type TmdbShowResponseType = TmdbVideoSharedResponseType & {
//   name: string
//   firstAirDate: string
//   originalName: string
//   episodeRunTime: number[]
//   numberOfEpisodes: number
//   seasons: TmdbTvSeasonShowResponseType[]
//   lastEpisodeToAir: TmdbTvEpisodeResponseType
//   nextEpisodeToAir: string // wtf?
//   aggregateCredits: { cast: TmdbCreditsResponseType[] }
//   type: string
// } & {
//   mediaType: 'tv'
// }
//
// export type TmdbTvEpisodeResponseType = {
//   airDate: string
//   episodeNumber: number
//   id: number
//   name: string
//   overview: string
//   productionCode: string
//   runtime: number
//   seasonNumber: number
//   showId: number
//   stillPath: string
//   voteAverage: number
//   voteCount: number
// }
//
// export const createTmdbShow = (json: TmdbShowResponseType) => {
//   const video = createTmdbBaseVideo({ genreIds: _.map(json.genres, 'id'), ...json })
//
//   return extendObservable(video, {
//     isMovie: false,
//
//     get videoReleaseDate() {
//       return moment(video.firstAirDate)
//     },
//
//     get minEpisodeRunTime() {
//       return _.min(json.episodeRunTime)
//     },
//
//     get totalDurationMinutes() {
//       return json.numberOfEpisodes * this.minEpisodeRunTime
//     },
//
//     get cast() {
//       const allCastMembers = _.toArray(json.credits.cast).concat(
//         _.toArray(json.aggregateCredits?.cast),
//       )
//
//       return _.uniqBy(allCastMembers, 'id')
//     },
//
//     get seasonStrings() {
//       const seasonNumbers = _.map(json.seasons, season => '/season/' + season.seasonNumber)
//
//       // tmdb can handle up to 20 seasons at a time; grab all of them in chunks of 20
//       return _.chunk(seasonNumbers, 20)
//     },
//   })
// }
//
// export const createTmdbCompletedShow = (show: TmdbShowType, seasonMap: TmdbTvSeasonMap) => {
//   return extendObservable(show, {
//     seasonMap,
//   })
// }
//
// type TmdbShowType = ReturnType<typeof createTmdbShow>
// type CompletedTmdbShowType = ReturnType<typeof createTmdbCompletedShow>
