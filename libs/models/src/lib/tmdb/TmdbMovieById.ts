import { TmdbMovieByIdResponse } from '@reelist/interfaces/tmdb/TmdbMovieResponse'
import { TmdbVideoByIdType } from '@reelist/interfaces/tmdb/TmdbVideoByIdType'
import { classFromProps } from '@reelist/utils/ClassHelper'

export abstract class AbstractBaseMovie extends classFromProps<
  TmdbVideoByIdType<TmdbMovieByIdResponse>
>() {}

export class TmdbMovieById extends AbstractBaseMovie {
  override hasUser: false = false
}
