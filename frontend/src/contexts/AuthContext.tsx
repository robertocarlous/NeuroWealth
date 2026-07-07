"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { AuthSession } from "@/lib/auth-adapter";
import { getAuthAdapter } from "@/lib/auth-provider-factory";
import { analytics } from "@/lib/analytics";
import { loginWithWallet } from "@/lib/backend-auth";
import { adaptApiUser } from "@/lib/user";

import { useRouter } from "next/navigation";
import {
  SESSION_COOKIE_NAME,
  SESSION_STORAGE_KEY,
  SIGN_IN_PATH,
} from "@/lib/auth-constants";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, name: string, password: string) => Promise<void>;
  signInWithWallet: (publicKey: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function setSessionCookie(session: AuthSession) {
  if (typeof window === "undefined") return;
  const cookieValue = encodeURIComponent(
    JSON.stringify({ token: session.token, expiresAt: session.expiresAt }),
  );
  const expires = new Date(session.expiresAt).toUTCString();
  const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${SESSION_COOKIE_NAME}=${cookieValue}; path=/; expires=${expires}; SameSite=Lax${secureFlag}`;
}

function clearSessionCookie() {
  if (typeof window === "undefined") return;
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; expires=${new Date(0).toUTCString()}; SameSite=Lax`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // true until we've checked storage
  const router = useRouter();
  const authAdapter = getAuthAdapter();

  /** Derive user state from the persisted session. */
  const syncFromStorage = useCallback(() => {
    const session: AuthSession | null = authAdapter.getSession();
    setUser(session ? session.user : null);
    if (session) {
      setSessionCookie(session);
    } else {
      clearSessionCookie();
    }
  }, [authAdapter]);

  useEffect(() => {
    // Hydrate on mount
    syncFromStorage();
    setLoading(false);

    /**
     * React to sign-in / sign-out happening in OTHER browser tabs.
     * Both tabs share the same localStorage, so a storage event keeps
     * them in sync without a full page reload.
     */
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SESSION_STORAGE_KEY) {
        syncFromStorage();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [syncFromStorage]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const session = await authAdapter.signIn(email, password);
        setUser(session.user);
        setSessionCookie(session);
        analytics.track("auth_sign_in", { userId: session.user.id });
      } catch (err) {
        analytics.track("auth_sign_in_failed");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [authAdapter],
  );

  const signUp = useCallback(
    async (email: string, name: string, password: string) => {
      setLoading(true);
      try {
        const session = await authAdapter.signUp(email, name, password);
        setUser(session.user);
        setSessionCookie(session);
        analytics.track("auth_sign_up", { userId: session.user.id });
      } catch (err) {
        analytics.track("auth_sign_up_failed");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [authAdapter],
  );

  /**
   * Sign in with a connected Stellar wallet: runs the real challenge/sign/verify
   * handshake against the backend (see lib/backend-auth.ts), then persists the
   * resulting session the same way signIn/signUp do so ProtectedRoute and the
   * rest of the app don't need to know the difference.
   *
   * Stable via useCallback — callers (e.g. the login page) put this in a
   * useEffect dependency array, and an unstable reference here would refire
   * that effect on every render, including mid-request from this function's
   * own setLoading() calls.
   */
  const signInWithWallet = useCallback(async (publicKey: string) => {
    setLoading(true);
    try {
      const { token, userId, expiresAt } = await loginWithWallet(publicKey);
      const sessionUser = adaptApiUser({ id: userId, walletAddress: publicKey });
      const session: AuthSession = {
        user: sessionUser,
        token,
        expiresAt: new Date(expiresAt).getTime(),
      };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      }
      setUser(session.user);
      setSessionCookie(session);
      analytics.track("auth_sign_in", { userId: session.user.id, method: "wallet" });
    } catch (err) {
      analytics.track("auth_sign_in_failed", { method: "wallet" });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    analytics.track("auth_sign_out", { userId: user?.id });
    authAdapter.signOut();
    clearSessionCookie();
    setUser(null);
    router.push(SIGN_IN_PATH);
  }, [authAdapter, user?.id, router]);

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signInWithWallet, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
