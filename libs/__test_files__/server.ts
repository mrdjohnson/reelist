import { setupServer } from 'msw/node'
import { http, HttpResponse, Path, ResponseResolver } from 'msw'

const server = setupServer()

const mockServer = {
  get: (path: Path, response: ResponseResolver) => {
    server.use(http.get(path, response))
  },

  json: (path: Path, response: Object) => {
    server.use(
      http.get(path, () => {
        return HttpResponse.json(response)
      }),
    )
  },

  reset: () => server.resetHandlers(),
}

export { mockServer }

export default server
