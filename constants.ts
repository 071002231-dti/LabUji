import { Lab, RequestStatus, TestRequest, UserRole, StatMetric } from './types';
import { Beaker, Binary, Scissors } from 'lucide-react';

export const LABS: Lab[] = [
  {
    id: 1,
    name: 'Lab Manufaktur & Pengujian Tekstil',
    code: 'TEXTILE',
    description: 'Pengujian kekuatan tarik, ketahanan luntur warna, dan komposisi serat.',
    iconName: 'Scissors'
  },
  {
    id: 2,
    name: 'Lab Penelitian Teknik Kimia',
    code: 'CHEM',
    description: 'Analisis proksimat, kromatografi, dan uji kualitas air limbah.',
    iconName: 'Beaker'
  },
  {
    id: 3,
    name: 'Lab Forensik Digital',
    code: 'DIGITAL',
    description: 'Recovery data, analisis malware, dan investigasi kejahatan siber.',
    iconName: 'Binary'
  }
];

export const MOCK_REQUESTS: TestRequest[] = [
  {
    id: 'REQ-202511-001',
    customerName: 'PT. Tekstil Maju Jaya',
    labId: 1,
    labName: 'Lab Manufaktur & Pengujian Tekstil',
    testType: 'Uji Kekuatan Tarik Kain',
    dateSubmitted: '2025-11-18',
    status: RequestStatus.IN_PROGRESS,
  },
  {
    id: 'REQ-202511-002',
    customerName: 'Dinas Lingkungan Hidup',
    labId: 2,
    labName: 'Lab Penelitian Teknik Kimia',
    testType: 'Uji Kualitas Air Sungai',
    dateSubmitted: '2025-11-19',
    status: RequestStatus.PENDING,
  },
  {
    id: 'REQ-202511-003',
    customerName: 'Kepolisian Daerah DIY',
    labId: 3,
    labName: 'Lab Forensik Digital',
    testType: 'Ekstraksi Data Smartphone',
    dateSubmitted: '2025-11-17',
    status: RequestStatus.COMPLETED,
    expiryDate: '2025-12-17'
  },
  {
    id: 'REQ-202511-004',
    customerName: 'CV. Batik Alami',
    labId: 1,
    labName: 'Lab Manufaktur & Pengujian Tekstil',
    testType: 'Uji Ketahanan Luntur',
    dateSubmitted: '2025-11-19',
    status: RequestStatus.RECEIVED,
  },
  {
    id: 'REQ-202511-005',
    customerName: 'Mahasiswa Tugas Akhir',
    labId: 2,
    labName: 'Lab Penelitian Teknik Kimia',
    testType: 'Analisis Spektroskopi',
    dateSubmitted: '2025-11-15',
    status: RequestStatus.DELIVERED,
    expiryDate: '2026-05-15'
  }
];

export const DASHBOARD_STATS: StatMetric[] = [
  { label: 'Total Permintaan', value: 124, trend: '+12% bulan ini', trendUp: true, iconName: 'FileText' },
  { label: 'Sedang Diuji', value: 45, trend: 'Kapasitas 80%', trendUp: true, iconName: 'Activity' },
  { label: 'Selesai Minggu Ini', value: 18, trend: '+5% dari mgu lalu', trendUp: true, iconName: 'CheckCircle' },
  { label: 'Pending Approval', value: 8, trend: 'Perlu tindakan', trendUp: false, iconName: 'AlertCircle' },
];