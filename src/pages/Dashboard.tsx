import React, { useMemo } from 'react';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import { calculateCSFI, predictDelay, detectMissedSignals } from '@/lib/ml-engine';
import StatsCard from '@/components/StatsCard';
import { Users, AlertTriangle, Clock, Activity, TrendingUp, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { patients, districtData } = useData();
  const { user } = useAuth();

  const stats = useMemo(() => {
    const signals = patients.map(p => detectMissedSignals(p));
    const delays = patients.map(p => predictDelay(p));
    const csfis = patients.map(p => calculateCSFI(p).score);
    const highRisk = signals.filter(s => s.riskLevel === 'High').length;
    const avgDelay = Math.round(delays.reduce((a, d) => a + d.expectedDelayDays, 0) / delays.length);
    const avgCSFI = Math.round(csfis.reduce((a, b) => a + b, 0) / csfis.length);
    const riskDistribution = [
      { name: 'High', value: signals.filter(s => s.riskLevel === 'High').length, color: 'hsl(var(--risk-high))' },
      { name: 'Medium', value: signals.filter(s => s.riskLevel === 'Medium').length, color: 'hsl(var(--risk-medium))' },
      { name: 'Low', value: signals.filter(s => s.riskLevel === 'Low').length, color: 'hsl(var(--risk-low))' },
    ];
    return { highRisk, avgDelay, avgCSFI, riskDistribution, totalPatients: patients.length };
  }, [patients]);

  const topDistricts = useMemo(() =>
    [...districtData].sort((a, b) => b.fragilityScore - a.fragilityScore).slice(0, 10),
  [districtData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-sm text-muted-foreground">Tamil Nadu Cancer Care Intelligence Overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Patients" value={stats.totalPatients} icon={<Users className="w-5 h-5" />} />
        <StatsCard title="High Risk Signals" value={stats.highRisk} subtitle={`${Math.round(stats.highRisk / stats.totalPatients * 100)}% of total`} icon={<AlertTriangle className="w-5 h-5" />} variant="destructive" />
        <StatsCard title="Avg Expected Delay" value={`${stats.avgDelay}d`} icon={<Clock className="w-5 h-5" />} variant="warning" />
        <StatsCard title="Avg CSFI Score" value={stats.avgCSFI} subtitle="System Fragility" icon={<Activity className="w-5 h-5" />} variant="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-2 bg-card rounded-xl border p-5 clinical-shadow">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top 10 District Fragility Scores – Tamil Nadu</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topDistricts}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="district" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="fragilityScore" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Fragility Score" />
              <Bar dataKey="avgDelay" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} name="Avg Delay (days)" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border p-5 clinical-shadow">
          <h3 className="text-sm font-semibold text-foreground mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={stats.riskDistribution} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {stats.riskDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {stats.riskDistribution.map(r => (
              <div key={r.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />
                <span className="text-muted-foreground">{r.name}: {r.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
