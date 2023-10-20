import _ from 'lodash'
import { callTmdb } from '@reelist/apis/api'

const getGenresByType = async (type: string) => {
  const typeLabel = _.capitalize(type)

  return callTmdb(`/genre/${type}/list`)
    .then(
      item =>
        _.get(item, 'data.data.genres') as Array<{
          id: string
          name: string
        }>,
    )
    .then(items =>
      _.map(items, item => ({
        original: {
          id: 'shared:' + item.id,
          name: item.name,
          originalName: item.name,
          originalId: item.id,
        },
        alternative: {
          id: type + ':' + item.id,
          name: `${item.name} (${typeLabel})`,
          originalName: item.name,
          originalId: item.id,
        },
      })),
    )
    .then(items => _.keyBy(items, 'original.id'))
}

const getGenres = async () => {
  const tvGenresById = await getGenresByType('tv')
  const movieGenresById = await getGenresByType('movie')

  const genreIds = _.uniq(_.keys(tvGenresById).concat(_.keys(movieGenresById)))

  const allGenres = genreIds.map(genreId => {
    const tvGenre = tvGenresById[genreId]
    const movieGenre = movieGenresById[genreId]

    const genre = tvGenre || movieGenre
    const { original, alternative } = genre

    // the id is already the same, make sure the name is too
    if (tvGenre?.original?.name === movieGenre?.original?.name) {
      return original
    } else {
      return alternative
    }
  })

  return allGenres
}

export default getGenres
