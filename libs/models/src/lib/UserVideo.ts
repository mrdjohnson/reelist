import User from '@reelist/models/User'
import UserShow from '@reelist/models/UserShow'
import AbstractUserVideo from '@reelist/models/AbstractUserVideo'
import { TmdbVideoByIdType } from '@reelist/interfaces/tmdb/TmdbVideoByIdType'
import { VideoTableType } from '@reelist/interfaces/tables/VideoTable'
import { TmdbShowByIdResponse } from '@reelist/interfaces/tmdb/TmdbShowResponse'
import { TmdbMovieByIdResponse } from '@reelist/interfaces/tmdb/TmdbMovieResponse'

class UserVideo {
  static create(
    tmdbVideo: TmdbVideoByIdType<TmdbShowByIdResponse>,
    user: User,
    userVideoData?: VideoTableType,
  ): UserShow
  static create(
    tmdbVideo: TmdbVideoByIdType<TmdbMovieByIdResponse>,
    user: User,
    userVideoData?: VideoTableType,
  ): UserMovie
  static create(
    tmdbVideo: TmdbVideoByIdType,
    user: User,
    userVideoData?: VideoTableType,
  ): UserVideoType
  static create(
    tmdbVideo: TmdbVideoByIdType,
    user: User,
    userVideoData?: VideoTableType,
  ): UserVideoType {
    if (tmdbVideo.isTv) {
      return new UserShow(tmdbVideo, user, userVideoData)
    } else {
      return new UserMovie(tmdbVideo, user, userVideoData)
    }
  }
}

export class UserMovie extends AbstractUserVideo {
  override isTv: false = false
}

export type UserVideoType = UserShow | UserMovie

export default UserVideo
