import React, { useState, useMemo } from 'react';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import { detectMissedSignals, predictDelay } from '@/lib/ml-engine';
import { useNavigate } from 'react-router-dom';
import StatsCard from '@/components/StatsCard';
import AuditLogPanel from '@/components/AuditLogPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import { Stethoscope, Users, AlertTriangle, Search, ChevronRight } from 'lucide-react';
import { DISTRICTS } from '@/lib/synthetic-data';

const riskBadge: Record<string, string> = {
  Low: 'bg-success/10 text-success border-success/20',
  Medium: 'bg-warning/10 text-warning border-warning/20',
  High: 'bg-destructive/10 text-destructive border-destructive/20',
};

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { patients } = useData();
  const navigate = useNavigate();
  const [districtFilter, setDistrictFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = patients;
    if (districtFilter !== 'all') list = list.filter(p => p.district === districtFilter);
    if (stageFilter !== 'all') list = list.filter(p => p.stageAtDiagnosis === stageFilter);
    if (typeFilter !== 'all') list = list.filter(p => p.cancerType === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
    }
    return list.slice(0, 100);
  }, [patients, districtFilter, stageFilter, typeFilter, search]);

  const stageDistribution = useMemo(() => {
    const counts: Record<string, number> = { 'Stage I': 0, 'Stage II': 0, 'Stage III': 0, 'Stage IV': 0 };
    patients.forEach(p => { if (p.stageAtDiagnosis) counts[p.stageAtDiagnosis]++; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [patients]);

  const COLORS = ['hsl(var(--success))', 'hsl(var(--accent))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

  const referralSuccess = useMemo(() => {
    const byDistrict: Record<string, { referred: number; biopsied: number }> = {};
    patients.forEach(p => {
      if (!byDistrict[p.district]) byDistrict[p.district] = { referred: 0, biopsied: 0 };
      if (p.referralDate) { byDistrict[p.district].referred++; if (p.biopsyDate) byDistrict[p.district].biopsied++; }
    });
    return Object.entries(byDistrict)
      .map(([district, d]) => ({ district, rate: d.referred ? Math.round((d.biopsied / d.referred) * 100) : 0 }))
      .sort((a, b) => b.rate - a.rate).slice(0, 15);
  }, [patients]);

  const highRiskCount = useMemo(() => patients.filter(p => detectMissedSignals(p).riskLevel === 'High').length, [patients]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2"><Stethoscope className="w-5 h-5 text-primary" /> Doctor Dashboard</h1>
        <p className="text-sm text-muted-foreground">Clinical analytics & patient management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Total Patients" value={patients.length} icon={<Users className="w-5 h-5" />} />
        <StatsCard title="High Risk" value={highRiskCount} icon={<AlertTriangle className="w-5 h-5" />} variant="destructive" />
        <StatsCard title="Diagnosed" value={patients.filter(p => p.stageAtDiagnosis).length} icon={<Stethoscope className="w-5 h-5" />} variant="primary" />
      </div>

      <Tabs defaultValue="patients">
        <TabsList>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="charts">Clinic Charts</TabsTrigger>
          <TabsTrigger value="audit">My Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={districtFilter} onValueChange={setDistrictFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="District" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Districts</SelectItem>{DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Stage" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Stages</SelectItem>{['Stage I','Stage II','Stage III','Stage IV'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Types</SelectItem>{['Breast','Lung','Cervical','Oral','Colorectal'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="bg-card rounded-xl border clinical-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50">
                  {['ID','Name','Age','District','Type','Stage','Risk',''].map(h => <th key={h} className="text-left p-3 font-medium text-muted-foreground text-xs">{h}</th>)}
                </tr></thead>
                <tbody>
                  {filtered.map(p => {
                    const risk = detectMissedSignals(p).riskLevel;
                    return (
                      <tr key={p.id} onClick={() => navigate(`/patient/${p.id}`)} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors">
                        <td className="p-3 font-mono text-xs text-muted-foreground">{p.id}</td>
                        <td className="p-3 font-medium">{p.name}</td>
                        <td className="p-3 text-muted-foreground">{p.age}</td>
                        <td className="p-3 text-muted-foreground">{p.district}</td>
                        <td className="p-3 text-muted-foreground">{p.cancerType}</td>
                        <td className="p-3 text-xs font-mono text-muted-foreground">{p.stageAtDiagnosis || '—'}</td>
                        <td className="p-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${riskBadge[risk]}`}>{risk}</span></td>
                        <td className="p-3"><ChevronRight className="w-4 h-4 text-muted-foreground" /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="charts" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border p-5 clinical-shadow">
              <h3 className="text-sm font-semibold text-foreground mb-4">Stage Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={stageDistribution} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {stageDistribution.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border p-5 clinical-shadow">
              <h3 className="text-sm font-semibold text-foreground mb-4">Referral Success Rate by District</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={referralSuccess} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="district" type="category" width={100} tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="rate" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} name="Success %" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <AuditLogPanel filterRole="doctor" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorDashboard;
