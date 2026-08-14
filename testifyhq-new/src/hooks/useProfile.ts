import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface Profile {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
}

/** Perfil del usuario autenticado (public.users). */
export function useProfile() {
  const { user } = useAuth();

  return useQuery<Profile>({
    queryKey: ['profile', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, display_name, created_at')
        .eq('id', user!.id)
        .single();

      if (error) throw error;

      const row = data as {
        id: string;
        email: string;
        display_name: string | null;
        created_at: string;
      };

      return {
        id: row.id,
        email: row.email,
        displayName: row.display_name,
        createdAt: row.created_at,
      };
    },
  });
}

/**
 * Actualiza los datos editables del perfil. Las columnas de facturación
 * están bloqueadas por RLS, así que solo se puede tocar lo permitido.
 */
export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: { displayName: string }) => {
      const { error } = await supabase
        .from('users')
        // Ver nota en WithdrawalPage: el tipado de escrituras cambia entre
        // versiones menores de supabase-js; el cast evita romper el build.
        .update({ display_name: values.displayName } as never)
        .eq('id', user!.id);

      if (error) throw error;

      // Mantiene sincronizado el metadato de auth (se usa en el Header).
      await supabase.auth.updateUser({
        data: { display_name: values.displayName },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });
}
