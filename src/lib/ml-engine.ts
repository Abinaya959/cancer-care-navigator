import { Patient, MissedSignalResult, DelayPrediction, CSFIResult, RiskLevel } from './types';

export function detectMissedSignals(patient: Patient): MissedSignalResult {
  const reasons: string[] = [];
  let score = 0;

  if (patient.numberOfVisits > 2) {
    score += 30;
    reasons.push(`${patient.numberOfVisits} visits without definitive diagnosis suggests repeated presentations being dismissed.`);
  }

  if (patient.symptomDuration > 60) {
    score += 25;
    reasons.push(`Symptom duration of ${patient.symptomDuration} days exceeds the 60-day threshold for timely investigation.`);
  }

  if (patient.referralDate && !patient.biopsyDate) {
    score += 30;
    reasons.push('Patient was referred but no biopsy was performed — a critical gap in the diagnostic pathway.');
  }

  if (!patient.referralDate && patient.numberOfVisits > 1) {
    score += 15;
    reasons.push('Multiple visits without specialist referral indicates potential under-triage.');
  }

  if (patient.socioeconomicProxy <= 2) {
    score += 10;
    reasons.push('Low socioeconomic proxy score correlates with reduced healthcare access and follow-up.');
  }

  if (patient.accessDistance > 50) {
    score += 10;
    reasons.push(`Access distance of ${patient.accessDistance}km may contribute to care discontinuity.`);
  }

  score = Math.min(score, 100);
  let riskLevel: RiskLevel = 'Low';
  if (score >= 60) riskLevel = 'High';
  else if (score >= 35) riskLevel = 'Medium';

  return { riskLevel, score, reasons };
}

export function predictDelay(patient: Patient): DelayPrediction {
  let probability = 0;

  if (patient.numberOfVisits > 3) probability += 0.2;
  else if (patient.numberOfVisits > 2) probability += 0.1;

  if (patient.symptomDuration > 90) probability += 0.25;
  else if (patient.symptomDuration > 60) probability += 0.15;
  else if (patient.symptomDuration > 30) probability += 0.08;

  if (!patient.referralDate) probability += 0.15;
  if (!patient.biopsyDate) probability += 0.15;

  if (patient.accessDistance > 100) probability += 0.15;
  else if (patient.accessDistance > 50) probability += 0.1;

  if (patient.socioeconomicProxy <= 2) probability += 0.1;

  probability = Math.min(probability, 0.98);

  const expectedDelayDays = Math.round(30 + probability * 120);
  const range: [number, number] = [
    Math.max(0, expectedDelayDays - 20),
    expectedDelayDays + 25,
  ];

  return { probability: Math.round(probability * 100), expectedDelayDays, range };
}

export function calculateCSFI(patient: Patient): CSFIResult {
  const missed = detectMissedSignals(patient);
  const delay = predictDelay(patient);

  const missedSignalWeight = missed.score * 0.3;
  const delayWeight = delay.probability * 0.3;
  const accessWeight = Math.min(patient.accessDistance / 2, 20);
  const dropoutWeight = (!patient.biopsyDate && patient.referralDate ? 15 : 0) +
    (!patient.diagnosisDate ? 5 : 0);

  const score = Math.min(Math.round(missedSignalWeight + delayWeight + accessWeight + dropoutWeight), 100);

  return { score, missedSignalWeight, delayWeight, accessWeight, dropoutWeight };
}

export interface InterventionParams {
  biopsyWaitReduction: number;
  referralSpeedUp: number;
  screeningIncrease: number;
  additionalPathologists: number;
  radiotherapyMachineIncrease: number;
  fastTrackReferral: boolean;
}

export function simulateIntervention(
  patients: Patient[],
  params: InterventionParams
): {
  originalAvgCSFI: number; newAvgCSFI: number;
  originalAvgDelay: number; newAvgDelay: number;
  originalStageIVRate: number; newStageIVRate: number;
} {
  const originalScores = patients.map(p => calculateCSFI(p).score);
  const originalDelays = patients.map(p => predictDelay(p).expectedDelayDays);
  const diagnosedPatients = patients.filter(p => p.stageAtDiagnosis);
  const originalStageIV = diagnosedPatients.filter(p => p.stageAtDiagnosis === 'Stage IV').length;
  const originalStageIVRate = diagnosedPatients.length > 0 ? Math.round((originalStageIV / diagnosedPatients.length) * 100) : 0;

  const pathologistFactor = Math.min(params.additionalPathologists * 3, 15);
  const radiotherapyFactor = Math.min(params.radiotherapyMachineIncrease * 2, 10);
  const fastTrackFactor = params.fastTrackReferral ? 10 : 0;

  const modifiedPatients = patients.map(p => ({
    ...p,
    symptomDuration: Math.max(10, p.symptomDuration - params.screeningIncrease * 0.5 - pathologistFactor * 0.3),
    numberOfVisits: Math.max(1, p.numberOfVisits - Math.floor((params.referralSpeedUp + fastTrackFactor) / 20)),
    biopsyDate: !p.biopsyDate && params.biopsyWaitReduction > 30 ? p.referralDate : p.biopsyDate,
    accessDistance: Math.max(2, p.accessDistance - radiotherapyFactor),
  }));

  const newScores = modifiedPatients.map(p => calculateCSFI(p).score);
  const newDelays = modifiedPatients.map(p => predictDelay(p).expectedDelayDays);

  // Estimate Stage IV reduction based on overall CSFI improvement
  const originalAvgCSFI = Math.round(originalScores.reduce((a, b) => a + b, 0) / originalScores.length);
  const newAvgCSFI = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length);
  const csfiReductionRatio = (originalAvgCSFI - newAvgCSFI) / Math.max(originalAvgCSFI, 1);
  const newStageIVRate = Math.max(0, Math.round(originalStageIVRate * (1 - csfiReductionRatio * 0.8)));

  return {
    originalAvgCSFI,
    newAvgCSFI,
    originalAvgDelay: Math.round(originalDelays.reduce((a, b) => a + b, 0) / originalDelays.length),
    newAvgDelay: Math.round(newDelays.reduce((a, b) => a + b, 0) / newDelays.length),
    originalStageIVRate,
    newStageIVRate,
  };
}
