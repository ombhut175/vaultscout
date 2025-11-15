import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import hackLog from '@/lib/logger';
import { AuthAPI, LoginRequest, SignupRequest, ForgotPasswordRequest, UserInfo, PublicUser } from '@/lib/api/auth';

// Auth Store State Interface
interface AuthState {
  // User data
  user: UserInfo | null;
  publicUser: PublicUser | null;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  
  // Loading states
  isLoading: boolean;
  isInitialized: boolean;
  isLoginLoading: boolean;
  isSignupLoading: boolean;
  isForgotPasswordLoading: boolean;
  isLogoutLoading: boolean;
  
  // Error states
  loginError: string | null;
  signupError: string | null;
  forgotPasswordError: string | null;
  generalError: string | null;

  // Actions
  login: (data: LoginRequest) => Promise<boolean>;
  signup: (data: SignupRequest) => Promise<boolean>;
  forgotPassword: (data: ForgotPasswordRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  clearErrors: () => void;
  clearUserData: () => void;
}

/**
 * Auth Store - Central authentication state management
 * Following hackathon rules for simple, debuggable state management
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      publicUser: null,
      isAuthenticated: false,
      isEmailVerified: false,
      
      isLoading: false,
      isInitialized: false,
      isLoginLoading: false,
      isSignupLoading: false,
      isForgotPasswordLoading: false,
      isLogoutLoading: false,
      
      loginError: null,
      signupError: null,
      forgotPasswordError: null,
      generalError: null,

      /**
       * Login user with email and password
       * Returns true if successful, false if failed
       */
      login: async (data: LoginRequest): Promise<boolean> => {
        hackLog.storeAction('login', {
          email: data.email,
          passwordLength: data.password.length,
          trigger: 'user_action'
        });

        set({ 
          isLoginLoading: true, 
          loginError: null,
          generalError: null 
        });

        try {
          const response = await AuthAPI.login(data);
          
          hackLog.storeAction('loginSuccess', {
            userId: response.user.id,
            email: response.user.email,
            isEmailVerified: response.isEmailVerified,
            hasTokens: !!response.tokens
          });

          set({
            user: response.user,
            publicUser: response.publicUser,
            isAuthenticated: true,
            isEmailVerified: response.isEmailVerified,
            isLoginLoading: false,
            loginError: null,
            generalError: null
          });

          return true;
        } catch (error: any) {
          const errorMessage = error.message || 'Login failed';
          
          hackLog.error('Login failed', {
            error: errorMessage,
            email: data.email,
            component: 'AuthStore',
            action: 'login'
          });

          set({
            isLoginLoading: false,
            loginError: errorMessage,
            isAuthenticated: false,
            user: null,
            publicUser: null
          });

          return false;
        }
      },

      /**
       * Register new user
       * Returns true if successful, false if failed
       */
      signup: async (data: SignupRequest): Promise<boolean> => {
        hackLog.storeAction('signup', {
          email: data.email,
          passwordLength: data.password.length,
          trigger: 'user_action'
        });

        set({ 
          isSignupLoading: true, 
          signupError: null,
          generalError: null 
        });

        try {
          const response = await AuthAPI.signup(data);
          
          hackLog.storeAction('signupSuccess', {
            userId: response.user.id,
            email: response.user.email,
            isEmailVerified: response.isEmailVerified
          });

          set({
            user: response.user,
            publicUser: response.publicUser,
            isEmailVerified: response.isEmailVerified,
            isSignupLoading: false,
            signupError: null,
            generalError: null
          });

          return true;
        } catch (error: any) {
          const errorMessage = error.message || 'Signup failed';
          
          hackLog.error('Signup failed', {
            error: errorMessage,
            email: data.email,
            component: 'AuthStore',
            action: 'signup'
          });

          set({
            isSignupLoading: false,
            signupError: errorMessage
          });

          return false;
        }
      },

      /**
       * Send password reset email
       * Returns true if successful, false if failed
       */
      forgotPassword: async (data: ForgotPasswordRequest): Promise<boolean> => {
        hackLog.storeAction('forgotPassword', {
          email: data.email,
          trigger: 'user_action'
        });

        set({ 
          isForgotPasswordLoading: true, 
          forgotPasswordError: null,
          generalError: null 
        });

        try {
          await AuthAPI.forgotPassword(data);
          
          hackLog.storeAction('forgotPasswordSuccess', {
            email: data.email
          });

          set({
            isForgotPasswordLoading: false,
            forgotPasswordError: null,
            generalError: null
          });

          return true;
        } catch (error: any) {
          const errorMessage = error.message || 'Password reset failed';
          
          hackLog.error('Forgot password failed', {
            error: errorMessage,
            email: data.email,
            component: 'AuthStore',
            action: 'forgotPassword'
          });

          set({
            isForgotPasswordLoading: false,
            forgotPasswordError: errorMessage
          });

          return false;
        }
      },

