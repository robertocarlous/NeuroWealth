/**
 * Wallet-based login against the real NeuroWealth backend (Sign-In-With-Stellar):
 * request a nonce, sign it with the connected wallet, exchange the signature for
 * a JWT. Separate from `mock-auth.ts` — this only gates calls to the real
 * backend's authenticated routes (e.g. `/api/vault/build-transaction`), not the
 * dashboard's own login-gated routes.
 *
 * Requires `NEXT_PUBLIC_BACKEND_URL` (the Express backend's origin, e.g.
 * http://localhost:3001) — see frontend/docs/env.md.
 */

import { signMessage } from "./stellar-wallet-kit";

const TOKEN_STORAGE_KEY = "nw_backend_jwt";

function backendUrl(): string {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_BACKEND_URL is not set — required for non-custodial vault operations.",
    );
  }
  return url.replace(/\/$/, "");
}

interface ChallengeResponse {
  nonce: string;
  expiresAt: string;
}

interface VerifyResponse {
  token: string;
  userId: string;
  expiresAt: string;
}

async function requestChallenge(publicKey: string): Promise<ChallengeResponse> {
  const res = await fetch(`${backendUrl()}/api/auth/challenge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stellarPubKey: publicKey }),
  });
  if (!res.ok) {
    throw new Error(`Auth challenge failed: ${res.status}`);
  }
  return res.json();
}

async function verifySignature(
  publicKey: string,
  signature: string,
): Promise<VerifyResponse> {
  const res = await fetch(`${backendUrl()}/api/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stellarPubKey: publicKey, signature }),
  });
  if (!res.ok) {
    throw new Error(`Auth verify failed: ${res.status}`);
  }
  return res.json();
}

/** Runs the full challenge → sign → verify handshake and caches the JWT. */
export async function loginWithWallet(publicKey: string): Promise<VerifyResponse> {
  const { nonce } = await requestChallenge(publicKey);
  const signature = await signMessage({ message: nonce, address: publicKey });
  const result = await verifySignature(publicKey, signature);
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(TOKEN_STORAGE_KEY, result.token);
  }
  return result;
}

export function getStoredBackendToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
}

/** Returns a cached JWT, or logs in via wallet signature if none is cached. */
export async function ensureBackendSession(publicKey: string): Promise<string> {
  const existing = getStoredBackendToken();
  if (existing) return existing;
  const { token } = await loginWithWallet(publicKey);
  return token;
}

export { backendUrl };
