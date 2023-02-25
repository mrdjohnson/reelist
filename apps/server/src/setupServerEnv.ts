import 'reflect-metadata'

import inversionContainer from '@reelist/models/inversionContainer'
import { SupabaseClient } from '@supabase/supabase-js'
import supabase from '~/supabase'
import Storage, { IStorage, StorageInversionKey } from '~/utils/storage'

inversionContainer.bind<SupabaseClient>(SupabaseClient).toConstantValue(supabase)
inversionContainer.bind<IStorage>(StorageInversionKey).to(Storage).inSingletonScope()
