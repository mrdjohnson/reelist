import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import secrets from '~/secrets/secrets-index'

const supabase = createClient(secrets.SUPABASE_URL, secrets.SUPABASE_KEY, {
  localStorage: AsyncStorage,
  detectSessionInUrl: false,
})
export default supabase
export type { User as SupabaseUser } from '@supabase/supabase-js'
