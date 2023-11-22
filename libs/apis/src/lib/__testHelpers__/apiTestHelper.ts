import nock from 'nock'

export const nockHelper = {
  get: (path: RegExp | string) => nock('https://api.themoviedb.org/3').get(new RegExp(path)),
}
