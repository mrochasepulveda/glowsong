import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env.js';

// Admin client — uses service_role key, bypasses RLS
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
