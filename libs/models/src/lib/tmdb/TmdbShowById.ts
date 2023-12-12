import { TmdbShowByIdResponse } from '@reelist/interfaces/tmdb/TmdbShowResponse'
import { TmdbVideoByIdType } from '@reelist/interfaces/tmdb/TmdbVideoByIdType'
import { classFromProps } from '@reelist/utils/ClassHelper'

export abstract class AbstractBaseShow extends classFromProps<
  TmdbVideoByIdType<TmdbShowByIdResponse>
>() {}

export class TmdbShowById extends AbstractBaseShow {
  override hasUser: false = false
}
