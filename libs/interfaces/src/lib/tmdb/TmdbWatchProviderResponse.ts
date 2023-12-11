// note: for tv shows this only the current season

export type TmdbWatchProviderDataResponse = {
  logoPath: string
  providerId: number
  providerName: string
  displayPriority: number
}

export type TmdbWatchProviderCountry = {
  link: string
  buy: TmdbWatchProviderDataResponse[]
  rent: TmdbWatchProviderDataResponse[]
  flatrate: TmdbWatchProviderDataResponse[]
}

export type TmdbWatchProviderResponse = Record<string, TmdbWatchProviderCountry>
