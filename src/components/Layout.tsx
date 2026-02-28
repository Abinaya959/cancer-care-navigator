import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { useRole, AppRole } from '@/lib/role-context';
import {
  LayoutDashboard, Users, FlaskConical, MapPin, Building2,
  SlidersHorizontal, LogOut, Activity, Shield, Stethoscope,
  HeartPulse, Globe
} from 'lucide-react';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  roles: AppRole[];
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', roles: ['admin', 'doctor', 'health_worker', 'public_user'] },
  { to: '/admin', icon: Shield, label: 'Admin Panel', roles: ['admin'] },
  { to: '/doctor', icon: Stethoscope, label: 'Clinical', roles: ['doctor'] },
  { to: '/health-worker', icon: HeartPulse, label: 'Screening', roles: ['health_worker'] },
  { to: '/public', icon: Globe, label: 'Public Info', roles: ['public_user'] },
  { to: '/patients', icon: Users, label: 'Patients', roles: ['admin', 'doctor'] },
  { to: '/heatmap', icon: MapPin, label: 'Inequality Map', roles: ['admin', 'doctor', 'health_worker'] },
  { to: '/hospitals', icon: Building2, label: 'Hospitals', roles: ['admin', 'doctor'] },
  { to: '/simulator', icon: SlidersHorizontal, label: 'Simulator', roles: ['admin'] },
];

const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrator',
  doctor: 'Doctor',
  health_worker: 'Health Worker',
  public_user: 'Public User',
};

const ROLE_COLORS: Record<AppRole, string> = {
  admin: 'bg-primary/20 text-primary',
  doctor: 'bg-accent/20 text-accent',
  health_worker: 'bg-warning/20 text-warning',
  public_user: 'bg-muted text-muted-foreground',
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { role } = useRole();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };
  const filteredNav = navItems.filter(n => n.roles.includes(role));

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 gradient-sidebar flex flex-col shrink-0 hidden lg:flex">
        <div className="p-5 flex items-center gap-3 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-sidebar-primary-foreground text-sm">CCIP-X</h1>
            <p className="text-[10px] text-sidebar-foreground opacity-60">Tamil Nadu Fragility Edition</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {filteredNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary-foreground font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-medium text-sidebar-primary-foreground truncate">{user?.name}</p>
            <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${ROLE_COLORS[role]}`}>
              {ROLE_LABELS[role]}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-bold text-sm">CCIP-X</span>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${ROLE_COLORS[role]}`}>
              {ROLE_LABELS[role]}
            </span>
          </div>
          <button onClick={handleLogout} className="text-muted-foreground"><LogOut className="w-4 h-4" /></button>
        </div>
        <div className="lg:hidden flex overflow-x-auto border-b border-border bg-card px-2">
          {filteredNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2.5 text-xs whitespace-nowrap border-b-2 transition-colors ${
                  isActive ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground'
                }`
              }
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
