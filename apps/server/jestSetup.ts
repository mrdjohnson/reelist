import axios from 'axios'
// @ts-ignore
import httpAdapter from 'axios/lib/adapters/http'
// import { SupabaseClient } from '@supabase/supabase-js'
// import { createClient } from '@supabase/supabase-js'
//
// import IStorage, { StorageInversionKey } from '@reelist/utils/storage/storage.interface'
// import { injectable } from 'inversify'

axios.defaults.adapter = httpAdapter

// const supbaseClient = createClient('mock_url', 'mock_key')
//
// inversionContainer.bind<SupabaseClient>(SupabaseClient).toConstantValue(supbaseClient)
//
// @injectable()
// class MockStorage implements IStorage {
//   save = jest.fn().mockImplementation((key: string, value: unknown) => Promise.resolve(true))
//
//   load = jest.fn().mockImplementation(<T>(key: string) => Promise.resolve(null))
//
//   remove = jest.fn().mockImplementation((key: string) => Promise.resolve(true))
//
//   clear = jest.fn().mockImplementation(() => Promise.resolve(true))
// }
//
// inversionContainer.bind<IStorage>(StorageInversionKey).to(MockStorage).inSingletonScope()

import { loadEnvConfig } from '@next/env'

export default async () => {
  const projectDir = process.cwd()
  loadEnvConfig(projectDir)
}
require('dotenv').config({ path: '.env.test.local' })
import '~/setupServerEnv'
