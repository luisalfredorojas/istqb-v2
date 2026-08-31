import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

/**
 * NUNCA uses la clave service_role en el cliente.
 *
 * Vite incrusta cualquier variable VITE_* en el bundle público, así que una
 * service_role aquí queda expuesta a cualquiera que abra el JavaScript, y
 * permite saltarse por completo el RLS.
 *
 * Las operaciones de administración usan el cliente normal `supabase`: las
 * políticas "Admins manage exams/questions" autorizan al administrador por
 * su sesión. Lo que requiera service_role va en una Edge Function.
 */

/**
 * Sesión de administración.
 *
 * La plataforma es pública y no tiene registro: lo único que necesita una
 * sesión es el panel de administración, porque la base de datos exige un
 * admin autenticado para gestionar exámenes.
 */
export const authHelpers = {
  async loginWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async loginWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};
