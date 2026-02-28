import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/lib/data-context';
import { detectMissedSignals, predictDelay, calculateCSFI } from '@/lib/ml-engine';
import CareTimeline from '@/components/CareTimeline';
import CSFIGauge from '@/components/CSFIGauge';
import MissedSignalPanel from '@/components/MissedSignalPanel';
import { ArrowLeft, User, MapPin, Building2, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { HOSPITAL_NAMES } from '@/lib/synthetic-data';

const PatientDetail = () => {
  const { id } = useParams();
  const { patients } = useData();
  const navigate = useNavigate();
  const patient = patients.find(p => p.id === id);

  if (!patient) return <div className="text-center py-20 text-muted-foreground">Patient not found</div>;

  const missed = detectMissedSignals(patient);
  const delay = predictDelay(patient);
  const csfi = calculateCSFI(patient);

  return (
    <div className="space-y-6 max-w-5xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border p-6 clinical-shadow">
        <div className="flex flex-wrap gap-6 items-start">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <h1 className="text-lg font-bold text-foreground">{patient.name}</h1>
            <p className="text-sm text-muted-foreground">{patient.id} · {patient.age}y · {patient.gender}</p>
            <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{patient.district}</span>
              <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{HOSPITAL_NAMES[patient.hospitalId] || patient.hospitalId}</span>
              <span className="flex items-center gap-1"><Stethoscope className="w-3 h-3" />{patient.numberOfVisits} visits</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">{patient.cancerType}</span>
              {patient.stageAtDiagnosis && (
                <span className="px-2 py-0.5 rounded-md bg-muted text-xs font-mono text-muted-foreground">{patient.stageAtDiagnosis}</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {patient.symptoms.map(s => (
              <span key={s} className="px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground">{s}</span>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="bg-card rounded-xl border p-6 clinical-shadow">
        <h3 className="text-sm font-semibold text-foreground mb-4">Care Timeline</h3>
        <CareTimeline patient={patient} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MissedSignalPanel result={missed} />
        </div>
        <div className="bg-card rounded-xl border p-6 clinical-shadow flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-foreground mb-2">CSFI Score</h3>
          <CSFIGauge score={csfi.score} />
        </div>
      </div>

      <div className="bg-card rounded-xl border p-6 clinical-shadow">
        <h3 className="text-sm font-semibold text-foreground mb-4">Delay Prediction</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-muted">
            <p className="text-2xl font-bold text-foreground">{delay.probability}%</p>
            <p className="text-xs text-muted-foreground">Delay Probability</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted">
            <p className="text-2xl font-bold text-foreground">{delay.expectedDelayDays}d</p>
            <p className="text-xs text-muted-foreground">Expected Delay</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted">
            <p className="text-2xl font-bold text-foreground">{delay.range[0]}–{delay.range[1]}d</p>
            <p className="text-xs text-muted-foreground">Delay Range</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border p-6 clinical-shadow">
        <h3 className="text-sm font-semibold text-foreground mb-3">CSFI Breakdown</h3>
        <div className="space-y-2">
          {[
            { label: 'Missed Signal Weight', value: csfi.missedSignalWeight, max: 30 },
            { label: 'Delay Weight', value: csfi.delayWeight, max: 30 },
            { label: 'Access Distance Factor', value: csfi.accessWeight, max: 20 },
            { label: 'Dropout Probability', value: csfi.dropoutWeight, max: 20 },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-40 shrink-0">{item.label}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(item.value / item.max) * 100}%` }} />
              </div>
              <span className="text-xs font-mono text-foreground w-10 text-right">{item.value.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
