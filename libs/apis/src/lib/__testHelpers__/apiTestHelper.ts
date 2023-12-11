import { setupServer } from 'msw/node'
import { DefaultBodyType, http, HttpResponse, Path, StrictRequest } from 'msw'
import { waitFor } from '@testing-library/react'
import { tmdbDb } from '@reelist/apis/__testHelpers__/tmdbServerFactory'
import { supabaseDb } from '@reelist/apis/__testHelpers__/supabaseServerFactory'

const server = setupServer()

export const requestSpy = jest.fn()

type HttpType = 'get' | 'post' | 'patch' | 'delete'
type UrlHandlerType = {
  httpType: HttpType
  request: StrictRequest<DefaultBodyType>
}

const mockServer = {
  json: (path: Path, response: Object) => {
    server.use(
      http.get(path, () => {
        return HttpResponse.json(response)
      }),
    )
  },

  tmdb: {
    db: tmdbDb.db,

    listen: () => {
      const getTableName = (url: string) =>
        url.match('.*/3/(?<tableName>[^/]*)/(?<subType>[^/?]*)?.*')?.groups

      server.use(
        http.get('https://api.themoviedb.org/3*', async ({ request }) => {
          const { tableName, subType } = getTableName(request.url) || {}

          let data = null

          switch (tableName) {
            case 'tv':
              data = await tmdbDb.handleTvUrl(subType)
              break
            case 'movie':
              data = await tmdbDb.handleMovieUrl(subType)
              break

            // case 'videoLists':
            //   data = await supabaseDb.handleVideoListUrl({ url: request.url, httpType, request })
            //   break
          }

          return HttpResponse.json(data)
        }),
      )
    },
  },

  supabase: {
    db: supabaseDb.db,

    listen: () => {
      const getTableName = (url: string) =>
        url.match('.*/v1/(?<tableName>[^?]*)')?.groups?.tableName

      const handleRequest = async ({ httpType, request }: UrlHandlerType) => {
        const tableName = getTableName(request.url)

        let data = null

        // const body = await request.json()
        // requestSpy(body)

        switch (tableName) {
          case 'profiles':
            data = await supabaseDb.handleProfileUrl({ url: request.url, httpType, request })
            break

          case 'videoLists':
            data = await supabaseDb.handleVideoListUrl({ url: request.url, httpType, request })
            break
        }

        return HttpResponse.json(data)
      }

      server.use(
        http.get('http://supabase.url/rest/v1*', async ({ request }) => {
          return await handleRequest({ httpType: 'get', request })
        }),

        http.post('http://supabase.url/rest/v1*', async ({ request }) => {
          return await handleRequest({ httpType: 'post', request })
        }),

        http.patch('http://supabase.url/rest/v1*', async ({ request }) => {
          return await handleRequest({ httpType: 'patch', request })
        }),

        http.delete('http://supabase.url/rest/v1*', async ({ request }) => {
          return await handleRequest({ httpType: 'delete', request })
        }),
      )
    },
  },

  reset: () => {
    server.resetHandlers()
    requestSpy.mockClear()
    supabaseDb.reset()
    tmdbDb.reset()
  },
}

// todo: figure out how to add this in
const expectMockServer = {
  toHaveBeenCalledWith: async (data: Object) => {
    await waitFor(() => expect(requestSpy).toHaveBeenCalledWith(data))
  },
}

export { mockServer, expectMockServer }

export default server
