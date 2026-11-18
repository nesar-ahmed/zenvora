"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { apiClient, authHeaders } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import type { components } from "@/types/api";

type User = components["schemas"]["UserResponse"];
type AuthStatus = "loading" | "authenticated" | "anonymous";

const TOKEN_STORAGE_KEY = "zenvora.access_token";

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = LoginInput & {
  full_name: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => void;
  updateProfile: (fullName: string) => Promise<User>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function clearStoredToken() {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const loadProfile = useCallback(async (accessToken: string) => {
    try {
      const { data, error } = await apiClient.GET("/api/v1/users/me", {
        headers: authHeaders(accessToken),
      });

      if (error || !data) {
        clearStoredToken();
        setToken(null);
        setUser(null);
        setStatus("anonymous");
        return null;
      }

      setUser(data);
      setStatus("authenticated");
      return data;
    } catch {
      clearStoredToken();
      setToken(null);
      setUser(null);
      setStatus("anonymous");
      return null;
    }
  }, []);

  useEffect(() => {
    async function restoreSession() {
      const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!storedToken) {
        setStatus("anonymous");
        return;
      }

      setToken(storedToken);
      await loadProfile(storedToken);
    }

    void restoreSession();
  }, [loadProfile]);

  const login = useCallback(
    async (input: LoginInput) => {
      const { data, error } = await apiClient.POST("/api/v1/users/login", {
        body: input,
      });

      if (error || !data) {
        throw new Error(getApiErrorMessage(error));
      }

      window.localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
      setToken(data.access_token);

      const profile = await loadProfile(data.access_token);
      if (!profile) {
        throw new Error("Could not load your profile. Please try again.");
      }

      return profile;
    },
    [loadProfile],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const { error } = await apiClient.POST("/api/v1/users/register", {
        body: input,
      });

      if (error) {
        throw new Error(getApiErrorMessage(error));
      }

      return login({ email: input.email, password: input.password });
    },
    [login],
  );

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setStatus("anonymous");
  }, []);

  const updateProfile = useCallback(
    async (fullName: string) => {
      if (!token) {
        throw new Error("You must be logged in to update your profile.");
      }

      const { data, error } = await apiClient.PATCH("/api/v1/users/me", {
        headers: authHeaders(token),
        body: { full_name: fullName },
      });

      if (error || !data) {
        throw new Error(getApiErrorMessage(error));
      }

      setUser(data);
      return data;
    },
    [token],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      status,
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, token, status, login, register, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }
  return context;
}
