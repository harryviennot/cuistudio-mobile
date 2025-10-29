/**
 * Authentication Context
 * Manages user authentication state including anonymous and authenticated users
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User } from "@/types/auth";
import { authService } from "@/api/services/auth.service";
import { tokenManager } from "@/api/token-manager";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Initialize authentication on app launch
   * Checks for existing tokens and signs in anonymously if none exist
   */
  const initializeAuth = useCallback(async () => {
    try {
      setIsLoading(true);

      // Check if we have existing tokens
      const accessToken = await tokenManager.getAccessToken();

      if (accessToken) {
        // We have tokens, try to get current user
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.log("Failed to get current user, signing in anonymously:", error);
          // Tokens might be invalid, clear them and sign in anonymously
          await tokenManager.clearTokens();
          await signInAnonymouslyInternal();
        }
      } else {
        // No tokens, sign in anonymously
        await signInAnonymouslyInternal();
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      // Fallback: try anonymous sign-in
      try {
        await signInAnonymouslyInternal();
      } catch (fallbackError) {
        console.error("Failed to sign in anonymously:", fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Internal method to sign in anonymously
   */
  const signInAnonymouslyInternal = async () => {
    const response = await authService.signInAnonymously();
    await tokenManager.setTokens(
      response.access_token,
      response.refresh_token,
      response.expires_in
    );
    setUser(response.user);
  };

  /**
   * Public method to sign in anonymously (can be called manually)
   */
  const signInAnonymously = async () => {
    try {
      setIsLoading(true);
      await signInAnonymouslyInternal();
    } catch (error) {
      console.error("Failed to sign in anonymously:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    try {
      // Call logout endpoint (ignore errors if it fails)
      try {
        await authService.logout();
      } catch (error) {
        console.log("Logout endpoint failed (non-critical):", error);
      }

      // Clear tokens
      await tokenManager.clearTokens();
      setUser(null);

      // Sign in anonymously again
      await signInAnonymouslyInternal();
    } catch (error) {
      console.error("Failed to sign out:", error);
      throw error;
    }
  };

  /**
   * Refresh current user data
   */
  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      throw error;
    }
  };

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && !user.is_anonymous,
    isAnonymous: user?.is_anonymous ?? false,
    signInAnonymously,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
