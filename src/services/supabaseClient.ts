import { createClient } from '@supabase/supabase-js';

// Reads EXPO_PUBLIC_ or NEXT_PUBLIC_ env variables with fallback to your Supabase project credentials
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://fjqugzspwyubkiysnxwk.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_R0VcwvFzMcsW8SL1lMeR0w_QF5TFvH1';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
