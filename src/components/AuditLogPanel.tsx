import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Clock, User, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  user_id: string;
  user_name: string | null;
  role: string;
  table_name: string;
  record_id: string | null;
  action_type: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-success/10 text-success border-success/20',
  update: 'bg-warning/10 text-warning border-warning/20',
  delete: 'bg-destructive/10 text-destructive border-destructive/20',
};

const AuditLogPanel: React.FC<{ filterRole?: string }> = ({ filterRole }) => {
  const [roleFilter, setRoleFilter] = useState(filterRole || 'all');
  const [search, setSearch] = useState('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data as AuditLog[]) ?? [];
    },
  });

  const filtered = logs.filter(l => {
    if (roleFilter !== 'all' && l.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        l.user_name?.toLowerCase().includes(q) ||
        l.table_name.toLowerCase().includes(q) ||
        l.action_type.toLowerCase().includes(q) ||
        l.record_id?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        {!filterRole && (
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="doctor">Doctor</SelectItem>
              <SelectItem value="health_worker">Health Worker</SelectItem>
              <SelectItem value="public_user">Public User</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground text-sm">No audit logs found</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(log => (
            <div key={log.id} className="bg-card border rounded-lg p-4 clinical-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${ACTION_COLORS[log.action_type] || 'bg-muted text-muted-foreground'}`}>
                        {log.action_type.toUpperCase()}
                      </span>
                      <span className="text-sm font-medium text-foreground">{log.table_name}</span>
                      {log.record_id && (
                        <span className="text-xs font-mono text-muted-foreground truncate">{log.record_id.slice(0, 8)}…</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{log.user_name || log.user_id}</span>
                      <span className="px-1.5 py-0.5 rounded bg-muted text-xs">{log.role}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}</span>
                    </div>
                  </div>
                </div>
              </div>
              {(log.old_data || log.new_data) && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {log.old_data && (
                    <div className="bg-destructive/5 rounded p-2">
                      <span className="font-medium text-destructive">Before:</span>
                      <pre className="mt-1 overflow-auto max-h-20 text-muted-foreground">{JSON.stringify(log.old_data, null, 2)}</pre>
                    </div>
                  )}
                  {log.new_data && (
                    <div className="bg-success/5 rounded p-2">
                      <span className="font-medium text-success">After:</span>
                      <pre className="mt-1 overflow-auto max-h-20 text-muted-foreground">{JSON.stringify(log.new_data, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditLogPanel;
