import _ from 'lodash'
import { TmdbShowByIdResponse } from '@reelist/interfaces/tmdb/TmdbShowResponse'
import { TmdbMovieByIdResponse } from '@reelist/interfaces/tmdb/TmdbMovieResponse'
import { TmdbPersonByIdResponse } from '@reelist/interfaces/tmdb/TmdbPersonResponse'

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
