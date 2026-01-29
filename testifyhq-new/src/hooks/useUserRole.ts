import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export type UserRole = 'admin' | 'user';

interface UserRoleData {
  role: UserRole;
  isAdmin: boolean;
}

interface UserWithRole {
  role: UserRole | null;
}

/**
 * Hook para obtener el rol del usuario actual
 */
export function useUserRole(userId: string | undefined) {
  return useQuery({
    queryKey: ['user_role', userId],
    queryFn: async (): Promise<UserRoleData> => {
      if (!userId) {
        return { role: 'user', isAdmin: false };
      }

      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return { role: 'user', isAdmin: false };
      }
      
      if (!data) {
        return { role: 'user', isAdmin: false };
      }

      const userData = data as unknown as UserWithRole;
      const role = userData.role || 'user';
      
      return {
        role,
        isAdmin: role === 'admin',
      };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });
}
