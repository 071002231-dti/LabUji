
import { User, UserRole, TestRequest, RequestStatus, RuntimeProcedure, ProcedureTemplate } from '../types';
import { MOCK_REQUESTS as INITIAL_MOCK_REQUESTS, PROCEDURE_TEMPLATES as INITIAL_TEMPLATES } from '../constants';

// KONFIGURASI KONEKSI BACKEND
const USE_MOCK_DATA = true; 
const API_BASE_URL = 'http://localhost:8000/api';

let currentRequests: TestRequest[] = [...INITIAL_MOCK_REQUESTS];
let currentTemplates: ProcedureTemplate[] = [...INITIAL_TEMPLATES];

const SEED_USERS: User[] = [
  { id: 1, name: 'Administrator FTI', email: 'admin@uii.ac.id', role: UserRole.ADMIN, labId: undefined },
  { id: 11, name: 'Laboran Tekstil', email: 'laboran.tekstil@uii.ac.id', role: UserRole.LABORAN, labId: 1 },
  { id: 21, name: 'Laboran Kimia', email: 'laboran.kimia@uii.ac.id', role: UserRole.LABORAN, labId: 2 },
  { id: 31, name: 'Laboran Forensik', email: 'laboran.forensik@uii.ac.id', role: UserRole.LABORAN, labId: 3 },
  { id: 101, name: 'PT. Tekstil Maju Jaya', email: 'contact@maju-jaya.com', role: UserRole.CUSTOMER },
  { id: 102, name: 'Dinas Lingkungan Hidup', email: 'admin@dlh.gov.id', role: UserRole.CUSTOMER },
  { id: 103, name: 'Kepolisian Daerah DIY', email: 'cybercrime@poldadiy.go.id', role: UserRole.CUSTOMER },
  { id: 104, name: 'CV. Solusi IT', email: 'support@solusiit.com', role: UserRole.CUSTOMER }
];

// Extend User type internally to include password for mock auth logic
interface MockUser extends User {
  password?: string;
}

let currentUsers: MockUser[] = SEED_USERS.map(u => ({ ...u, password: u.role === UserRole.ADMIN ? 'admin' : '123' }));

async function apiCall(endpoint: string, method: string = 'GET', body?: any, token?: string) {
  const headers: any = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const config: RequestInit = { method, headers };
  if (body) config.body = JSON.stringify(body);
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Terjadi kesalahan pada server');
    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Gagal terhubung ke server');
  }
}

export const AuthService = {
  loginInternal: async (email: string, password: string): Promise<User> => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const user = currentUsers.find(u => u.email === email && u.password === password);
          if (user) {
            const { password, ...userData } = user;
            resolve(userData as User);
          } else {
            reject(new Error('Email atau password salah (Mock).'));
          }
        }, 800);
      });
    } else {
      const response = await apiCall('/login', 'POST', { email, password });
      localStorage.setItem('auth_token', response.access_token);
      return response.user;
    }
  },

  loginGoogle: async (): Promise<User> => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const googleUser: User = {
            id: 999, 
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
  },

  getCustomerEmail: (userId: number): string => {
    const user = currentUsers.find(u => u.id === userId);
    if (user) return user.email;
    if (userId === 999) return 'budi.santoso@gmail.com';
    return 'customer@email.com'; 
  }
};

