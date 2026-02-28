interface AuditLogEntry {
  user_id: string;
  user_name: string;
  role: string;
  table_name: string;
  record_id?: string;
  action_type: 'create' | 'update' | 'delete';
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
}

export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    await supabase.from('audit_logs').insert([{
      user_id: entry.user_id,
      user_name: entry.user_name,
      role: entry.role,
      table_name: entry.table_name,
      record_id: entry.record_id ?? null,
      action_type: entry.action_type,
      old_data: (entry.old_data as any) ?? null,
      new_data: (entry.new_data as any) ?? null,
    }]);
  } catch (e) {
    console.error('Audit log failed:', e);
  }
}
