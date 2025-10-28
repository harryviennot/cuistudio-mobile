/**
 * Mobile-optimized Axios API client with token management
 */
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { router } from "expo-router";
import Constants from "expo-constants";
import { tokenManager } from "./token-manager";
import type { AuthResponse } from "@/types/auth";
import { Alert } from "react-native";

export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: unknown;

  constructor(
    message: string,
    status?: number,
    code?: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Get API URL from environment or use default
const API_URL =
  Constants.expoConfig?.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  "http://localhost:8000";

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Track ongoing refresh requests to prevent multiple simultaneous refreshes
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(null);
    }
  });

  failedQueue = [];
};

// Request interceptor for authentication
apiClient.interceptors.request.use(
  async (config) => {
    // Add auth token if available
    const token = await tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (__DEV__) {
      console.log("🚀 API Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        hasToken: !!token,
      });
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor for handling responses and errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (__DEV__) {
      console.log("✅ API Response:", {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 errors with token refresh (but skip if this is a refresh call itself)
    // Also skip for login and refresh endpoints
    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/signup") ||
      originalRequest.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint &&
      !(originalRequest as AxiosRequestConfig & { skipAuthRetry?: boolean })
        .skipAuthRetry
    ) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Perform token refresh
        const refreshToken = await tokenManager.getRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await apiClient.post<AuthResponse>(
          "/auth/refresh",
          {
            refresh_token: refreshToken,
          },
          {
            skipAuthRetry: true,
          } as AxiosRequestConfig & { skipAuthRetry?: boolean },
        );

        const { access_token, refresh_token, expires_in } = response.data;

        // Update tokens in manager
        await tokenManager.setTokens(access_token, refresh_token, expires_in);

        if (__DEV__) {
          console.log("🔄 Tokens refreshed successfully");
        }

        // Retry the original request with new token
        const token = await tokenManager.getAccessToken();
        if (token && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          processQueue(null);
          return apiClient(originalRequest);
        } else {
          throw new Error("Token refresh failed");
        }
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);
        await handleAuthFailure();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    let message = "An unexpected error occurred";
    const status = error.response?.status;
    let code: string | undefined;
    let details: unknown;

    if (error.response) {
      const { status, data } = error.response;

      // Backend returns errors in format: { error: { code, message }, timestamp, path }
      // or { message, detail }
      const errorData = data as {
        error?: {
          code?: string;
          message?: string;
        };
        message?: string;
        detail?: string;
        errors?: unknown;
      };

      // Try to extract message from backend error format first
      if (errorData?.error?.message) {
        message = errorData.error.message;
        code = errorData.error.code;
      } else if (errorData?.message) {
        message = errorData.message;
      } else if (errorData?.detail) {
        message = errorData.detail;
      } else {
        // Fallback to generic messages
        switch (status) {
          case 400:
            message = "Bad request";
            break;
          case 401:
            message = "Unauthorized";
            break;
          case 403:
            message = "Forbidden - Insufficient permissions";
            break;
          case 404:
            message = "Resource not found";
            break;
          case 409:
            message = "Resource already exists";
            break;
          case 422:
            message = "Validation error";
            details = errorData?.errors;
            break;
          case 500:
            message = "Internal server error";
            break;
          default:
            message = `Error ${status}`;
        }
      }
    } else if (error.request) {
      message = "Network error - Please check your connection";
    }

    const apiError = new ApiError(message, status, code, details);

    console.error("❌ API Error:", apiError);
    return Promise.reject(apiError);
  },
);

// Handle authentication failure (redirect to login)
async function handleAuthFailure(): Promise<void> {
  await tokenManager.clearTokens();

  // Show alert on mobile
  Alert.alert(
    "Session Expired",
    "Your session has expired. Please login again.",
    [{ text: "OK" }],
  );

  // Navigate to login screen
  try {
    router.replace("/(auth)/login");
  } catch (error) {
    console.error("Navigation error:", error);
  }
}

// Helper functions for different HTTP methods
export const api = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config),

  post: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ) => apiClient.post<T>(url, data, config),

  put: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ) => apiClient.put<T>(url, data, config),

  patch: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ) => apiClient.patch<T>(url, data, config),

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config),
};

export default apiClient;
