import { Patient, CancerType, CancerStage } from './types';

export const DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
  'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
  'Kanniyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
  'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
  'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
  'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
  'Tirupattur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
  'Vellore', 'Viluppuram', 'Virudhunagar',
];

// Approximate population distribution (in thousands)
export const DISTRICT_POPULATION: Record<string, number> = {
  'Chennai': 7088, 'Coimbatore': 3458, 'Madurai': 3038, 'Tiruchirappalli': 2722,
  'Salem': 3482, 'Tirunelveli': 3077, 'Tiruvallur': 3728, 'Chengalpattu': 2557,
  'Kanchipuram': 1166, 'Vellore': 1614, 'Erode': 2252, 'Tiruppur': 2479,
  'Viluppuram': 2093, 'Cuddalore': 2606, 'Thanjavur': 2405, 'Dindigul': 2159,
  'Kanniyakumari': 1870, 'Thoothukudi': 1750, 'Nagapattinam': 1616,
  'Ramanathapuram': 1353, 'Sivaganga': 1339, 'Virudhunagar': 1943,
  'Namakkal': 1726, 'Krishnagiri': 1879, 'Dharmapuri': 1506, 'Karur': 1064,
  'Ariyalur': 754, 'Perambalur': 565, 'Pudukkottai': 1619, 'Theni': 1245,
  'Nilgiris': 735, 'Tiruvannamalai': 2464, 'Ranipet': 1210, 'Tirupattur': 1111,
  'Kallakurichi': 1370, 'Tenkasi': 1407, 'Mayiladuthurai': 918, 'Tiruvarur': 1264,
};

const HOSPITALS: string[] = [
  'RGGGH-CHN', 'STANLEY-CHN', 'KILPAUK-CHN', 'MMC-CHN', 'WIA-CHN',
  'TNGMSSH-CHN', 'CMC-CBE', 'RAJAJI-MDU', 'TVMC-TLV', 'TMC-TNJ',
  'SGMKMC-SLM', 'TGH-TRY', 'VGMC-VLR', 'CGMC-CPT', 'TGH-TPR', 'TGMC-TUT',
];

export const HOSPITAL_NAMES: Record<string, string> = {
  'RGGGH-CHN': 'Rajiv Gandhi Govt. General Hospital, Chennai',
  'STANLEY-CHN': 'Govt. Stanley Medical College Hospital',
  'KILPAUK-CHN': 'Govt. Kilpauk Medical College Hospital',
  'MMC-CHN': 'Madras Medical College',
  'WIA-CHN': 'Adyar Cancer Institute (WIA)',
  'TNGMSSH-CHN': 'TN Govt. Multi Super Specialty Hospital',
  'CMC-CBE': 'Coimbatore Medical College Hospital',
  'RAJAJI-MDU': 'Madurai Rajaji Govt. Hospital',
  'TVMC-TLV': 'Tirunelveli Medical College Hospital',
  'TMC-TNJ': 'Thanjavur Medical College Hospital',
  'SGMKMC-SLM': 'Salem Govt. Mohan Kumaramangalam MC',
  'TGH-TRY': 'Tiruchirappalli Govt. Hospital',
  'VGMC-VLR': 'Vellore Govt. Medical College Hospital',
  'CGMC-CPT': 'Chengalpattu Govt. Medical College Hospital',
  'TGH-TPR': 'Tiruppur Govt. Hospital',
  'TGMC-TUT': 'Thoothukudi Govt. Medical College Hospital',
};

const SYMPTOMS: string[] = [
  'Persistent cough', 'Unexplained weight loss', 'Fatigue', 'Lump/mass',
  'Bleeding', 'Pain', 'Skin changes', 'Difficulty swallowing',
  'Night sweats', 'Bowel habit change', 'Non-healing ulcer', 'Hoarseness',
  'White/red patch in mouth', 'Persistent headache',
];

const CANCER_TYPES: CancerType[] = ['Breast', 'Lung', 'Cervical', 'Oral', 'Colorectal'];
const CANCER_STAGES: CancerStage[] = ['Stage I', 'Stage II', 'Stage III', 'Stage IV'];

const FIRST_NAMES = [
  'Arun', 'Bala', 'Chitra', 'Devi', 'Ezhil', 'Ganesh', 'Hari', 'Indira',
  'Jaya', 'Karthik', 'Lakshmi', 'Murugan', 'Nirmala', 'Priya', 'Rajesh',
  'Saranya', 'Tamil', 'Uma', 'Vasanth', 'Yamuna', 'Anbu', 'Deepa',
  'Gowri', 'Kavitha', 'Mani', 'Nandini', 'Pandiyan', 'Revathi',
  'Senthil', 'Valli', 'Selvi', 'Kumaran', 'Meena', 'Surya', 'Thenmozhi',
];
const LAST_NAMES = [
  'Murugan', 'Selvan', 'Pandian', 'Rajan', 'Krishnan', 'Sundaram',
  'Natarajan', 'Subramanian', 'Venkatesh', 'Palani', 'Shanmugam',
  'Thirunavukkarasu', 'Govindaraj', 'Manikandan', 'Annamalai',
];

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick<T>(arr: T[]): T { return arr[rand(0, arr.length - 1)]; }
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
function dateStr(base: Date, offsetDays: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

// Weight districts by population for realistic distribution
function pickWeightedDistrict(): string {
  const totalPop = Object.values(DISTRICT_POPULATION).reduce((a, b) => a + b, 0);
  let r = Math.random() * totalPop;
  for (const [district, pop] of Object.entries(DISTRICT_POPULATION)) {
    r -= pop;
    if (r <= 0) return district;
  }
  return DISTRICTS[0];
}

export function generatePatients(count: number = 1000): Patient[] {
  const patients: Patient[] = [];
  const baseDate = new Date('2024-01-01');

  for (let i = 0; i < count; i++) {
    const firstVisitOffset = rand(0, 365);
    const symptomDuration = rand(7, 180);
    const hasReferral = Math.random() > 0.25;
    const hasBiopsy = hasReferral && Math.random() > 0.35;
    const hasDiagnosis = hasBiopsy && Math.random() > 0.2;
    const district = pickWeightedDistrict();
    const isUrban = ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'].includes(district);

    patients.push({
      id: `TN-${String(i + 1).padStart(4, '0')}`,
      name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      age: rand(25, 80),
      gender: pick(['Male', 'Female', 'Other'] as const),
      district,
      symptoms: pickN(SYMPTOMS, rand(1, 4)),
      firstVisitDate: dateStr(baseDate, firstVisitOffset),
      referralDate: hasReferral ? dateStr(baseDate, firstVisitOffset + rand(5, isUrban ? 30 : 60)) : null,
      biopsyDate: hasBiopsy ? dateStr(baseDate, firstVisitOffset + rand(30, isUrban ? 80 : 120)) : null,
      diagnosisDate: hasDiagnosis ? dateStr(baseDate, firstVisitOffset + rand(60, 180)) : null,
      numberOfVisits: rand(1, 8),
      hospitalId: pick(HOSPITALS),
      socioeconomicProxy: rand(1, 5),
      symptomDuration,
      accessDistance: isUrban ? rand(2, 30) : rand(15, 150),
      screeningCoverage: isUrban ? rand(30, 90) : rand(10, 50),
      cancerType: pick(CANCER_TYPES),
      stageAtDiagnosis: hasDiagnosis ? pick(CANCER_STAGES) : null,
    });
  }
  return patients;
}
