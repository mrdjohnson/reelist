import { factory, manyOf, oneOf, primaryKey } from '@mswjs/data'
import { UserTableType } from '@reelist/interfaces/tables/UserTable'

import { ModelDefinitionValue } from '@mswjs/data/lib/glossary'
import { faker } from '@faker-js/faker'
import { AutoSortType, VideoListTableType } from '@reelist/interfaces/tables/VideoListTable'
import { VideoInfoType, VideoTableType } from '@reelist/interfaces/tables/VideoTable'
import moment from 'moment'
import _ from 'lodash'
import { DefaultBodyType, StrictRequest } from 'msw'
import { userFactory } from '@reelist/models/__factories__/UserFactory'
import { videoListFactory } from '@reelist/models/__factories__/VideoListFactory'
import { videoTableTypeFactory } from '@reelist/interfaces/tables/__factories__/VideoTableFactory'
import videoList from '@reelist/models/VideoList'
import { TmdbShowByIdResponse } from '@reelist/interfaces/tmdb/TmdbShowResponse'
import { TmdbMovieByIdType } from '@reelist/interfaces/tmdb/TmdbVideoByIdType'
import { TmdbMovieByIdResponse } from '@reelist/interfaces/tmdb/TmdbMovieResponse'
import { TmdbPersonByIdResponse } from '@reelist/interfaces/tmdb/TmdbPersonResponse'

const BASE_TMDB_URL = 'https://api.themoviedb.org/3'

const getId = (url: string) => url.match('eq.(?<id>.*)')?.groups?.id

const getIds = (url: string) => {
  const result = new URLSearchParams(url).get('id')

  return result?.match(/in\.\((?<ids>[^)]*)/)?.groups?.ids?.split(',')
}

const getUserIds = (url: string) => {
  const result = new URLSearchParams(url).get('admin_ids')

  return result?.match(/cs\.\{(?<adminIds>[^}]*)/)?.groups?.adminIds?.split(',')
}

type UrlHandlerType = {
  url: string
  request: StrictRequest<DefaultBodyType>
}

class TmdbDb {
  private shows: TmdbShowByIdResponse[] = []
  private movies: TmdbMovieByIdResponse[] = []
  private people: TmdbPersonByIdResponse[] = []

  db = {
    createShow: (show: TmdbShowByIdResponse) => {
      this.shows.push(show)
    },

    createMovie: (movie: TmdbMovieByIdResponse) => {
      this.movies.push(movie)
    },

    createPerson: (person: TmdbPersonByIdResponse) => {
      this.people.push(person)
    },
  }

  findShow(id?: number) {
    return _.find(this.shows, { id })
  }

  findMovie(id?: number) {
    return _.find(this.movies, { id })
  }

  findPerson(id?: string) {
    return _.find(this.people, { id })
  }

  async handleTvUrl(id: string) {
    return this.findShow(parseInt(id))
  }

  async handleMovieUrl(id: string) {
    return this.findMovie(parseInt(id))
  }

  reset() {
    this.shows = []
    this.movies = []
    this.people = []
  }
}

const tmdbDb = new TmdbDb()

export { tmdbDb }
