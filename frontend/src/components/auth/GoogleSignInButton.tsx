"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (
            element: HTMLElement,
            options: Record<string, unknown>,
          ) => void;
        };
      };
    };
  }
}

const GIS_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

interface GoogleSignInButtonProps {
  /** Receives the Google ID token (JWT `credential`) to exchange for a session. */
  onCredential: (credential: string) => void;
  /** Fired when the Google script fails to load and the button can't render. */
  onLoadError?: (message: string) => void;
  disabled?: boolean;
}

/**
 * "Sign in with Google" button backed by Google Identity Services (GIS).
 *
 * Renders the standard Google button when `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is
 * configured. When it isn't (demo mode), the button renders nothing and the
 * page falls back to wallet-only sign-in. The Google script is injected
 * lazily on first mount so non-login pages never load it.
 */
export default function GoogleSignInButton({
  onCredential,
  onLoadError,
  disabled = false,
}: GoogleSignInButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const containerId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const onCredentialRef = useRef(onCredential);
  onCredentialRef.current = onCredential;

  const handleCredentialResponse = useCallback(
    (response: { credential?: string }) => {
      if (response.credential) {
        onCredentialRef.current(response.credential);
      }
    },
    [],
  );

  useEffect(() => {
    if (!clientId || loadFailed) return;

    let cancelled = false;

    const renderButton = () => {
      if (cancelled || !containerRef.current) return;
      const gis = window.google?.accounts?.id;
      if (!gis) return;
      gis.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        ux_mode: "popup",
      });
      gis.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        width: 300,
        text: "continue_with",
      });
    };

    // Script already loaded (e.g. earlier page visit) — render immediately.
    if (window.google?.accounts?.id) {
      renderButton();
      return;
    }

    const script = document.createElement("script");
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = renderButton;
    script.onerror = () => {
      if (cancelled) return;
      setLoadFailed(true);
      onLoadError?.("Google sign-in is temporarily unavailable.");
    };
    document.head.appendChild(script);

    return () => {
      cancelled = true;
    };
  }, [clientId, handleCredentialResponse, onLoadError, loadFailed]);

  if (!clientId || loadFailed) return null;

  return (
    <div
      ref={containerRef}
      id={`google-signin-${containerId}`}
      className={disabled ? "pointer-events-none opacity-60" : undefined}
      aria-label="Sign in with Google"
    />
  );
}
