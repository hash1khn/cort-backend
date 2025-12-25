import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Validate environment variables at startup
const validateEnvVars = () => {
  const required = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }

  return {
    url: required.SUPABASE_URL!,
    anonKey: required.SUPABASE_ANON_KEY!,
  };
};

export const supabaseConfig = validateEnvVars();

let supabase: SupabaseClient;

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabase) {
    supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);
  }
  return supabase;
};

