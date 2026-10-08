import { createClient } from '@supabase/supabase-js';

// Valores vêm do .env (veja .env.example). A anon key é pública por
// definição — quem protege os dados é o Row Level Security no Supabase.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** false quando o build foi feito sem as variáveis: o app segue 100% local. */
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      // PKCE: o login volta com um ?code= trocado pela sessão no app (seguro
      // pra apps móveis, sem token exposto na URL)
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // web/PWA
    },
  },
);
