import React, { useMemo, useState } from 'react';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import StatsCard from '@/components/StatsCard';
import AuditLogPanel from '@/components/AuditLogPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import { HeartPulse, MapPin, Users, ClipboardCheck, CalendarClock } from 'lucide-react';
import { DISTRICTS } from '@/lib/synthetic-data';

const HealthWorkerDashboard = () => {
  const { user } = useAuth();
  const { patients, districtData } = useData();
  const [selectedDistrict, setSelectedDistrict] = useState('all');

  const districtMetrics = useMemo(() => {
    if (selectedDistrict === 'all') return districtData;
    return districtData.filter(d => d.district === selectedDistrict);
  }, [districtData, selectedDistrict]);

  const screeningTrend = useMemo(() =>
    [...districtData].sort((a, b) => a.screeningCoverage - b.screeningCoverage).slice(0, 20),
  [districtData]);

  const urbanRural = useMemo(() => {
    const urban = ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'];
    const urbanData = districtData.filter(d => urban.includes(d.district));
    const ruralData = districtData.filter(d => !urban.includes(d.district));
    const avgUrban = urbanData.length ? Math.round(urbanData.reduce((a, d) => a + d.screeningCoverage, 0) / urbanData.length) : 0;
    const avgRural = ruralData.length ? Math.round(ruralData.reduce((a, d) => a + d.screeningCoverage, 0) / ruralData.length) : 0;
    return [
      { type: 'Urban', coverage: avgUrban, districts: urbanData.length },
      { type: 'Rural', coverage: avgRural, districts: ruralData.length },
    ];
  }, [districtData]);

  const followUpPatients = useMemo(() => {
    let list = patients.filter(p => p.referralDate && !p.biopsyDate);
    if (selectedDistrict !== 'all') list = list.filter(p => p.district === selectedDistrict);
    return list.slice(0, 20);
  }, [patients, selectedDistrict]);

  const avgCoverage = districtMetrics.length ? Math.round(districtMetrics.reduce((a, d) => a + d.screeningCoverage, 0) / districtMetrics.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2"><HeartPulse className="w-5 h-5 text-accent" /> Health Worker Dashboard</h1>
          <p className="text-sm text-muted-foreground">Screening & community outreach</p>
        </div>
        <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="District" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Districts</SelectItem>{DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Avg Screening %" value={`${avgCoverage}%`} icon={<ClipboardCheck className="w-5 h-5" />} />
        <StatsCard title="Districts" value={districtMetrics.length} icon={<MapPin className="w-5 h-5" />} variant="primary" />
        <StatsCard title="Follow-ups Needed" value={followUpPatients.length} icon={<CalendarClock className="w-5 h-5" />} variant="warning" />
        <StatsCard title="Patients in Scope" value={patients.filter(p => selectedDistrict === 'all' || p.district === selectedDistrict).length} icon={<Users className="w-5 h-5" />} />
      </div>

      <Tabs defaultValue="screening">
        <TabsList>
          <TabsTrigger value="screening">Screening</TabsTrigger>
          <TabsTrigger value="followup">Follow-ups</TabsTrigger>
          <TabsTrigger value="audit">My Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="screening" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border p-5 clinical-shadow">
              <h3 className="text-sm font-semibold text-foreground mb-4">Screening Coverage by District</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={screeningTrend} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="district" type="category" width={100} tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="screeningCoverage" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} name="Coverage %" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border p-5 clinical-shadow">
              <h3 className="text-sm font-semibold text-foreground mb-4">Urban vs Rural Coverage</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={urbanRural}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="type" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="coverage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Coverage %" />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-3 text-xs text-muted-foreground">
                {urbanRural.map(u => <span key={u.type}>{u.type}: {u.districts} districts, {u.coverage}% avg</span>)}
              </div>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="followup" className="mt-4">
          <div className="bg-card rounded-xl border clinical-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50">
                  {['ID','Name','District','Referred','Days Since','Cancer Type'].map(h => <th key={h} className="text-left p-3 font-medium text-muted-foreground text-xs">{h}</th>)}
                </tr></thead>
                <tbody>
                  {followUpPatients.map(p => {
                    const daysSince = p.referralDate ? Math.round((Date.now() - new Date(p.referralDate).getTime()) / 86400000) : 0;
                    return (
                      <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-3 font-mono text-xs text-muted-foreground">{p.id}</td>
                        <td className="p-3 font-medium">{p.name}</td>
                        <td className="p-3 text-muted-foreground">{p.district}</td>
                        <td className="p-3 text-xs text-muted-foreground">{p.referralDate}</td>
                        <td className="p-3"><span className={`text-xs font-medium ${daysSince > 60 ? 'text-destructive' : daysSince > 30 ? 'text-warning' : 'text-success'}`}>{daysSince}d</span></td>
                        <td className="p-3 text-muted-foreground">{p.cancerType}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <AuditLogPanel filterRole="health_worker" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HealthWorkerDashboard;