      /**
       * Logout user and clear all auth data
       */
      logout: async (): Promise<void> => {
        hackLog.storeAction('logout', {
          userId: get().user?.id,
          trigger: 'user_action'
        });

        set({ isLogoutLoading: true });

        try {
          await AuthAPI.logout();
          
          hackLog.storeAction('logoutSuccess', {
            message: 'User logged out successfully'
          });

          get().clearUserData();
        } catch (error: any) {
          hackLog.error('Logout failed', {
            error: error.message,
            component: 'AuthStore',
            action: 'logout'
          });

          // Clear user data even if API call fails
          get().clearUserData();
        }
      },

      /**
       * Check if user is still authenticated
       */
      checkAuthStatus: async (): Promise<void> => {
        hackLog.storeAction('checkAuthStatus', {
          currentlyAuthenticated: get().isAuthenticated,
          trigger: 'app_init'
        });

        set({ isLoading: true });

        try {
          const isLoggedIn = await AuthAPI.isLoggedIn();
          
          hackLog.storeAction('authStatusChecked', {
            isLoggedIn,
            wasAuthenticated: get().isAuthenticated
          });

          if (!isLoggedIn) {
            get().clearUserData();
            set({ isLoading: false, isInitialized: true });
          } else {
            const currentUser = get().user;
            
            if (!currentUser) {
              try {
                const userData = await AuthAPI.getMe();
                
                hackLog.storeAction('userDataFetched', {
                  userId: userData.user.id,
                  email: userData.user.email,
                  isEmailVerified: userData.isEmailVerified
                });

                set({
                  user: userData.user,
                  publicUser: userData.publicUser,
                  isAuthenticated: true,
                  isEmailVerified: userData.isEmailVerified,
                  isLoading: false,
                  isInitialized: true
                });
              } catch (error: any) {
                hackLog.error('Failed to fetch user data', {
                  error: error.message,
                  component: 'AuthStore',
                  action: 'checkAuthStatus'
                });

                get().clearUserData();
                set({ isLoading: false, isInitialized: true });
              }
            } else {
              set({ 
                isAuthenticated: true,
                isLoading: false,
                isInitialized: true
              });
            }
          }
        } catch (error: any) {
          hackLog.error('Auth status check failed', {
            error: error.message,
            component: 'AuthStore',
            action: 'checkAuthStatus'
          });

          get().clearUserData();
          set({ isLoading: false, isInitialized: true });
        }
      },

      /**
       * Clear all error states
       */
      clearErrors: (): void => {
        hackLog.storeAction('clearErrors', {
          trigger: 'user_action'
        });

        set({
          loginError: null,
          signupError: null,
          forgotPasswordError: null,
          generalError: null
        });
      },

      /**
       * Clear all user data and reset auth state
       */
      clearUserData: (): void => {
        hackLog.storeAction('clearUserData', {
          wasAuthenticated: get().isAuthenticated,
          trigger: 'logout_or_auth_failure'
        });

        set({
          user: null,
          publicUser: null,
          isAuthenticated: false,
          isEmailVerified: false,
          isLoading: false,
          isLoginLoading: false,
          isSignupLoading: false,
          isForgotPasswordLoading: false,
          isLogoutLoading: false,
          loginError: null,
          signupError: null,
          forgotPasswordError: null,
          generalError: null
        });
      }
    }),
    {
      name: 'auth-store', // Storage key
      storage: createJSONStorage(() => localStorage),
      
      // Only persist essential user data, not loading states or errors
      partialize: (state) => ({
        user: state.user,
        publicUser: state.publicUser,
        isAuthenticated: state.isAuthenticated,
        isEmailVerified: state.isEmailVerified
      }),
      
      // Log store rehydration for debugging
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          hackLog.error('Auth store rehydration failed', { error });
        } else {
          hackLog.storeAction('rehydrated', {
            hasUser: !!state?.user,
            isAuthenticated: state?.isAuthenticated,
            isEmailVerified: state?.isEmailVerified
          });
        }
      }
    }
  )
);

// Export selector hooks for easy access to specific store parts
export const useAuthUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore(state => ({
  isLoading: state.isLoading,
  isLoginLoading: state.isLoginLoading,
  isSignupLoading: state.isSignupLoading,
  isForgotPasswordLoading: state.isForgotPasswordLoading,
  isLogoutLoading: state.isLogoutLoading
}));
export const useAuthErrors = () => useAuthStore(state => ({
  loginError: state.loginError,
  signupError: state.signupError,
  forgotPasswordError: state.forgotPasswordError,
  generalError: state.generalError
}));
