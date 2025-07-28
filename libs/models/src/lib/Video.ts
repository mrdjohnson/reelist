import { TmdbShowById } from '@reelist/models/tmdb/TmdbShowById'
import { TmdbMovieById } from '@reelist/models/tmdb/TmdbMovieById'

export type TmdbVideoType = TmdbShowById | TmdbMovieById

export type AnyVideoType = TmdbVideoType 

export type AnyShowType =  TmdbShowById
