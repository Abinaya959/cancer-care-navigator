export type Role = 'doctor' | 'admin' | 'health_officer' | 'health_worker' | 'public_user';

export type RiskLevel = 'Low' | 'Medium' | 'High';

export type Gender = 'Male' | 'Female' | 'Other';

export type CancerType = 'Breast' | 'Lung' | 'Cervical' | 'Oral' | 'Colorectal';

export type CancerStage = 'Stage I' | 'Stage II' | 'Stage III' | 'Stage IV';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  district: string;
  symptoms: string[];
  firstVisitDate: string;
  referralDate: string | null;
  biopsyDate: string | null;
  diagnosisDate: string | null;
  numberOfVisits: number;
  hospitalId: string;
  socioeconomicProxy: number;
  symptomDuration: number;
  accessDistance: number;
  screeningCoverage: number;
  cancerType: CancerType;
  stageAtDiagnosis: CancerStage | null;
}

export interface MissedSignalResult {
  riskLevel: RiskLevel;
  score: number;
  reasons: string[];
}

export interface DelayPrediction {
  probability: number;
  expectedDelayDays: number;
  range: [number, number];
}

export interface CSFIResult {
  score: number;
  missedSignalWeight: number;
  delayWeight: number;
  accessWeight: number;
  dropoutWeight: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface HospitalPerformance {
  hospitalId: string;
  hospitalName: string;
  avgTimeToDiagnosis: number;
  referralEfficiency: number;
  fragilityRanking: number;
  totalPatients: number;
  oncologyLoad: number;
  biopsyTurnaround: number;
  machineUtilization: number;
  staffingIndex: number;
}

export interface DistrictData {
  district: string;
  avgDelay: number;
  fragilityScore: number;
  dropoutRate: number;
  patientCount: number;
  population: number;
  screeningCoverage: number;
  avgBiopsyWait: number;
  referralDelay: number;
  oncologyCenters: number;
  radiotherapyMachines: number;
  pathologistIndex: number;
  stageDistribution: Record<CancerStage, number>;
}
