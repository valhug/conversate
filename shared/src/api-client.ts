import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from './types';

/**
 * Base API client for making HTTP requests
 * Provides consistent error handling and response formatting
 */
export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string, timeout: number = 10000) {
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for adding auth tokens
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    // Implementation varies by platform (localStorage for web, AsyncStorage for mobile)
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private handleUnauthorized(): void {
    // Clear auth token and redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      window.location.href = '/auth/login';
    }
  }

  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse = await this.client.get(endpoint, { params });
      return this.formatResponse(response);
    } catch (error) {
      return this.formatError(error);
    }
  }

  async post<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse = await this.client.post(endpoint, data, config);
      return this.formatResponse(response);
    } catch (error) {
      return this.formatError(error);
    }
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse = await this.client.put(endpoint, data);
      return this.formatResponse(response);
    } catch (error) {
      return this.formatError(error);
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse = await this.client.delete(endpoint);
      return this.formatResponse(response);
    } catch (error) {
      return this.formatError(error);
    }
  }

  private formatResponse<T>(response: AxiosResponse): ApiResponse<T> {
    return {
      success: true,
      data: response.data,
      timestamp: new Date(),
    };
  }

  private formatError<T>(error: unknown): ApiResponse<T> {
    let errorMessage = 'An unexpected error occurred';
    
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
      timestamp: new Date(),
    };
  }

  // Method to upload files with progress tracking
  async uploadFile<T>(
    endpoint: string,
    file: File | Blob,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response: AxiosResponse = await this.client.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      return this.formatResponse(response);
    } catch (error) {
      return this.formatError(error);
    }
  }
}
