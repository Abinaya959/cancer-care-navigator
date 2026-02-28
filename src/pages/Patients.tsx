import React, { useState, useMemo } from 'react';
import { useData } from '@/lib/data-context';
import { useNavigate } from 'react-router-dom';
import { detectMissedSignals } from '@/lib/ml-engine';
import { Input } from '@/components/ui/input';
import { Search, ChevronRight } from 'lucide-react';

const riskBadge = {
  Low: 'bg-success/10 text-success border-success/20',
  Medium: 'bg-warning/10 text-warning border-warning/20',
  High: 'bg-destructive/10 text-destructive border-destructive/20',
};

const Patients = () => {
  const { patients } = useData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return patients.filter(p =>
      p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.district.toLowerCase().includes(q) || p.cancerType.toLowerCase().includes(q)
    ).slice(0, 100);
  }, [patients, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Patients</h1>
          <p className="text-sm text-muted-foreground">{patients.length} records across Tamil Nadu</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name, ID, district, cancer type..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="bg-card rounded-xl border clinical-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">ID</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Name</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Age</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">District</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Cancer Type</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Stage</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Risk</th>
                <th className="p-3"></th>
              </tr>
            </thead>
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
                    <td className="p-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${riskBadge[risk]}`}>{risk}</span>
                    </td>
                    <td className="p-3"><ChevronRight className="w-4 h-4 text-muted-foreground" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Patients;
