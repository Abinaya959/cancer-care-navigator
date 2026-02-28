import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth-context';

export type AppRole = 'admin' | 'doctor' | 'health_worker' | 'public_user';

interface RoleContextType {
  role: AppRole;
  loading: boolean;
  hasRole: (r: AppRole) => boolean;
}

const ROLE_MAP: Record<string, AppRole> = {
  admin: 'admin',
  doctor: 'doctor',
  health_officer: 'health_worker',
  health_worker: 'health_worker',
  public_user: 'public_user',
};

const RoleContext = createContext<RoleContextType>({
  role: 'public_user',
  loading: true,
  hasRole: () => false,
});

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole>('public_user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole('public_user');
      setLoading(false);
      return;
    }

    // Map from demo auth role
    const mapped = ROLE_MAP[user.role] || 'public_user';
    setRole(mapped);

    // Also try to fetch from user_roles table
    const fetchRole = async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();
        if (data?.role) {
          setRole(data.role as AppRole);
        }
      } catch (err) {
        console.warn('Could not fetch role from database, using mapped role.');
      }
      setLoading(false);
    };
    fetchRole();
  }, [user]);

  const hasRole = (r: AppRole) => role === r;

  return (
    <RoleContext.Provider value={{ role, loading, hasRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
