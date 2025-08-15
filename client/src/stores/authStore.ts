import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  isEmailVerified: boolean;
  role: string;
  preferences: {
    theme: string;
    language: string;
    notifications: boolean;
  };
  subscription: {
    type: string;
    expiresAt?: string;
  };
  usage?: {
    messagesSent: number;
    tokensUsed: number;
  };
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  setToken: (token: string | null) => void;
}

// Create axios interceptor for authentication
const setupAxiosInterceptors = (setToken: (token: string | null) => void) => {
  // Request interceptor to add auth token
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth-storage') 
        ? JSON.parse(localStorage.getItem('auth-storage')!).state.token 
        : null;
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle auth errors
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token is invalid, clear auth state
        setToken(null);
        localStorage.removeItem('auth-storage');
        // Clear chat storage when user is logged out
        localStorage.removeItem('chat-storage');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      setToken: (token: string | null) => {
        set({ token });
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          delete axios.defaults.headers.common['Authorization'];
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post('/api/auth/login', {
            email,
            password,
          });
          
          const { token, user } = response.data;
          
          // Set axios default authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          set({ user, token, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post('/api/auth/register', {
            email,
            password,
            name,
          });
          
          const { token, user } = response.data;
          
          // Set axios default authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          set({ user, token, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        // Remove axios default authorization header
        delete axios.defaults.headers.common['Authorization'];
        // Clear chat storage when user logs out
        localStorage.removeItem('chat-storage');
        set({ user: null, token: null, error: null });
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) return;

        try {
          // Set axios default authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          const response = await axios.get('/api/auth/me');
          set({ user: response.data.user });
        } catch (error) {
          // Token is invalid, clear auth state
          delete axios.defaults.headers.common['Authorization'];
          localStorage.removeItem('chat-storage');
          set({ user: null, token: null });
        }
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...userData } });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
        // Setup axios interceptors
        setupAxiosInterceptors((token) => {
          if (state) {
            state.setToken(token);
          }
        });
      },
    }
  )
);
