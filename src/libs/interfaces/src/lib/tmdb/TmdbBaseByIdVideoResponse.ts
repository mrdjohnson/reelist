import { TmdbBaseVideoResponse } from './TmdbBaseVideoResponse'
import { TmdbWatchProviderResponse } from './TmdbWatchProviderResponse'
import { TmdbPersonCreditResponse } from './TmdbPersonResponse'

export type TmdbBaseByIdVideoResponse = TmdbBaseVideoResponse & {
  'watch/providers': { results: TmdbWatchProviderResponse }
  credits: { cast: TmdbPersonCreditResponse[] }
  genres: Array<{ id: number; name: string }>
}
