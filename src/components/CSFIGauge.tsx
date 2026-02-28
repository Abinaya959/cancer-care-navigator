import React from 'react';

interface CSFIGaugeProps {
  score: number;
  size?: number;
}

const CSFIGauge: React.FC<CSFIGaugeProps> = ({ score, size = 160 }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score >= 60 ? 'hsl(var(--risk-high))' : score >= 35 ? 'hsl(var(--risk-medium))' : 'hsl(var(--risk-low))';
  const label = score >= 60 ? 'Critical' : score >= 35 ? 'Moderate' : 'Stable';

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--gauge-bg))" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="animate-gauge-fill"
        />
      </svg>
      <div className="flex flex-col items-center -mt-[calc(50%+10px)]">
        <span className="text-3xl font-bold text-foreground">{score}</span>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
    </div>
  );
};

export default CSFIGauge;
