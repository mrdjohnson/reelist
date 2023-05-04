import { getGreeting } from '../support/app.po'
const nock = require('nock')

describe('server', () => {
  beforeEach(() => cy.visit('localhost:4200/discover'))

  it('should display welcome message', async () => {
    console.log('nocking')
    // nock('https://api.themoviedb.org/3')
    //   .get(uri => {
    //     debugger
    //     return uri.includes('genre/tv/list')
    //   })
    //   .reply(200, { genres: [{ id: '1', name: 'game of thrones' }] })

    // nock('https://api.themoviedb.org/3')
    //   .get(/genre\/movie\/list*/)
    //   .reply(200, () => {
    //     debugger
    //     return { genres: [{ id: '1', name: 'avengers' }] }
    //   })

    // cy.intercept('https://api.themoviedb.org/3/genre/tv/*', req => {
    //   req.continue(res => {
    //     res.body = 'some new body'
    //   })
    // })

    debugger
    cy.visit('localhost:4200/discover').then(() => {
      // Custom command example, see `../support/commands.ts` file
      cy.login('my-email@something.com', 'myPassword')

      // Function helper example, see `../support/app.po.ts` file
      getGreeting().contains('Welcome server')
    })
  })
})
