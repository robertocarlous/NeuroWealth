import { OAuth2Client } from 'google-auth-library';
import { config } from '../../config/env';
import { logger } from '../logger';

/**
 * Minimal profile surface extracted from a verified Google ID token.
 */
export interface GoogleProfile {
  googleId: string;
  email: string | null;
  name: string | null;
  picture: string | null;
}

const client = new OAuth2Client(config.google.clientId);

/**
 * Verify a Google Identity Services (GIS) ID token (JWT) issued during
 * "Sign in with Google". Returns the verified profile, or null when the
 * token is invalid/expired or fails audience + issuer checks.
 *
 * The backend only needs GOOGLE_CLIENT_ID to verify — the token's signature
 * and issuer are checked against Google's public keys via
 * `google-auth-library`, and the `audience` must match our client ID.
 */
export async function verifyGoogleIdToken(
  credential: string,
): Promise<GoogleProfile | null> {
  if (!config.google.clientId) {
    logger.warn('[Auth] Google sign-in attempted but GOOGLE_CLIENT_ID is not set');
    return null;
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: config.google.clientId,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub) return null;

    return {
      googleId: payload.sub,
      email: payload.email ?? null,
      name: payload.name ?? null,
      picture: payload.picture ?? null,
    };
  } catch (error) {
    logger.warn('[Auth] Google ID token verification failed:', error);
    return null;
  }
}
