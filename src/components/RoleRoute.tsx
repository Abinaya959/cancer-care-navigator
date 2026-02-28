import React from 'react';
import { useRole, AppRole } from '@/lib/role-context';
import AccessDenied from './AccessDenied';

interface RoleRouteProps {
  allowed: AppRole[];
  children: React.ReactNode;
}

const RoleRoute: React.FC<RoleRouteProps> = ({ allowed, children }) => {
  const { role, loading } = useRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!allowed.includes(role)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
};

export default RoleRoute;
