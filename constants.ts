
import { Lab, RequestStatus, TestRequest, StatMetric, ProcedureTemplate, UserRole } from './types';

export const LABS: Lab[] = [
  {
    id: 1,
    name: 'Lab Manufaktur & Pengujian Tekstil',
    code: 'TEXTILE',
    description: 'Fasilitas uji material tekstil dan serat.',
    services: ['Pengujian Nomor Benang', 'Pengujian Anyaman', 'Pengujian Tetal Benang'],
    iconName: 'Scissors'
  },
  {
    id: 2,
    name: 'Lab Penelitian Teknik Kimia',
    code: 'CHEM',
    description: 'Analisis kandungan kimia dan material.',
    services: ['Pengujian Kadar Air', 'Pengujian Kadar Abu'],
    iconName: 'Beaker'
  },
  {
    id: 3,
    name: 'Lab Forensik Digital',
    code: 'DIGITAL',
    description: 'Investigasi bukti digital dan elektronik.',
    services: ['Pemeriksaan Komputer', 'Pemeriksaan Handphone'],
    iconName: 'Binary'
  }
];

// --- MOCK PROCEDURE TEMPLATES (SOP) ---
export const PROCEDURE_TEMPLATES: ProcedureTemplate[] = [
  {
    id: 'SOP-KIM-001',
    serviceName: 'Pengujian Kadar Air',
    version: '1.2',
    steps: [
      {
        id: 1,
        title: 'Persiapan Cawan',
        description: 'Panaskan cawan kosong dalam oven pada suhu 105°C selama 30 menit, dinginkan dalam desikator, lalu timbang (W1).',
        toolsNeeds: 'Cawan porselen, Oven, Desikator, Neraca Analitik',
        standardRef: 'SNI 01-2891-1992',
        role: UserRole.LABORAN,
        estimatedDuration: '45 menit'
      },
      {
        id: 2,
        title: 'Penimbangan Sampel',
        description: 'Timbang sampel sebanyak 2-5 gram ke dalam cawan yang sudah diketahui bobotnya (W2).',
        toolsNeeds: 'Neraca Analitik',
        role: UserRole.LABORAN,
        estimatedDuration: '10 menit'
      },
      {
        id: 3,
        title: 'Pengovenan',
        description: 'Masukkan cawan berisi sampel ke dalam oven suhu 105°C selama minimal 3 jam hingga bobot konstan.',
        toolsNeeds: 'Oven',
        role: UserRole.LABORAN,
        estimatedDuration: '3 jam'
      },
      {
        id: 4,
        title: 'Pendinginan & Penimbangan Akhir',
        description: 'Dinginkan dalam desikator dan timbang bobot akhir (W3).',
        toolsNeeds: 'Desikator, Neraca Analitik',
        role: UserRole.LABORAN,
        estimatedDuration: '30 menit'
      },
      {
        id: 5,
        title: 'Perhitungan & Validasi',
        description: 'Hitung kadar air dengan rumus: ((W2-W3)/(W2-W1)) x 100%. Validasi hasil perhitungan.',
        passCriteria: 'Deviasi antar duplo maks 5%',
        role: UserRole.ADMIN, // Disetujui/Dihitung ulang oleh Kepala Lab/Admin
        estimatedDuration: '15 menit'
      }
    ]
  },
  {
    id: 'SOP-KIM-002',
    serviceName: 'Pengujian Kadar Abu',
    version: '1.0',
    steps: [
      {
        id: 1,
        title: 'Persiapan Cawan Pengabuan',
        description: 'Panaskan cawan dalam tanur pada suhu 550°C, dinginkan dalam desikator, dan timbang (W1).',
        toolsNeeds: 'Cawan Porselen, Tanur, Desikator',
        standardRef: 'SNI 01-2891-1992',
        role: UserRole.LABORAN,
        estimatedDuration: '1 jam'
      },
      {
        id: 2,
        title: 'Pengabuan Sampel',
        description: 'Timbang 2-3g sampel (W2). Panaskan di atas kompor listrik hingga tidak berasap, lalu masukkan ke tanur 550°C hingga abu berwarna putih kelabu.',
        toolsNeeds: 'Tanur, Kompor Listrik',
        role: UserRole.LABORAN,
        estimatedDuration: '5 jam'
      },
      {
        id: 3,
        title: 'Penimbangan Sisa Abu',
        description: 'Dinginkan cawan berisi abu dalam desikator, lalu timbang bobot konstan (W3).',
        role: UserRole.LABORAN,
        estimatedDuration: '30 menit'
      },
      {
        id: 4,
        title: 'Verifikasi Hasil',
        description: 'Hitung persentase kadar abu dan verifikasi data.',
        role: UserRole.ADMIN,
        estimatedDuration: '15 menit'
      }
    ]
  },
  {
    id: 'SOP-FOR-002',
    serviceName: 'Pemeriksaan Handphone',
    version: '2.0',
    steps: [
      {
        id: 1,
        title: 'Penerimaan & Dokumentasi Fisik',
        description: 'Foto kondisi fisik HP dari 6 sisi. Catat IMEI, Serial Number, dan kondisi layar/baterai.',
        toolsNeeds: 'Kamera Digital, Form Chain of Custody',
        role: UserRole.LABORAN,
        estimatedDuration: '20 menit'
      },
      {
        id: 2,
        title: 'Isolasi Jaringan (Faraday)',
        description: 'Pastikan HP dalam mode pesawat atau masukkan ke Faraday Bag untuk mencegah remote wiping.',
        toolsNeeds: 'Faraday Bag',
        standardRef: 'ISO/IEC 27037',
        role: UserRole.LABORAN,
        estimatedDuration: '5 menit'
      },
      {
        id: 3,
        title: 'Ekstraksi Data (Imaging)',
        description: 'Lakukan ekstraksi fisik/logikal menggunakan software forensik (e.g., Cellebrite/Oxygen).',
        toolsNeeds: 'Cellebrite UFED / Workstation',
        role: UserRole.LABORAN,
        estimatedDuration: '2 - 4 jam'
      },
      {
        id: 4,
        title: 'Analisis Data',
        description: 'Analisis artefak digital (Chat, Call Log, Lokasi) sesuai permintaan penyidik.',
        role: UserRole.LABORAN,
        estimatedDuration: 'Variable'
      },
      {
        id: 5,
        title: 'Pembuatan Laporan (Report)',
        description: 'Generate laporan hasil analisis dan hash value untuk integritas.',
        role: UserRole.ADMIN,
        estimatedDuration: '1 jam'
      }
    ]
  },
  {
    id: 'SOP-FOR-001',
    serviceName: 'Pemeriksaan Komputer',
    version: '1.0',
    steps: [
      {
        id: 1,
        title: 'Bongkar & Dokumentasi HDD',
        description: 'Bongkar casing PC/Laptop, dokumentasikan serial number Harddisk/SSD, foto fisik.',
        toolsNeeds: 'Toolkit Obeng, Kamera',
        role: UserRole.LABORAN,
        estimatedDuration: '30 menit'
      },
      {
        id: 2,
        title: 'Write Blocking',
        description: 'Sambungkan HDD ke Write Blocker hardware sebelum dihubungkan ke workstation forensik.',
        toolsNeeds: 'Tableau Write Blocker',
        role: UserRole.LABORAN,
        estimatedDuration: '5 menit'
      },
      {
        id: 3,
        title: 'Acquisition / Imaging',
        description: 'Lakukan bit-by-bit copy (E01 format) dari barang bukti ke storage lab.',
        toolsNeeds: 'FTK Imager',
        role: UserRole.LABORAN,
        estimatedDuration: '2-5 jam (tergantung size)'
      },
      {
        id: 4,
        title: 'Analisis File System',
        description: 'Recovery deleted files, analisis registry, dan internet history.',
        role: UserRole.LABORAN,
        estimatedDuration: 'Variable'
      },
      {
        id: 5,
        title: 'Validasi Hash',
        description: 'Verifikasi nilai Hash MD5/SHA1 antara barang bukti asli dan hasil image.',
        role: UserRole.ADMIN,
        estimatedDuration: '15 menit'
      }
    ]
  },
  {
    id: 'SOP-TEX-001',
    serviceName: 'Pengujian Nomor Benang',
    version: '1.0',
    steps: [
      {
        id: 1,
        title: 'Kondisioning Sampel',
        description: 'Kondisikan benang dalam ruang standar (20±2°C, 65±2% RH) selama minimal 24 jam.',
        standardRef: 'SNI ISO 139',
        role: UserRole.LABORAN,
        estimatedDuration: '24 jam'
      },
      {
        id: 2,
        title: 'Pengelosan (Reeling)',
        description: 'Buat untaian benang dengan panjang tertentu (misal 100m) menggunakan Reeling Machine.',
        toolsNeeds: 'Reeling Machine',
        role: UserRole.LABORAN,
        estimatedDuration: '15 menit'
      },
      {
        id: 3,
        title: 'Penimbangan',
        description: 'Timbang untaian benang dengan neraca analitik ketelitian 0.001g.',
        toolsNeeds: 'Neraca Analitik',
        role: UserRole.LABORAN,
        estimatedDuration: '10 menit'
      },
      {
        id: 4,
        title: 'Perhitungan Nomor',
        description: 'Hitung nomor benang (Tex, Denier, atau Ne1) berdasarkan berat dan panjang.',
        role: UserRole.LABORAN,
        estimatedDuration: '10 menit'
      },
      {
        id: 5,
        title: 'Validasi Hasil',
        description: 'Cek konsistensi hasil uji antar spesimen.',
        role: UserRole.ADMIN,
        estimatedDuration: '10 menit'
      }
    ]
  },
  {
    id: 'SOP-TEX-002',
    serviceName: 'Pengujian Jenis Anyaman',
    version: '1.0',
    steps: [
      {
        id: 1,
        title: 'Persiapan Kain',
        description: 'Potong kain sampel ukuran 10x10 cm, pastikan arah lusi dan pakan lurus.',
        toolsNeeds: 'Gunting, Lup/Kaca Pembesar',
        role: UserRole.LABORAN,
        estimatedDuration: '10 menit'
      },
      {
        id: 2,
        title: 'Identifikasi Anyaman',
        description: 'Bongkar benang satu per satu dan amati silangan lusi/pakan menggunakan jarum bedah dan lup.',
        toolsNeeds: 'Jarum, Lup, Meja Periksa',
        role: UserRole.LABORAN,
        estimatedDuration: '30 menit'
      },
      {
        id: 3,
        title: 'Gambar Desain Anyaman',
        description: 'Gambarkan pola anyaman pada kertas desain (point paper).',
        role: UserRole.LABORAN,
        estimatedDuration: '20 menit'
      },
      {
        id: 4,
        title: 'Penentuan Nama Anyaman',
        description: 'Tentukan nama anyaman (Polos, Keper, Satin, dll) berdasarkan pola.',
        role: UserRole.ADMIN,
        estimatedDuration: '10 menit'
      }
    ]
  }
];

