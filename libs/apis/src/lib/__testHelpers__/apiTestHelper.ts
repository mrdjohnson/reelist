import { setupServer } from 'msw/node'
import { http, HttpResponse, Path, ResponseResolver } from 'msw'
import { waitFor } from '@testing-library/react'

const server = setupServer()

export const requestSpy = jest.fn()

server.events.on('request:start', async ({ request }) => {
  try {
    await request.clone().json().then(requestSpy)
  } catch (e) {
    // this happens because the spied on value is not read from
    console.error('unable to spy on request for ' + request.url)
  }
})

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

  supabase: {
    patch: (path: Path, response: Object) => {
      server.use(
        http.patch('http://supabase.url/rest/v1' + path, async ({ request }) => {
          return HttpResponse.json(response)
        }),
      )
    },
  },

  reset: () => {
    server.resetHandlers()
    requestSpy.mockClear()
  },
}

const expectMockServer = {
  toHaveBeenCalledWith: async (data: Object) => {
    await waitFor(() => expect(requestSpy).toHaveBeenCalledWith(data))
  },
}

export { mockServer, expectMockServer }

export default server
