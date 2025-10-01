import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginCredentials, RegisterData, AuthResponse, UserRole } from '@/types';
import apiClient, { authApi } from '@/lib/api';
import { tokenUtils } from '@/lib/token-utils';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  activeRole: UserRole | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  checkTokenExpiration: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  socialLogin: (provider: string, token: string) => Promise<boolean>;
  switchRole: (role: UserRole) => void;
  getAvailableRoles: () => UserRole[];
  canAccessRole: (role: UserRole) => boolean;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      activeRole: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        console.log('🔐 Starting login process...', credentials);
        set({ isLoading: true, error: null });
        
        try {
          console.log('📤 Sending login request...');
          const response = await authApi.login(credentials);
          console.log('📥 Login response received:', response.data);
          
          const { token, user } = response.data;
          console.log('🎯 Token:', token ? '✅ Present' : '❌ Missing');
          console.log('👤 User:', user);
          
          // Store token in localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('authToken', token);
            console.log('💾 Token stored in localStorage');
          }
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            activeRole: user.activeRole || user.role, // Usar activeRole o rol principal
          });
          
          console.log('✅ Login successful, state updated');
          return true;
        } catch (error: any) {
          console.error('❌ Login failed:', error);
          const errorMessage = error.response?.data?.mensaje || error.response?.data?.message || 'Error de autenticación';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null,
          });
          return false;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.register(data);
          const { token, user } = response.data;
          
          // Store token in localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('authToken', token);
          }
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            activeRole: user.activeRole || user.role,
          });
          
          return true;
        } catch (error: any) {
          const errorMessage = error.response?.data?.mensaje || error.response?.data?.message || 'Error en el registro';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null,
          });
          return false;
        }
      },

      logout: () => {
        // Limpiar localStorage de forma segura
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
        }
        
        // Resetear estado
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          activeRole: null, // Cambiar currentRole por activeRole
          error: null
        });
        
        // Redirigir al home después de un pequeño delay para evitar conflictos de hooks
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.location.href = '/';
          }, 100);
        }
      },

      // Check for expired tokens on load
      checkTokenExpiration: () => {
        if (typeof window !== 'undefined') {
          const wasExpired = tokenUtils.clearExpiredToken();
          if (wasExpired) {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              error: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
              activeRole: null,
            });
          }
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      setToken: (token: string) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', token);
        }
        set({ token });
      },

      socialLogin: async (provider: string, token: string) => {
        console.log(`🔐 Starting ${provider} social login...`);
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.post<AuthResponse>(`/auth/${provider}/callback`, { token });
          const { token: authToken, user } = response.data;
          
          // Store token in localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('authToken', authToken);
          }
          
          set({
            user,
            token: authToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            activeRole: user.activeRole || user.role,
          });
          
          console.log(`✅ ${provider} social login successful`);
          return true;
        } catch (error: any) {
          console.error(`❌ ${provider} social login failed:`, error);
          const errorMessage = error.response?.data?.mensaje || error.response?.data?.message || `Error de autenticación con ${provider}`;
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null,
            activeRole: null,
          });
          return false;
        }
      },

      // Role management actions
      switchRole: (role: UserRole) => {
        const { user } = get();
        if (!user) return;
        
        const availableRoles = user.availableRoles || [user.role];
        if (!availableRoles.includes(role)) {
          console.warn(`Role ${role} not available for user`);
          return;
        }
        
        set({ activeRole: role });
        console.log(`🔄 Switched to role: ${role}`);
      },

      getAvailableRoles: () => {
        const { user } = get();
        if (!user) return [];
        return user.availableRoles || [user.role];
      },

      canAccessRole: (role: UserRole) => {
        const { user } = get();
        if (!user) return false;
        const availableRoles = user.availableRoles || [user.role];
        return availableRoles.includes(role);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        activeRole: state.activeRole,
      }),
    }
  )
);
