import 'reflect-metadata'

import inversionContainer from '@reelist/models/inversionContainer'
import { SupabaseClient } from '@supabase/supabase-js'
import supabase from '~/supabase'
import Storage, { IStorage, StorageInversionKey } from '~/utils/storage'

// Remove all logic related to inversionContainer bindings for SupabaseClient, Auth, User, and UserStore
