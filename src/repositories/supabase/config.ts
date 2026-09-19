export const supabaseEnvConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

export const isSupabaseConfigured = Boolean(
  supabaseEnvConfig.url && supabaseEnvConfig.anonKey
);