// --- HELPER UNTUK MEMBUAT DUMMY REQUEST ---
const createMockRequest = (
  id: string, userId: number, customerName: string, labId: number, 
  testType: string, status: RequestStatus, sampleName: string, 
  dateSubmitted: string
): TestRequest => {
  // Cari Template
  const template = PROCEDURE_TEMPLATES.find(t => t.serviceName === testType);
  
  // Tentukan current step index berdasarkan status
  let currentStepIndex = 0;
  if (status === RequestStatus.COMPLETED || status === RequestStatus.DELIVERED) {
    currentStepIndex = template ? template.steps.length : 0;
  } else if (status === RequestStatus.IN_PROGRESS) {
    currentStepIndex = 1; // Simulasi sedang di langkah ke-2
  }

  return {
    id,
    userId,
    labId,
    labName: LABS.find(l => l.id === labId)?.name || '',
    customerName,
    testType,
    dateSubmitted,
    status,
    applicationData: {
      applicant: {
        name: customerName,
        email: 'email@contoh.com',
        company: customerName,
        phone: '08123456789',
        address: 'Jl. Kaliurang Km 14.5'
      },
      service: {
        testType: testType,
        purpose: ['Sertifikasi/Perizinan'],
      },
      sample: {
        name: sampleName,
        count: 1,
        packaging: 'Plastik Segel',
        description: 'Sampel standar untuk pengujian.',
        estimatedDelivery: dateSubmitted,
        priority: 'Reguler'
      },
      logistics: {
        deliveryMethod: 'Antar Langsung',
        specialHandling: [],
        returnPolicy: 'Dikembalikan'
      },
      agreements: {
        dataTruth: true,
        understanding: true
      }
    },
    // Generate Runtime Procedure jika template ada
    procedure: template ? {
      templateId: template.id,
      templateVersion: template.version,
      currentStepIndex: currentStepIndex,
      steps: template.steps.map((step, idx) => {
        // Tentukan status per step
        let stepStatus: 'pending' | 'in_progress' | 'completed' = 'pending';
        let resultData: string | undefined = undefined;
        let completedAt: string | undefined = undefined;
        let completedBy: string | undefined = undefined;

        if (status === RequestStatus.COMPLETED || status === RequestStatus.DELIVERED) {
           stepStatus = 'completed';
           resultData = 'Data Valid (Auto)';
           completedAt = dateSubmitted;
           completedBy = 'Laboran';
        } else if (status === RequestStatus.IN_PROGRESS) {
           if (idx < currentStepIndex) {
              stepStatus = 'completed';
              resultData = 'Selesai (Mock)';
              completedAt = dateSubmitted;
              completedBy = 'Laboran';
           } else if (idx === currentStepIndex) {
              stepStatus = 'in_progress';
           }
        }

        return {
          ...step,
          status: stepStatus,
          resultData,
          completedAt,
          completedBy
        };
      })
    } : undefined
  };
};

