import React, { useState, useMemo } from 'react';
import { useData } from '@/lib/data-context';
import { simulateIntervention } from '@/lib/ml-engine';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

const Simulator = () => {
  const { patients } = useData();
  const [biopsyWait, setBiopsyWait] = useState(30);
  const [referralSpeed, setReferralSpeed] = useState(20);
  const [screening, setScreening] = useState(10);
  const [additionalPathologists, setAdditionalPathologists] = useState(0);
  const [radiotherapyIncrease, setRadiotherapyIncrease] = useState(0);
  const [fastTrack, setFastTrack] = useState(false);

  const result = useMemo(() =>
    simulateIntervention(patients, {
      biopsyWaitReduction: biopsyWait,
      referralSpeedUp: referralSpeed,
      screeningIncrease: screening,
      additionalPathologists,
      radiotherapyMachineIncrease: radiotherapyIncrease,
      fastTrackReferral: fastTrack,
    }),
  [patients, biopsyWait, referralSpeed, screening, additionalPathologists, radiotherapyIncrease, fastTrack]);

  const chartData = [
    { name: 'Avg CSFI', Original: result.originalAvgCSFI, Projected: result.newAvgCSFI },
    { name: 'Avg Delay (d)', Original: result.originalAvgDelay, Projected: result.newAvgDelay },
    { name: 'Stage IV %', Original: result.originalStageIVRate, Projected: result.newStageIVRate },
  ];

  const csfiReduction = result.originalAvgCSFI - result.newAvgCSFI;
  const delayReduction = result.originalAvgDelay - result.newAvgDelay;
  const stageIVReduction = result.originalStageIVRate - result.newStageIVRate;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-foreground">Intervention Simulator – Tamil Nadu</h1>
        <p className="text-sm text-muted-foreground">Model the impact of system-level interventions on cancer care infrastructure</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border p-6 clinical-shadow space-y-5">
          <h3 className="text-sm font-semibold text-foreground">Intervention Parameters</h3>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">Biopsy Wait Reduction</span>
              <span className="font-mono font-medium text-foreground">{biopsyWait}%</span>
            </div>
            <Slider value={[biopsyWait]} onValueChange={v => setBiopsyWait(v[0])} min={20} max={50} step={5} />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">Screening Coverage Increase</span>
              <span className="font-mono font-medium text-foreground">+{screening}%</span>
            </div>
            <Slider value={[screening]} onValueChange={v => setScreening(v[0])} min={10} max={40} step={5} />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">Referral Speed-up</span>
              <span className="font-mono font-medium text-foreground">{referralSpeed}%</span>
            </div>
            <Slider value={[referralSpeed]} onValueChange={v => setReferralSpeed(v[0])} max={100} step={5} />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">Additional Radiotherapy Machines (rural)</span>
              <span className="font-mono font-medium text-foreground">+{radiotherapyIncrease}</span>
            </div>
            <Slider value={[radiotherapyIncrease]} onValueChange={v => setRadiotherapyIncrease(v[0])} max={20} step={1} />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">Additional Pathologists</span>
              <span className="font-mono font-medium text-foreground">+{additionalPathologists}</span>
            </div>
            <Slider value={[additionalPathologists]} onValueChange={v => setAdditionalPathologists(v[0])} max={10} step={1} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="fast-track" className="text-xs text-muted-foreground">Fast-track Referral Policy</Label>
            <Switch id="fast-track" checked={fastTrack} onCheckedChange={setFastTrack} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border p-6 clinical-shadow">
          <h3 className="text-sm font-semibold text-foreground mb-4">Projected Impact for Tamil Nadu</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-success/5 border border-success/20 text-center">
              <p className="text-xl font-bold text-success">-{csfiReduction}</p>
              <p className="text-[10px] text-muted-foreground">CSFI Reduction</p>
            </div>
            <div className="p-3 rounded-lg bg-success/5 border border-success/20 text-center">
              <p className="text-xl font-bold text-success">-{delayReduction}d</p>
              <p className="text-[10px] text-muted-foreground">Delay Reduction</p>
            </div>
            <div className="p-3 rounded-lg bg-success/5 border border-success/20 text-center">
              <p className="text-xl font-bold text-success">-{stageIVReduction}%</p>
              <p className="text-[10px] text-muted-foreground">Stage IV Reduction</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="Original" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Projected" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default Simulator;
