import React from 'react';
import { Patient } from '@/lib/types';
import { CheckCircle, Circle, AlertTriangle } from 'lucide-react';

interface CareTimelineProps {
  patient: Patient;
}

const CareTimeline: React.FC<CareTimelineProps> = ({ patient }) => {
  const steps = [
    { label: 'Symptoms', date: null, active: true, info: `Duration: ${patient.symptomDuration} days` },
    { label: 'First Visit', date: patient.firstVisitDate, active: !!patient.firstVisitDate },
    { label: 'Referral', date: patient.referralDate, active: !!patient.referralDate },
    { label: 'Biopsy', date: patient.biopsyDate, active: !!patient.biopsyDate },
    { label: 'Diagnosis', date: patient.diagnosisDate, active: !!patient.diagnosisDate },
  ];

  return (
    <div className="flex items-start gap-0 overflow-x-auto pb-2">
      {steps.map((step, i) => {
        const isGap = i > 0 && steps[i - 1].active && !step.active;
        return (
          <React.Fragment key={step.label}>
            {i > 0 && (
              <div className={`flex-shrink-0 h-0.5 w-12 mt-3 ${isGap ? 'bg-destructive' : step.active ? 'bg-primary' : 'bg-border'}`}>
                {isGap && (
                  <div className="relative -top-2 left-3">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-col items-center min-w-[80px] flex-shrink-0">
              {step.active ? (
                <CheckCircle className="w-6 h-6 text-primary" />
              ) : (
                <Circle className="w-6 h-6 text-muted-foreground/30" />
              )}
              <span className={`text-xs font-medium mt-1 ${step.active ? 'text-foreground' : 'text-muted-foreground/50'}`}>{step.label}</span>
              <span className="text-[10px] text-muted-foreground">{step.date || step.info || '—'}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default CareTimeline;
