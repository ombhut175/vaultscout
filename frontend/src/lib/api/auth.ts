import { apiRequest } from '@/helpers/request';
import hackLog from '@/lib/logger';
import { API_ENDPOINTS } from '@/constants/api';
import { extractErrorMessage } from '@/helpers/errors';

// Auth API Types (matching backend DTOs)
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserInfo {
  id: string;
  email: string;
  email_confirmed_at?: string;
  isEmailVerified: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublicUser {
  id: string;
  email: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  tokens: AuthTokens;
  user: UserInfo;
  publicUser: PublicUser;
  isEmailVerified: boolean;
}

export interface SignupResponse {
  user: UserInfo;
  publicUser: PublicUser;
  isEmailVerified: boolean;
}

// Auth API Service - following hackathon rules for fast development
export class AuthAPI {
  /**
   * Login user with email and password
   * Returns access tokens, user info, and verification status
   */
  static async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiRequest.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data, false); // Don't show toast here
      
      hackLog.apiSuccess('POST', API_ENDPOINTS.AUTH.LOGIN, {
        hasTokens: !!response?.tokens,
        hasUser: !!response?.user,
        isEmailVerified: response?.isEmailVerified,
        component: 'AuthAPI'
      });

      return response;
    } catch (error) {
      hackLog.apiError('POST', API_ENDPOINTS.AUTH.LOGIN, {
        error: error,
        email: data.email,
        component: 'AuthAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Login failed');
      throw new Error(errorMessage);
    }
  }

  /**
   * Register new user with email and password
   * Creates user in auth system and public users table
   */
  static async signup(data: SignupRequest): Promise<SignupResponse> {
    try {
      const response = await apiRequest.post<SignupResponse>(API_ENDPOINTS.AUTH.SIGNUP, data, false); // Don't show toast here
      
      hackLog.apiSuccess('POST', API_ENDPOINTS.AUTH.SIGNUP, {
        hasUser: !!response?.user,
        isEmailVerified: response?.isEmailVerified,
        userEmail: response?.user?.email,
        component: 'AuthAPI'
      });

      return response;
    } catch (error) {
      hackLog.apiError('POST', API_ENDPOINTS.AUTH.SIGNUP, {
        error: error,
        email: data.email,
        component: 'AuthAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Signup failed');
      throw new Error(errorMessage);
    }
  }

  /**
   * Send password reset email
   */
  static async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    try {
      await apiRequest.post<void>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
      
      hackLog.apiSuccess('POST', API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email: data.email,
        component: 'AuthAPI'
      });
    } catch (error) {
      hackLog.apiError('POST', API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        error: error,
        email: data.email,
        component: 'AuthAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Password reset failed');
      throw new Error(errorMessage);
    }
  }

  /**
   * Logout user and clear tokens
   */
  static async logout(): Promise<void> {
    try {
      await apiRequest.post<void>(API_ENDPOINTS.AUTH.LOGOUT);
      
      hackLog.apiSuccess('POST', API_ENDPOINTS.AUTH.LOGOUT, {
        message: 'Logout successful',
        component: 'AuthAPI'
      });
    } catch (error) {
      hackLog.apiError('POST', API_ENDPOINTS.AUTH.LOGOUT, {
        error: error,
        component: 'AuthAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Logout failed');
      throw new Error(errorMessage);
    }
  }

  /**
   * Check if user is logged in
   */
  static async isLoggedIn(): Promise<boolean> {
    try {
      const response = await apiRequest.get<{ isLoggedIn: boolean }>(API_ENDPOINTS.AUTH.IS_LOGGED_IN, false);
      
      hackLog.apiSuccess('GET', API_ENDPOINTS.AUTH.IS_LOGGED_IN, {
        isLoggedIn: response?.isLoggedIn,
        component: 'AuthAPI'
      });

      return response?.isLoggedIn || false;
    } catch (error) {
      hackLog.apiError('GET', API_ENDPOINTS.AUTH.IS_LOGGED_IN, {
        error: error,
        component: 'AuthAPI'
      });
      
      return false;
    }
  }

  /**
   * Get current user data
   */
  static async getMe(): Promise<{ user: UserInfo; publicUser: PublicUser; isEmailVerified: boolean }> {
    try {
      const response = await apiRequest.get<{ user: UserInfo; publicUser: PublicUser; isEmailVerified: boolean }>(API_ENDPOINTS.USERS.ME, false);
      
      hackLog.apiSuccess('GET', API_ENDPOINTS.USERS.ME, {
        hasUser: !!response?.user,
        isEmailVerified: response?.isEmailVerified,
        userEmail: response?.user?.email,
        component: 'AuthAPI'
      });

      return response;
    } catch (error) {
      hackLog.apiError('GET', API_ENDPOINTS.USERS.ME, {
        error: error,
        component: 'AuthAPI'
      });
      
      const errorMessage = extractErrorMessage(error, 'Failed to fetch user data');
      throw new Error(errorMessage);
    }
  }
}
