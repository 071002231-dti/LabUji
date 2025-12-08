
export enum UserRole {
  ADMIN = 'admin',
  LABORAN = 'laboran', // Digabung dari Petugas & Analis
  CUSTOMER = 'customer',
}

export enum RequestStatus {
  PENDING = 'Menunggu Persetujuan',
  APPROVED = 'Disetujui Admin',
  RECEIVED = 'Sampel Diterima',
  IN_PROGRESS = 'Sedang Diuji',
  COMPLETED = 'Selesai',
  DELIVERED = 'Hasil Dikirim',
}

export interface Lab {
  id: number;
  name: string;
  code: string;
  description: string;
  services: string[]; 
  iconName: string;
}

// --- BAGIAN A-E: FORM DATA MODELS ---

export interface ApplicantData {
  email: string;
  name: string;
  company: string;
  phone: string;
  address: string;
}

export interface ServiceData {
  testType: string;
  purpose: string[]; // Checkbox selections
  purposeDetail?: string; // "Lainnya" input
}

export interface SampleData {
  name: string; // Kode Sampel
  count: number;
  packaging: string;
  description: string;
  estimatedDelivery: string;
  priority: 'Reguler' | 'Mendesak';
  notes?: string;
  photoUrl?: string; // URL foto sampel
}

export interface LogisticsData {
  deliveryMethod: 'Antar Langsung' | 'Ekspedisi';
  specialHandling: string[]; // Pendingin, Fragile, dll
  returnPolicy: 'Dikembalikan' | 'Dimusnahkan' | 'Tidak Perlu';
}

export interface AgreementData {
  dataTruth: boolean;
  understanding: boolean;
}

// --- PROCEDURE MANAGEMENT MODELS ---

export interface ProcedureStep {
  id: number;
  title: string;
  description: string; // Langkah detil
  toolsNeeds?: string; // Kebutuhan alat/bahan
  standardRef?: string; // SNI/ISO reference
  passCriteria?: string; // Kriteria lulus/gagal
  role: UserRole; // Siapa yang mengerjakan step ini
  estimatedDuration?: string; // e.g. "30 menit"
}

export interface ProcedureTemplate {
  id: string;
  serviceName: string; // Link ke testType
  version: string; // Versioning (e.g., "1.0")
  steps: ProcedureStep[];
}

// Runtime: Snapshot prosedur yang sedang berjalan pada request tertentu
export interface RuntimeStep extends ProcedureStep {
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
  completedBy?: string; // User Name
  resultData?: string; // Hasil pengukuran/catatan per step
}

export interface RuntimeProcedure {
  templateId: string;
  templateVersion: string;
  currentStepIndex: number;
  steps: RuntimeStep[];
}

// --- MAIN REQUEST MODEL ---

export interface TestRequest {
  id: string;
  userId: number;
  labId: number;
  labName: string;
  
  // Flattened info for table display
  customerName: string;
  testType: string;
  dateSubmitted: string;
  status: RequestStatus;
  expiryDate?: string;
  
  // Detailed Data (Sections A-E)
  applicationData: {
    applicant: ApplicantData;
    service: ServiceData;
    sample: SampleData;
    logistics: LogisticsData;
    agreements: AgreementData;
  };

  // The Procedure (Runtime)
  procedure?: RuntimeProcedure;
}

export interface User {
  id: number;
  name: string;
  role: UserRole;
  email: string;
  labId?: number; 
  avatar?: string; 
  googleId?: string; 
}

export interface StatMetric {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  iconName: string;
}
