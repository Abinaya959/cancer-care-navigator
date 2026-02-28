import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Patient, HospitalPerformance, DistrictData, CancerStage } from './types';
import { generatePatients, HOSPITAL_NAMES, DISTRICT_POPULATION } from './synthetic-data';
import { calculateCSFI, predictDelay, detectMissedSignals } from './ml-engine';

interface DataContextType {
  patients: Patient[];
  addPatient: (p: Patient) => void;
  hospitalPerformance: HospitalPerformance[];
  districtData: DistrictData[];
  backendRecords: BackendRecord[];
  backendLoading: boolean;
  refetchBackend: () => void;
}

export interface BackendRecord {
  id: string;
  district: string;
  csfi_score: number;
  avg_diagnostic_delay: number;
  dropout_rate: number;
  stage_iv_percentage: number;
  population: number;
  screening_coverage: number;
  referral_delay: number;
  date: string;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>(() => generatePatients(1000));
  const [backendRecords, setBackendRecords] = useState<BackendRecord[]>([]);
  const [backendLoading, setBackendLoading] = useState(true);

  const fetchRecords = async () => {
    setBackendLoading(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('cancer_records')
        .select('*')
        .order('district');
      if (!error && data) {
        setBackendRecords(data as BackendRecord[]);
      }
    } catch (err) {
      console.warn('Could not fetch backend records:', err);
    }
    setBackendLoading(false);
  };

  useEffect(() => { fetchRecords(); }, []);

  const addPatient = (p: Patient) => setPatients(prev => [p, ...prev]);

  const hospitalPerformance = useMemo<HospitalPerformance[]>(() => {
    const groups: Record<string, Patient[]> = {};
    patients.forEach(p => {
      if (!groups[p.hospitalId]) groups[p.hospitalId] = [];
      groups[p.hospitalId].push(p);
    });
    return Object.entries(groups).map(([id, pts]) => {
      const delays = pts.map(p => predictDelay(p).expectedDelayDays);
      const csfis = pts.map(p => calculateCSFI(p).score);
      const referralRate = pts.filter(p => p.referralDate).length / pts.length;
      const avgDelay = Math.round(delays.reduce((a, b) => a + b, 0) / delays.length);
      return {
        hospitalId: id,
        hospitalName: HOSPITAL_NAMES[id] || id,
        avgTimeToDiagnosis: avgDelay,
        referralEfficiency: Math.round(referralRate * 100),
        fragilityRanking: Math.round(csfis.reduce((a, b) => a + b, 0) / csfis.length),
        totalPatients: pts.length,
        oncologyLoad: Math.round(pts.length / 12),
        biopsyTurnaround: Math.round(avgDelay * 0.4 + Math.random() * 10),
        machineUtilization: Math.round(60 + Math.random() * 35),
        staffingIndex: Math.round(40 + Math.random() * 55),
      };
    }).sort((a, b) => b.fragilityRanking - a.fragilityRanking);
  }, [patients]);

  const districtData = useMemo<DistrictData[]>(() => {
    // Build from synthetic patients first
    const groups: Record<string, Patient[]> = {};
    patients.forEach(p => {
      if (!groups[p.district]) groups[p.district] = [];
      groups[p.district].push(p);
    });

    const syntheticDistricts = Object.entries(groups).map(([district, pts]) => {
      const delays = pts.map(p => predictDelay(p).expectedDelayDays);
      const csfis = pts.map(p => calculateCSFI(p).score);
      const dropouts = pts.filter(p => p.referralDate && !p.biopsyDate).length / Math.max(pts.filter(p => p.referralDate).length, 1);
      const avgDelay = Math.round(delays.reduce((a, b) => a + b, 0) / delays.length);
      const isUrban = ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'].includes(district);

      const stageCounts: Record<CancerStage, number> = { 'Stage I': 0, 'Stage II': 0, 'Stage III': 0, 'Stage IV': 0 };
      pts.forEach(p => { if (p.stageAtDiagnosis) stageCounts[p.stageAtDiagnosis]++; });
      const diagnosedCount = Math.max(Object.values(stageCounts).reduce((a, b) => a + b, 0), 1);
      const stageDistribution: Record<CancerStage, number> = {
        'Stage I': Math.round((stageCounts['Stage I'] / diagnosedCount) * 100),
        'Stage II': Math.round((stageCounts['Stage II'] / diagnosedCount) * 100),
        'Stage III': Math.round((stageCounts['Stage III'] / diagnosedCount) * 100),
        'Stage IV': Math.round((stageCounts['Stage IV'] / diagnosedCount) * 100),
      };

      return {
        district,
        avgDelay,
        fragilityScore: Math.round(csfis.reduce((a, b) => a + b, 0) / csfis.length),
        dropoutRate: Math.round(dropouts * 100),
        patientCount: pts.length,
        population: DISTRICT_POPULATION[district] || 1000,
        screeningCoverage: Math.round(pts.reduce((a, p) => a + p.screeningCoverage, 0) / pts.length),
        avgBiopsyWait: Math.round(avgDelay * 0.5),
        referralDelay: Math.round(avgDelay * 0.3),
        oncologyCenters: isUrban ? Math.round(2 + Math.random() * 4) : Math.round(Math.random() * 2),
        radiotherapyMachines: isUrban ? Math.round(2 + Math.random() * 5) : Math.round(Math.random() * 2),
        pathologistIndex: isUrban ? Math.round(50 + Math.random() * 40) : Math.round(10 + Math.random() * 40),
        stageDistribution,
      };
    });

    // Override with backend records when available
    if (backendRecords.length > 0) {
      const backendMap = new Map(backendRecords.map(r => [r.district, r]));
      return syntheticDistricts.map(sd => {
        const br = backendMap.get(sd.district);
        if (br) {
          return {
            ...sd,
            fragilityScore: br.csfi_score,
            avgDelay: br.avg_diagnostic_delay,
            dropoutRate: br.dropout_rate,
            population: br.population,
            screeningCoverage: br.screening_coverage,
            referralDelay: br.referral_delay,
            stageDistribution: {
              ...sd.stageDistribution,
              'Stage IV': br.stage_iv_percentage,
            },
          };
        }
        return sd;
      });
    }

    return syntheticDistricts;
  }, [patients, backendRecords]);

  return (
    <DataContext.Provider value={{ patients, addPatient, hospitalPerformance, districtData, backendRecords, backendLoading, refetchBackend: fetchRecords }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
