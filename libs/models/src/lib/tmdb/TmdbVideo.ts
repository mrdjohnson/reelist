// import { classFromProps } from '@reelist/utils/ClassHelper'
// import { TmdbBaseVideoType, TmdbVideoResponseType } from '@reelist/interfaces/tmdb/TmdbVideoType'
// import { TmdbVideoByIdFormatter } from '@reelist/utils/tmdbHelpers/TmdbVideoByIdFormatter'
// import { types } from 'mobx-state-tree'
//
// // const TmdbVideo = types.model({})
//
// class TmdbVideo extends classFromProps<TmdbBaseVideoType>() {
//   constructor(json: TmdbVideoResponseType, videoId: string) {
//     const baseVideo = TmdbVideoByIdFormatter.fromTmdbBaseVideo(json, videoId)
//     super(baseVideo)
//   }
//
//   get castNames() {
//     return this.cast.map(c => c.name)
//   }
//
//   get capitalizedCastNames() {
//     return this.castNames.map(c => c.charAt(0).toUpperCase() + c.slice(1))
//   }
//
//   static createTmdbVideo(json: TmdbVideoResponseType, videoId: string) {
//     // const videoData = TmdbVideoMapper.fromTmdbBaseVideo(json, videoId)
//     //
//     // let video
//     // if (videoData.isTv) {
//     //   const baseShow = TmdbVideoMapper.fromTmdbShow(json)
//     //   video = new TmdbShow(json)
//     // } else {
//     //   video = new TmdbVideo(videoData, videoId)
//     // }
//     //
//     // return makeAutoObservable(video)
//   }
// }
//
// // class Example extends TmdbVideo {}
// //
// // const TmdbShow = (() => {
// //
// //
// //    class InnerTmdbShow extends TmdbVideo {
// //     constructor(json: TmdbShowResponseType) {
// //       const baseShow = TmdbVideoMapper.fromTmdbShow(json)
// //       const baseVideo = new TmdbVideo(json, baseShow.videoId)
// //       baseVideo.capitalizedCastNames
// //       super(json, baseShow.videoId)
// //
// //       console.log(this.castNames)
// //     }
// //
// //     get isShow() {
// //       return true
// //     }
// //   } as {
// //     new (args: TmdbShowResponseType): TmdbVideo & TmdbVideoType<TmdbShowResponseType> & InnerTmdbShow
// //   }
// // })()
//
// // const video = new TmdbShow({} as TmdbShowResponseType)
// // const data = video.castNames === video.capitalizedCastNames
// // video.issho
