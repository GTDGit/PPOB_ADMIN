"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { adminApi, type LoginPayload } from "@/lib/api/admin";
import { extractApiError, STORAGE_KEYS } from "@/lib/api/client";
import { hasAnyPermission, hasPermission } from "@/lib/permissions";
import type { AdminAuthPayload, AdminUserSummary } from "@/lib/types";

interface AuthContextValue {
  user: AdminUserSummary | null;
  permissions: string[];
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<AdminAuthPayload>;
  completeActivation: (payload: AdminAuthPayload) => void;
  logout: (redirectToLogin?: boolean) => Promise<void>;
  refreshSession: () => Promise<void>;
  hasPermission: (permission?: string) => boolean;
  hasAnyPermission: (requiredPermissions?: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function persistAuth(payload: AdminAuthPayload) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.accessToken, payload.accessToken);
  window.localStorage.setItem(STORAGE_KEYS.refreshToken, payload.refreshToken);
  window.localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(payload.user));
  window.localStorage.setItem(
    STORAGE_KEYS.permissions,
    JSON.stringify(payload.permissions),
  );
}

function clearAuthStorage() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEYS.accessToken);
  window.localStorage.removeItem(STORAGE_KEYS.refreshToken);
  window.localStorage.removeItem(STORAGE_KEYS.user);
  window.localStorage.removeItem(STORAGE_KEYS.permissions);
}

function readStoredAuth() {
  if (typeof window === "undefined") {
    return null;
  }

  const accessToken = window.localStorage.getItem(STORAGE_KEYS.accessToken);
  const refreshToken = window.localStorage.getItem(STORAGE_KEYS.refreshToken);
  const userRaw = window.localStorage.getItem(STORAGE_KEYS.user);
  const permissionsRaw = window.localStorage.getItem(STORAGE_KEYS.permissions);

  if (!accessToken || !refreshToken || !userRaw) {
    return null;
  }

  try {
    return {
      accessToken,
      refreshToken,
      user: JSON.parse(userRaw) as AdminUserSummary,
      permissions: permissionsRaw ? (JSON.parse(permissionsRaw) as string[]) : [],
    };
  } catch {
    clearAuthStorage();
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUserSummary | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const applyAuth = useCallback((payload: AdminAuthPayload) => {
    persistAuth(payload);
    setUser(payload.user);
    setPermissions(payload.permissions);
    setAccessToken(payload.accessToken);
    setRefreshToken(payload.refreshToken);
  }, []);

  const resetAuth = useCallback(() => {
    clearAuthStorage();
    setUser(null);
    setPermissions([]);
    setAccessToken(null);
    setRefreshToken(null);
  }, []);

  const refreshSession = useCallback(async () => {
    const stored = readStoredAuth();
    if (!stored?.refreshToken) {
      resetAuth();
      throw new Error("Sesi admin tidak tersedia");
    }

    const refreshed = await adminApi.refresh(stored.refreshToken);
    applyAuth(refreshed);
  }, [applyAuth, resetAuth]);

  useEffect(() => {
    const bootstrap = async () => {
      const stored = readStoredAuth();
      if (!stored) {
        setLoading(false);
        return;
      }

      setUser(stored.user);
      setPermissions(stored.permissions);
      setAccessToken(stored.accessToken);
      setRefreshToken(stored.refreshToken);

      try {
        const me = await adminApi.me();
        setUser(me.user);
        setPermissions(me.permissions);
        window.localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(me.user));
        window.localStorage.setItem(
          STORAGE_KEYS.permissions,
          JSON.stringify(me.permissions),
        );
      } catch {
        try {
          await refreshSession();
        } catch {
          resetAuth();
        }
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();
  }, [refreshSession, resetAuth]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await adminApi.login(payload);
      applyAuth(response);
      return response;
    },
    [applyAuth],
  );

  const completeActivation = useCallback(
    (payload: AdminAuthPayload) => {
      applyAuth(payload);
    },
    [applyAuth],
  );

  const logout = useCallback(
    async (redirectToLogin = true) => {
      try {
        if (accessToken) {
          await adminApi.logout();
        }
      } catch {
        // ignore network logout errors
      } finally {
        resetAuth();
        if (redirectToLogin) {
          router.push("/login");
        }
      }
    },
    [accessToken, resetAuth, router],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      permissions,
      accessToken,
      refreshToken,
      loading,
      login,
      completeActivation,
      logout,
      refreshSession,
      hasPermission: (permission?: string) => hasPermission(permissions, permission),
      hasAnyPermission: (requiredPermissions?: string[]) =>
        hasAnyPermission(permissions, requiredPermissions),
    }),
    [
      accessToken,
      completeActivation,
      loading,
      login,
      logout,
      permissions,
      refreshSession,
      refreshToken,
      user,
    ],
  );

  useEffect(() => {
    const onStorage = () => {
      const stored = readStoredAuth();
      if (!stored) {
        resetAuth();
        return;
      }
      setUser(stored.user);
      setPermissions(stored.permissions);
      setAccessToken(stored.accessToken);
      setRefreshToken(stored.refreshToken);
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [resetAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

export function useAuthErrorMessage(error: unknown) {
  return extractApiError(error);
}