export const DataService = {
  // --- USERS CRUD ---
  getUsers: async (): Promise<User[]> => {
    if (USE_MOCK_DATA) return new Promise(resolve => setTimeout(() => resolve([...currentUsers]), 500));
    return []; 
  },

  addUser: async (userData: any): Promise<void> => {
    if (USE_MOCK_DATA) {
        return new Promise(resolve => {
            const newUser: MockUser = {
                id: Date.now(),
                ...userData
            };
            currentUsers.push(newUser);
            resolve();
        });
    }
  },

  updateUser: async (id: number, userData: any): Promise<void> => {
    if (USE_MOCK_DATA) {
        return new Promise(resolve => {
            const index = currentUsers.findIndex(u => u.id === id);
            if (index !== -1) {
                // Merge data lama dengan data baru
                currentUsers[index] = { ...currentUsers[index], ...userData };
            }
            resolve();
        });
    }
  },

  deleteUser: async (id: number): Promise<void> => {
    if (USE_MOCK_DATA) {
        return new Promise(resolve => {
            currentUsers = currentUsers.filter(u => u.id !== id);
            resolve();
        });
    }
  },

  // --- REQUESTS ---
  getRequests: async (token?: string): Promise<TestRequest[]> => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => resolve([...currentRequests]), 500);
      });
    } else {
      const response = await apiCall('/requests', 'GET', null, token);
      return response.data;
    }
  },

  addRequest: async (newRequest: TestRequest, token?: string): Promise<TestRequest> => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // --- LOGIKA PROCEDURE GENERATION ---
          // Saat request dibuat, cek template SOP yang sesuai
          const template = currentTemplates.find(t => t.serviceName === newRequest.testType);
          
          if (template) {
             // Create Snapshot (Runtime Procedure)
             const runtimeProc: RuntimeProcedure = {
                templateId: template.id,
                templateVersion: template.version,
                currentStepIndex: 0,
                steps: template.steps.map(step => ({
                   ...step,
                   status: 'pending' // Initial status
                }))
             };
             newRequest.procedure = runtimeProc;
          }

          currentRequests.unshift(newRequest);
          resolve(newRequest);
        }, 800);
      });
    } else {
      const response = await apiCall('/requests', 'POST', newRequest, token);
      return response.data;
    }
  },

  updateRequestStatus: async (id: string, newStatus: RequestStatus, token?: string): Promise<TestRequest> => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = currentRequests.findIndex(r => r.id === id);
          if (index !== -1) {
            currentRequests[index] = { ...currentRequests[index], status: newStatus };
            resolve(currentRequests[index]);
          } else {
            reject(new Error("Request tidak ditemukan"));
          }
        }, 600);
      });
    } else {
      const response = await apiCall(`/requests/${id}/status`, 'PUT', { status: newStatus }, token);
      return response.data;
    }
  },

  // --- PROCEDURES ---
  updateProcedureStep: async (requestId: string, stepId: number, resultData: string, userName: string): Promise<void> => {
    if (USE_MOCK_DATA) {
        return new Promise((resolve, reject) => {
           setTimeout(() => {
              const req = currentRequests.find(r => r.id === requestId);
              if (!req || !req.procedure) {
                  reject(new Error("Request atau Prosedur tidak ditemukan"));
                  return;
              }

              // Update step yang spesifik
              const stepIndex = req.procedure.steps.findIndex(s => s.id === stepId);
              if (stepIndex !== -1) {
                  req.procedure.steps[stepIndex].status = 'completed';
                  req.procedure.steps[stepIndex].resultData = resultData;
                  req.procedure.steps[stepIndex].completedBy = userName;
                  req.procedure.steps[stepIndex].completedAt = new Date().toISOString();
                  
                  // Majukan currentStepIndex jika urutan sesuai
                  if (req.procedure.currentStepIndex === stepIndex) {
                      req.procedure.currentStepIndex += 1;
                      // Set next step to in_progress if available
                      if (req.procedure.steps[stepIndex + 1]) {
                          req.procedure.steps[stepIndex + 1].status = 'in_progress';
                      }
                  }
              }
              resolve();
           }, 500);
        });
    }
  },

  // --- TEMPLATES (SOP) CRUD ---
  getTemplates: async (): Promise<ProcedureTemplate[]> => {
     if (USE_MOCK_DATA) return new Promise(resolve => setTimeout(() => resolve([...currentTemplates]), 500));
     return []; // Real API impl needed
  },

  saveTemplate: async (template: ProcedureTemplate): Promise<void> => {
    if (USE_MOCK_DATA) {
        return new Promise(resolve => {
            setTimeout(() => {
                const existingIdx = currentTemplates.findIndex(t => t.id === template.id);
                if (existingIdx !== -1) {
                    currentTemplates[existingIdx] = template;
                } else {
                    currentTemplates.push(template);
                }
                resolve();
            }, 500);
        });
    }
  },

  deleteTemplate: async (id: string): Promise<void> => {
    if (USE_MOCK_DATA) {
        return new Promise(resolve => {
            currentTemplates = currentTemplates.filter(t => t.id !== id);
            resolve();
        });
    }
  }
};

export const getDemoAccounts = () => SEED_USERS;
