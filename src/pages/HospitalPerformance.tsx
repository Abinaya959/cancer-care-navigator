import React from 'react';
import { useData } from '@/lib/data-context';
import { Building2 } from 'lucide-react';

const HospitalPerformance = () => {
  const { hospitalPerformance } = useData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Hospital Performance – Tamil Nadu</h1>
        <p className="text-sm text-muted-foreground">Facility-level diagnostic efficiency rankings</p>
      </div>

      <div className="bg-card rounded-xl border clinical-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Rank</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Hospital</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Patients</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Onco Load/mo</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Avg Dx Delay</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Biopsy TAT</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Referral Eff.</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Machine Util.</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Staffing</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Fragility</th>
              </tr>
            </thead>
            <tbody>
              {hospitalPerformance.map((h, i) => (
                <tr key={h.hospitalId} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="p-3 font-mono text-muted-foreground">{i + 1}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <p className="font-medium text-foreground text-xs">{h.hospitalName}</p>
                        <p className="text-[10px] text-muted-foreground">{h.hospitalId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{h.totalPatients}</td>
                  <td className="p-3 font-mono">{h.oncologyLoad}</td>
                  <td className="p-3 font-mono">{h.avgTimeToDiagnosis}d</td>
                  <td className="p-3 font-mono">{h.biopsyTurnaround}d</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${h.referralEfficiency}%` }} />
                      </div>
                      <span className="text-xs font-mono">{h.referralEfficiency}%</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-xs">{h.machineUtilization}%</td>
                  <td className="p-3 font-mono text-xs">{h.staffingIndex}</td>
                  <td className="p-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                      h.fragilityRanking >= 50 ? 'bg-destructive/10 text-destructive border-destructive/20' :
                      h.fragilityRanking >= 35 ? 'bg-warning/10 text-warning border-warning/20' :
                      'bg-success/10 text-success border-success/20'
                    }`}>{h.fragilityRanking}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HospitalPerformance;
