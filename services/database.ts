
import { User, UserRole } from '../types';

// Simulasi Tabel 'users' dalam Database SQLite
// Password default untuk semua akun simulasi: '123456'
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

// Service Class untuk berinteraksi dengan "Database"
export const AuthService = {
  // Login Internal (Staff/Admin) - Simulasi Query: SELECT * FROM users WHERE email = ? AND password = ?
  loginInternal: (email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = SEED_USERS.find(u => u.email === email && u.password === password);
        
        if (user) {
          // Return user object tanpa password
          const { password, ...userData } = user;
          resolve(userData as User);
        } else {
          reject(new Error('Email atau password salah.'));
        }
      }, 800); // Simulasi delay network
    });
  },

  // Login Google (Customer) - Simulasi OAuth
  loginGoogle: (): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulasi data yang diterima dari Google API
        const googleUser: User = {
          id: Date.now(), // Random ID
          name: 'Budi Santoso', // Nama dari akun Google
          email: 'budi.santoso@gmail.com',
          role: UserRole.CUSTOMER,
          avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c', // Default google avatar
          googleId: 'google-123456789'
        };
        resolve(googleUser);
      }, 1500); // Simulasi loading popup Google
    });
  }
};

// Helper untuk mendapatkan list user dummy agar mudah dicoba saat demo
export const getDemoAccounts = () => SEED_USERS;
