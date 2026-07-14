"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useWallet } from "@/contexts";
import { MAIN_CONTENT_LANDMARK_ID } from "@/lib/app-landmarks";
import { Zap } from "lucide-react";
import WalletConnectButton from "@/components/WalletConnectButton";

export const dynamic = "force-dynamic";

type SignInState = "idle" | "authenticating" | "error";

function LoginContent() {
  const { user, loading, signInWithWallet } = useAuth();
  const { connected, publicKey } = useWallet();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/dashboard";

  const [state, setState] = useState<SignInState>("idle");
  const [error, setError] = useState<string | null>(null);
  const authenticatedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace(from);
    }
  }, [loading, user, router, from]);

  const attemptSignIn = useCallback(
    (key: string) => {
      authenticatedFor.current = key;
      setState("authenticating");
      setError(null);

      signInWithWallet(key).catch((err) => {
        authenticatedFor.current = null;
        setState("error");
        setError(
          err instanceof Error
            ? err.message
            : "Failed to sign in with this wallet. Please try again.",
        );
      });
    },
    [signInWithWallet],
  );

  // Once a wallet connects, run the real challenge/sign/verify handshake
  // against the backend automatically — connecting *is* signing in. Only
  // fires once per publicKey: a failed attempt sets state to "error" and
  // waits for an explicit retry rather than looping (signInWithWallet is a
  // stable reference, so this won't spuriously refire on its own).
  useEffect(() => {
    if (!connected || !publicKey) return;
    if (authenticatedFor.current === publicKey) return;
    attemptSignIn(publicKey);
  }, [connected, publicKey, attemptSignIn]);

  const isAuthenticating = state === "authenticating";

  return (
    <main
      id={MAIN_CONTENT_LANDMARK_ID}
      tabIndex={-1}
      className="min-h-screen bg-app-bg flex items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-bold text-text-primary">NeuroWealth</span>
        </div>

        <div className="card space-y-6">
          {/* Heading */}
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              Sign in to your account
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Connect your Stellar wallet — no email or password needed.
            </p>
          </div>

          {/* Authenticating state */}
          {isAuthenticating && (
            <div
              role="status"
              aria-live="polite"
              className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-3 text-sm text-primary flex items-center gap-2"
            >
              <Zap className="w-4 h-4 shrink-0 animate-pulse" aria-hidden="true" />
              Verifying wallet signature…
            </div>
          )}

          {/* Error */}
          {state === "error" && error && (
            <div
              role="alert"
              aria-live="assertive"
              className="rounded-lg bg-error/10 border border-error/20 px-4 py-3 text-sm text-error space-y-2"
            >
              <p>{error}</p>
              {publicKey && (
                <button
                  type="button"
                  onClick={() => attemptSignIn(publicKey)}
                  className="text-error underline underline-offset-2 hover:no-underline"
                >
                  Try again
                </button>
              )}
            </div>
          )}

          <WalletConnectButton theme="dark" />

          <p className="text-center text-xs text-text-muted">
            Your wallet signature proves ownership — no account, email, or password
            required. New wallets are created automatically on first connect.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
