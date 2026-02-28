import React from 'react';
import { MissedSignalResult } from '@/lib/types';
import { AlertTriangle, Info } from 'lucide-react';

const riskColors = {
  Low: 'text-success border-success/20 bg-success/5',
  Medium: 'text-warning border-warning/20 bg-warning/5',
  High: 'text-destructive border-destructive/20 bg-destructive/5',
};

const MissedSignalPanel: React.FC<{ result: MissedSignalResult }> = ({ result }) => (
  <div className={`rounded-xl border p-4 ${riskColors[result.riskLevel]}`}>
    <div className="flex items-center gap-2 mb-3">
      <AlertTriangle className="w-4 h-4" />
      <span className="font-semibold text-sm">Missed Signal Risk: {result.riskLevel}</span>
      <span className="ml-auto text-xs font-mono opacity-70">Score: {result.score}/100</span>
    </div>
    <div className="space-y-2">
      {result.reasons.map((reason, i) => (
        <div key={i} className="flex items-start gap-2 text-xs">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-60" />
          <span className="text-foreground/80">{reason}</span>
        </div>
      ))}
    </div>
  </div>
);

export default MissedSignalPanel;
