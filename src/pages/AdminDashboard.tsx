import React, { useState, useMemo } from 'react';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import { useCancerRecords, useUpdateCancerRecord, useDeleteCancerRecord, useInsertCancerRecord } from '@/hooks/use-cancer-records';
import { logAudit } from '@/lib/audit-logger';
import { useRole } from '@/lib/role-context';
import StatsCard from '@/components/StatsCard';
import AuditLogPanel from '@/components/AuditLogPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, MapPin, Users, Trash2, Edit, Plus, Download, Activity, FileText } from 'lucide-react';
import { DISTRICTS } from '@/lib/synthetic-data';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { role } = useRole();
  const { districtData, patients } = useData();
  const { data: records = [], isLoading } = useCancerRecords();
  const updateMut = useUpdateCancerRecord();
  const deleteMut = useDeleteCancerRecord();
  const insertMut = useInsertCancerRecord();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newRecord, setNewRecord] = useState({ district: '', csfi_score: '50', avg_diagnostic_delay: '60', dropout_rate: '15', stage_iv_percentage: '25', population: '1000', screening_coverage: '40', referral_delay: '20' });

  const csfiRanking = useMemo(() =>
    [...districtData].sort((a, b) => b.fragilityScore - a.fragilityScore).slice(0, 15),
  [districtData]);

  const coverageData = useMemo(() =>
    [...districtData].sort((a, b) => a.screeningCoverage - b.screeningCoverage).slice(0, 15),
  [districtData]);

  const delayPattern = useMemo(() =>
    [...districtData].sort((a, b) => b.avgDelay - a.avgDelay).slice(0, 15),
  [districtData]);

  const handleUpdate = async (id: string) => {
    const old = records.find(r => r.id === id);
    const updates: Record<string, number> = {};
    Object.entries(editForm).forEach(([k, v]) => { if (v !== '') updates[k] = parseFloat(v); });
    try {
      await updateMut.mutateAsync({ id, updates });
      await logAudit({ user_id: user!.id, user_name: user!.name, role, table_name: 'cancer_records', record_id: id, action_type: 'update', old_data: old as any, new_data: updates });
      toast.success('Record updated');
      setEditingId(null);
    } catch { toast.error('Update failed'); }
  };

  const handleDelete = async (id: string) => {
    const old = records.find(r => r.id === id);
    try {
      await deleteMut.mutateAsync(id);
      await logAudit({ user_id: user!.id, user_name: user!.name, role, table_name: 'cancer_records', record_id: id, action_type: 'delete', old_data: old as any });
      toast.success('Record deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleAdd = async () => {
    if (!newRecord.district) { toast.error('Select a district'); return; }
    try {
      const rec = await insertMut.mutateAsync({
        district: newRecord.district,
        csfi_score: parseFloat(newRecord.csfi_score),
        avg_diagnostic_delay: parseFloat(newRecord.avg_diagnostic_delay),
        dropout_rate: parseFloat(newRecord.dropout_rate),
        stage_iv_percentage: parseFloat(newRecord.stage_iv_percentage),
        population: parseInt(newRecord.population),
        screening_coverage: parseFloat(newRecord.screening_coverage),
        referral_delay: parseFloat(newRecord.referral_delay),
      });
      await logAudit({ user_id: user!.id, user_name: user!.name, role, table_name: 'cancer_records', record_id: rec.id, action_type: 'create', new_data: rec as any });
      toast.success('Record added');
      setShowAdd(false);
    } catch { toast.error('Insert failed'); }
  };

  const exportCSV = () => {
    const headers = ['District', 'CSFI', 'Avg Delay', 'Dropout %', 'Stage IV %', 'Population', 'Screening %', 'Referral Delay'];
    const rows = records.map(r => [r.district, r.csfi_score, r.avg_diagnostic_delay, r.dropout_rate, r.stage_iv_percentage, r.population, r.screening_coverage, r.referral_delay].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'cancer_records.csv'; a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">System administration & district oversight</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1" /> Export CSV</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Districts" value={districtData.length} icon={<MapPin className="w-5 h-5" />} />
        <StatsCard title="Total Patients" value={patients.length} icon={<Users className="w-5 h-5" />} />
        <StatsCard title="DB Records" value={records.length} icon={<FileText className="w-5 h-5" />} variant="primary" />
        <StatsCard title="Avg CSFI" value={districtData.length ? Math.round(districtData.reduce((a, d) => a + d.fragilityScore, 0) / districtData.length) : 0} icon={<Activity className="w-5 h-5" />} variant="warning" />
      </div>

      <Tabs defaultValue="analytics">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="records">Records CRUD</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border p-5 clinical-shadow">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> CSFI Ranking</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={csfiRanking} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="district" type="category" width={100} tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="fragilityScore" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} name="CSFI" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border p-5 clinical-shadow">
              <h3 className="text-sm font-semibold text-foreground mb-4">Screening Coverage (Lowest 15)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={coverageData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                  <YAxis dataKey="district" type="category" width={100} tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="screeningCoverage" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} name="Coverage %" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-2 bg-card rounded-xl border p-5 clinical-shadow">
              <h3 className="text-sm font-semibold text-foreground mb-4">Predictive Delay Patterns</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={delayPattern}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="district" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="avgDelay" stroke="hsl(var(--warning))" strokeWidth={2} dot={{ r: 4 }} name="Avg Delay (days)" />
                  <Line type="monotone" dataKey="referralDelay" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} name="Referral Delay" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="records" className="mt-4">
          <div className="flex justify-end mb-3">
            <Dialog open={showAdd} onOpenChange={setShowAdd}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add Record</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add District Record</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Select value={newRecord.district} onValueChange={v => setNewRecord(p => ({ ...p, district: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                    <SelectContent>{DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                  {(['csfi_score', 'avg_diagnostic_delay', 'dropout_rate', 'stage_iv_percentage', 'population', 'screening_coverage', 'referral_delay'] as const).map(field => (
                    <div key={field} className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground w-40 capitalize">{field.replace(/_/g, ' ')}</label>
                      <Input value={(newRecord as any)[field]} onChange={e => setNewRecord(p => ({ ...p, [field]: e.target.value }))} className="flex-1" />
                    </div>
                  ))}
                  <Button onClick={handleAdd} className="w-full">Add Record</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>
          ) : (
            <div className="bg-card rounded-xl border clinical-shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      {['District', 'CSFI', 'Delay', 'Dropout%', 'StageIV%', 'Population', 'Screen%', 'RefDelay', 'Actions'].map(h => (
                        <th key={h} className="text-left p-3 font-medium text-muted-foreground text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(r => (
                      <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-3 font-medium">{r.district}</td>
                        {editingId === r.id ? (
                          <>
                            {['csfi_score', 'avg_diagnostic_delay', 'dropout_rate', 'stage_iv_percentage', 'population', 'screening_coverage', 'referral_delay'].map(f => (
                              <td key={f} className="p-2"><Input className="h-8 text-xs w-20" defaultValue={String((r as any)[f])} onChange={e => setEditForm(p => ({ ...p, [f]: e.target.value }))} /></td>
                            ))}
                            <td className="p-2 flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => handleUpdate(r.id)}>Save</Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3 text-muted-foreground">{r.csfi_score}</td>
                            <td className="p-3 text-muted-foreground">{r.avg_diagnostic_delay}</td>
                            <td className="p-3 text-muted-foreground">{r.dropout_rate}</td>
                            <td className="p-3 text-muted-foreground">{r.stage_iv_percentage}</td>
                            <td className="p-3 text-muted-foreground">{r.population}</td>
                            <td className="p-3 text-muted-foreground">{r.screening_coverage}</td>
                            <td className="p-3 text-muted-foreground">{r.referral_delay}</td>
                            <td className="p-3 flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => { setEditingId(r.id); setEditForm({}); }}><Edit className="w-3.5 h-3.5" /></Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDelete(r.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <AuditLogPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
