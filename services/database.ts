import { User, UserRole, TestRequest } from '../types';
import { MOCK_REQUESTS as INITIAL_MOCK_REQUESTS } from '../constants';

// KONFIGURASI KONEKSI BACKEND
// Ubah ke 'false' jika Backend Laravel sudah siap berjalan di http://localhost:8000
const USE_MOCK_DATA = true; 
const API_BASE_URL = 'http://localhost:8000/api';

// --- IN-MEMORY STORAGE (Untuk simulasi penambahan data tanpa backend) ---
// Kita copy data dari constants agar bisa dimodifikasi (mutable) selama sesi berjalan
let currentRequests: TestRequest[] = [...INITIAL_MOCK_REQUESTS];

const SEED_USERS: any[] = [
  // --- ADMIN ---
  {
    id: 1,
    name: 'Administrator FTI',
    email: 'admin@uii.ac.id',
    password: 'admin', 
    role: UserRole.ADMIN,
    labId: null
  },
  // --- LAB TEKSTIL (ID: 1) ---
  {
    id: 11,
    name: 'Petugas Tekstil',
    email: 'petugas.tekstil@uii.ac.id',
    password: '123',
    role: UserRole.PETUGAS_LAB,
    labId: 1
  },
  {
    id: 12,
    name: 'Analis Tekstil',
    email: 'analis.tekstil@uii.ac.id',
    password: '123',
    role: UserRole.ANALIS,
    labId: 1
  },
  // --- LAB KIMIA (ID: 2) ---
  {
    id: 21,
    name: 'Petugas Kimia',
    email: 'petugas.kimia@uii.ac.id',
    password: '123',
    role: UserRole.PETUGAS_LAB,
    labId: 2
  },
  {
    id: 22,
    name: 'Analis Kimia',
    email: 'analis.kimia@uii.ac.id',
    password: '123',
    role: UserRole.ANALIS,
    labId: 2
  },
  // --- LAB FORENSIK (ID: 3) ---
  {
    id: 31,
    name: 'Petugas Forensik',
    email: 'petugas.forensik@uii.ac.id',
    password: '123',
    role: UserRole.PETUGAS_LAB,
    labId: 3
  },
  {
    id: 32,
    name: 'Analis Forensik',
    email: 'analis.forensik@uii.ac.id',
    password: '123',
    role: UserRole.ANALIS,
    labId: 3
  }
];

// --- API CLIENT HELPER ---
async function apiCall(endpoint: string, method: string = 'GET', body?: any, token?: string) {
  const headers: any = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Terjadi kesalahan pada server');
    }
    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Gagal terhubung ke server');
  }
}

// --- SERVICE METHODS ---
export const AuthService = {
  // Login Internal (Staff/Admin)
  loginInternal: async (email: string, password: string): Promise<User> => {
    if (USE_MOCK_DATA) {
      // MOCK MODE
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const user = SEED_USERS.find(u => u.email === email && u.password === password);
          if (user) {
            const { password, ...userData } = user;
            resolve(userData as User);
          } else {
            reject(new Error('Email atau password salah (Mock).'));
          }
        }, 800);
      });
    } else {
      // REAL API MODE (LARAVEL)
      const response = await apiCall('/login', 'POST', { email, password });
      // Simpan token di localStorage jika perlu
      localStorage.setItem('auth_token', response.access_token);
      return response.user;
    }
  },

  // Login Google (Customer)
  loginGoogle: async (): Promise<User> => {
    if (USE_MOCK_DATA) {
      // MOCK MODE
      return new Promise((resolve) => {
        setTimeout(() => {
          const googleUser: User = {
            id: 999, // Fixed ID untuk Demo Customer agar cocok dengan constants.ts
            name: 'Budi Santoso',
            email: 'budi.santoso@gmail.com',
            role: UserRole.CUSTOMER,
            avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
            googleId: 'google-123456789'
          };
          resolve(googleUser);
        }, 1500);
      });
    } else {
      throw new Error("Google Auth via API belum dikonfigurasi.");
    }
  }
};

export const DataService = {
  // Mengambil Data Request
  getRequests: async (token?: string): Promise<TestRequest[]> => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        // Return variabel in-memory yang terbaru
        setTimeout(() => resolve([...currentRequests]), 500);
      });
    } else {
      const response = await apiCall('/requests', 'GET', null, token);
      return response.data;
    }
  },

  // Menambah Request Baru
  addRequest: async (newRequest: TestRequest, token?: string): Promise<TestRequest> => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Tambahkan ke array in-memory (unshift agar paling atas)
          currentRequests.unshift(newRequest);
          resolve(newRequest);
        }, 800);
      });
    } else {
      const response = await apiCall('/requests', 'POST', newRequest, token);
      return response.data;
    }
  }
};

export const getDemoAccounts = () => SEED_USERS;