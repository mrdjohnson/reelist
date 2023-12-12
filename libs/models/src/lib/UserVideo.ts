import User from '@reelist/models/User'
import UserShow from '@reelist/models/UserShow'
import AbstractUserVideo from '@reelist/models/AbstractUserVideo'
import { VideoTableType } from '@reelist/interfaces/tables/VideoTable'

import { Mixin } from 'ts-mixer'
import { AbstractBaseMovie, TmdbMovieById } from '@reelist/models/tmdb/TmdbMovieById'
import { TmdbShowById } from '@reelist/models/tmdb/TmdbShowById'
import { TmdbVideoType } from '@reelist/models/Video'

class UserVideo {
  static create(tmdbVideo: TmdbShowById, user: User, userVideoData?: VideoTableType): UserShow
  static create(tmdbVideo: TmdbMovieById, user: User, userVideoData?: VideoTableType): UserMovie
  static create(tmdbVideo: TmdbVideoType, user: User, userVideoData?: VideoTableType): UserVideoType
  static create(
    tmdbVideo: TmdbVideoType,
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

export class UserMovie extends Mixin(AbstractUserVideo, AbstractBaseMovie) {
  override isTv: false = false
  override hasUser: true = true
}

export type UserVideoType = UserShow | UserMovie

export default UserVideo
