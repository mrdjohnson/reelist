import 'reflect-metadata'

process.env = Object.assign(process.env, {
  NEXT_PUBLIC_TMDB_API_KEY: 'tmdb_api_key',
  NEXT_PUBLIC_SUPABASE_URL: 'http://supabase.url',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'supabase_anon_key',
  NEXT_PUBLIC_BASE_URL: 'http://test:3000',
})

import inversionContainer from '@reelist/models/inversionContainer'

import { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'

import IStorage, { StorageInversionKey } from '@reelist/utils/storage/storage.interface'
import { injectable } from 'inversify'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supbaseClient = createClient(supabaseUrl, supabaseAnonKey)

inversionContainer.bind<SupabaseClient>(SupabaseClient).toConstantValue(supbaseClient)

@injectable()
class MockStorage implements IStorage {
  save = jest.fn().mockImplementation((key: string, value: unknown) => Promise.resolve(true))

  load = jest.fn().mockImplementation(<T>(key: string) => Promise.resolve(null))

  remove = jest.fn().mockImplementation((key: string) => Promise.resolve(true))

  clear = jest.fn().mockImplementation(() => Promise.resolve(true))
}

inversionContainer.bind<IStorage>(StorageInversionKey).to(MockStorage).inSingletonScope()

import server, { mockServer } from '@reelist/apis/__testHelpers__/apiTestHelper'
import { configure } from 'mobx'
import { tmdbBaseVideoFactory } from '@reelist/interfaces/tmdb/__factories__/TmdbBaseVideoResponseFactory'

beforeAll(() => {
  // Start the interception.
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  // Remove any handlers you may have added
  // in individual tests (runtime handlers).
  mockServer.reset()

  // Reset the id of all videos
  tmdbBaseVideoFactory.rewindSequence()
})

afterAll(() => {
  // Disable request interception and clean up.
  server.events.removeAllListeners()
  server.close()
})

configure({
  enforceActions: 'always',
  computedRequiresReaction: true,
  reactionRequiresObservable: true,
  observableRequiresReaction: true,
  disableErrorBoundaries: true,
})