export const MOCK_REQUESTS: TestRequest[] = [
  createMockRequest('REQ-202511-001', 101, 'PT. Tekstil Maju Jaya', 1, 'Pengujian Nomor Benang', RequestStatus.IN_PROGRESS, 'Benang Rayon 30s', '2025-11-18'),
  createMockRequest('REQ-202511-002', 102, 'Dinas Lingkungan Hidup', 2, 'Pengujian Kadar Air', RequestStatus.PENDING, 'Sampel Tanah Liat', '2025-11-19'),
  createMockRequest('REQ-202511-003', 103, 'Kepolisian Daerah DIY', 3, 'Pemeriksaan Handphone', RequestStatus.COMPLETED, 'Samsung Galaxy S21', '2025-11-17'),
  createMockRequest('REQ-202511-004', 999, 'Budi Santoso', 1, 'Pengujian Jenis Anyaman', RequestStatus.RECEIVED, 'Kain Tenun Troso', '2025-11-19'),
  createMockRequest('REQ-202511-005', 999, 'Budi Santoso', 2, 'Pengujian Kadar Abu', RequestStatus.DELIVERED, 'Briket Arang Batok', '2025-11-15'),
  createMockRequest('REQ-202511-006', 104, 'CV. Solusi IT', 3, 'Pemeriksaan Komputer', RequestStatus.IN_PROGRESS, 'Harddisk WD Blue 1TB', '2025-11-20'),
];

export const DASHBOARD_STATS: StatMetric[] = [
  { label: 'Total Permintaan', value: 124, trend: '+12% bulan ini', trendUp: true, iconName: 'FileText' },
  { label: 'Sedang Diuji', value: 45, trend: 'Kapasitas 80%', trendUp: true, iconName: 'Activity' },
  { label: 'Selesai Minggu Ini', value: 18, trend: '+5% dari mgu lalu', trendUp: true, iconName: 'CheckCircle' },
  { label: 'Pending Approval', value: 8, trend: 'Perlu tindakan', trendUp: false, iconName: 'AlertCircle' },
];
