import React, { useMemo, useState } from 'react';
import { useData } from '@/lib/data-context';
import StatsCard from '@/components/StatsCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Globe, MapPin, Building2, ClipboardList, Heart } from 'lucide-react';
import { DISTRICTS } from '@/lib/synthetic-data';
import { HOSPITAL_NAMES } from '@/lib/synthetic-data';
import { toast } from 'sonner';

const PublicDashboard = () => {
  const { districtData } = useData();
  const [riskForm, setRiskForm] = useState({ age: '', gender: 'Female', symptoms: '', district: '' });
  const [riskResult, setRiskResult] = useState<{ level: string; message: string } | null>(null);

  const awarenessStats = useMemo(() =>
    [...districtData].sort((a, b) => b.fragilityScore - a.fragilityScore).slice(0, 15).map(d => ({
      district: d.district,
      fragility: d.fragilityScore,
      screening: d.screeningCoverage,
    })),
  [districtData]);

  const hospitals = useMemo(() =>
    Object.entries(HOSPITAL_NAMES).map(([id, name]) => ({ id, name })),
  []);

  const assessRisk = () => {
    const age = parseInt(riskForm.age);
    if (!age || !riskForm.district) { toast.error('Please fill all fields'); return; }
    const symptomCount = riskForm.symptoms.split(',').filter(s => s.trim()).length;
    let score = 0;
    if (age > 50) score += 30;
    else if (age > 40) score += 15;
    if (symptomCount > 2) score += 30;
    else if (symptomCount > 0) score += 15;
    const dist = districtData.find(d => d.district === riskForm.district);
    if (dist && dist.screeningCoverage < 30) score += 20;
    const level = score >= 50 ? 'High' : score >= 25 ? 'Medium' : 'Low';
    const message = level === 'High'
      ? 'We recommend scheduling a screening appointment at your nearest cancer center as soon as possible.'
      : level === 'Medium'
      ? 'Consider scheduling a routine check-up with your healthcare provider.'
      : 'Your risk indicators are low. Continue regular health check-ups.';
    setRiskResult({ level, message });
  };

  const riskColors: Record<string, string> = {
    High: 'text-destructive',
    Medium: 'text-warning',
    Low: 'text-success',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /> Cancer Awareness Dashboard</h1>
        <p className="text-sm text-muted-foreground">Public health information & self-assessment</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Districts Covered" value={districtData.length} icon={<MapPin className="w-5 h-5" />} />
        <StatsCard title="Hospitals Listed" value={hospitals.length} icon={<Building2 className="w-5 h-5" />} variant="primary" />
        <StatsCard title="Avg Screening" value={`${districtData.length ? Math.round(districtData.reduce((a, d) => a + d.screeningCoverage, 0) / districtData.length) : 0}%`} icon={<Heart className="w-5 h-5" />} variant="warning" />
      </div>

      <Tabs defaultValue="assessment">
        <TabsList>
          <TabsTrigger value="assessment">Self-Assessment</TabsTrigger>
          <TabsTrigger value="hospitals">Find Hospitals</TabsTrigger>
          <TabsTrigger value="awareness">District Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border p-6 clinical-shadow">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><ClipboardList className="w-4 h-4 text-primary" /> Risk Self-Assessment</h3>
              <div className="space-y-4">
                <div><Label>Age</Label><Input type="number" value={riskForm.age} onChange={e => setRiskForm(p => ({ ...p, age: e.target.value }))} placeholder="Enter your age" className="mt-1" /></div>
                <div>
                  <Label>Gender</Label>
                  <Select value={riskForm.gender} onValueChange={v => setRiskForm(p => ({ ...p, gender: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>District</Label>
                  <Select value={riskForm.district} onValueChange={v => setRiskForm(p => ({ ...p, district: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select district" /></SelectTrigger>
                    <SelectContent>{DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Symptoms (comma-separated)</Label><Input value={riskForm.symptoms} onChange={e => setRiskForm(p => ({ ...p, symptoms: e.target.value }))} placeholder="e.g., persistent cough, weight loss" className="mt-1" /></div>
                <Button onClick={assessRisk} className="w-full">Assess Risk</Button>
              </div>
            </motion.div>

            {riskResult && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card rounded-xl border p-6 clinical-shadow flex flex-col justify-center">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${riskColors[riskResult.level]}`}>{riskResult.level} Risk</div>
                  <p className="text-sm text-muted-foreground mt-3 max-w-sm mx-auto">{riskResult.message}</p>
                  <Button variant="outline" className="mt-4" onClick={() => toast.info('Appointment request feature coming soon')}>Request Appointment</Button>
                </div>
              </motion.div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="hospitals" className="mt-4">
          <div className="bg-card rounded-xl border clinical-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs">ID</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs">Hospital Name</th>
                </tr></thead>
                <tbody>
                  {hospitals.map(h => (
                    <tr key={h.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="p-3 font-mono text-xs text-muted-foreground">{h.id}</td>
                      <td className="p-3 font-medium">{h.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="awareness" className="mt-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border p-5 clinical-shadow">
            <h3 className="text-sm font-semibold text-foreground mb-4">District Cancer Awareness Stats</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={awarenessStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="district" type="category" width={110} tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="fragility" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} name="Fragility Score" />
                <Bar dataKey="screening" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} name="Screening %" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PublicDashboard;
