import { TmdbPersonType, TmdbPersonByIdResponse } from '@reelist/interfaces/tmdb/TmdbPersonResponse'
import { TmdbVideoPartialFormatter } from './TmdbVideoPartialFormatter'

export class TmdbPersonFormatter {
  static fromTmdbPersonById(json: TmdbPersonByIdResponse | null): TmdbPersonType | null {
    if (!json) return null

    const media = json.combinedCredits.cast.map(TmdbVideoPartialFormatter.fromTmdbSearchVideo)

    return {
      ...json,
      media,
    }
  }
}
