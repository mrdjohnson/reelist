import UserShow from '@reelist/models/UserShow'
import { UserMovie } from '@reelist/models/UserVideo'
import { TmdbShowById } from '@reelist/models/tmdb/TmdbShowById'
import { TmdbMovieById } from '@reelist/models/tmdb/TmdbMovieById'

export type TmdbVideoType = TmdbShowById | TmdbMovieById

export type AnyVideoType = TmdbVideoType | UserShow | UserMovie

export type AnyShowType = UserShow | TmdbShowById
