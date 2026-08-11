import { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import { Keypair } from '@stellar/stellar-sdk';
import { JwtAdapter, config } from '../config';
import { logger } from '../utils/logger';
import db from '../db';
import { stellarVerification } from '../utils/stellar/stellar-verification';
import { verifyGoogleIdToken } from '../utils/auth/google-verification';

/** Shared helper: issue a JWT + persist a session row for an authenticated user. */
async function issueSession(
  user: { id: string },
  req: Request,
  sessionData: { walletAddress: string | null },
): Promise<{ token: string; expiresAt: Date }> {
  const expiresAt = new Date(Date.now() + config.jwt.session_ttl_hours * 60 * 60 * 1000);
  const token = await JwtAdapter.generateToken({ id: user.id }, config.jwt.session_ttl_hours);

  if (!token) {
    throw new Error('Failed to generate token');
  }

  await db.session.create({
    data: {
      userId: user.id,
      token,
      walletAddress: sessionData.walletAddress,
      network: stellarVerification.resolveNetwork(),
      expiresAt,
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    },
  });

  return { token, expiresAt };
}

// Controllers

/**
 * POST /api/auth/challenge
 *
 * Body: { stellarPubKey: string }
 * Returns: { nonce: string, expiresAt: ISO-8601 }
 *
 * Issues a one-time nonce tied to the caller's Stellar public key.
 * The nonce must be signed and returned to /verify within 5 minutes.
 * Nonces are persisted in Postgres so they survive restarts and work
 * correctly across multiple app instances.
 */
export async function challenge(req: Request, res: Response): Promise<void> {
  const { stellarPubKey } = req.body as { stellarPubKey: string };

  // Validate the public key format
  try {
    Keypair.fromPublicKey(stellarPubKey);
  } catch {
    res.status(400).json({ error: 'Invalid Stellar public key' });
    return;
  }

  const nonce = `nw-auth-${randomBytes(32).toString('hex')}`;
  const expiresAt = new Date(Date.now() + config.jwt.nonce_ttl_ms);

  // Upsert so a second challenge call overwrites the previous nonce
  await db.authNonce.upsert({
    where: { stellarPubKey },
    update: { nonce, expiresAt },
    create: { stellarPubKey, nonce, expiresAt },
  });

  logger.info(`[Auth] Challenge issued for ${stellarPubKey}`);

  res.status(200).json({
    nonce,
    expiresAt: expiresAt.toISOString(),
  });
}

/**
 * POST /api/auth/verify
 *
 * Body: { stellarPubKey: string, signature: string (base64) }
 * Returns: { token: string, userId: string, expiresAt: ISO-8601 }
 *
 * Steps:
 *  1. Look up stored nonce for this public key.
 *  2. Reject expired nonces (replay prevention).
 *  3. Verify Stellar signature over the nonce.
 *  4. Consume nonce to prevent reuse.
 *  5. Create or retrieve user + portfolio position.
 *  6. Issue JWT and store session in DB.
 */
export async function verify(req: Request, res: Response): Promise<void> {
  const { stellarPubKey, signature } = req.body as {
    stellarPubKey: string;
    signature: string;
  };

  // 1. Look up nonce in DB
  const stored = await db.authNonce.findUnique({ where: { stellarPubKey } });
  if (!stored) {
    res.status(401).json({ error: 'No active challenge for this public key' });
    return;
  }

  // 2. Check nonce expiry
  if (stored.expiresAt <= new Date()) {
    await db.authNonce.delete({ where: { stellarPubKey } });
    res.status(401).json({ error: 'Challenge nonce has expired' });
    return;
  }

  // 3. Verify Stellar signature
  const isValid = stellarVerification.verifyStellarSignature(
    stellarPubKey,
    stored.nonce,
    signature,
  );
  if (!isValid) {
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  // 4. Consume nonce — prevents replay attacks
  await db.authNonce.delete({ where: { stellarPubKey } });

  const network = stellarVerification.resolveNetwork();

  try {
    // 5. Create or fetch user
    let user = await db.user.findUnique({
      where: { walletAddress: stellarPubKey },
    });

    if (!user) {
      // Auto-create user + empty portfolio position
      user = await db.user.create({
        data: {
          walletAddress: stellarPubKey,
          network,
          positions: {
            create: {
              protocolName: 'unassigned',
              assetSymbol: 'USDC',
              depositedAmount: 0,
              currentValue: 0,
            },
          },
        },
      });
      logger.info(`[Auth] New user created: ${user.id} (${stellarPubKey})`);
    }

    // 6. Issue JWT + session
    const { token, expiresAt } = await issueSession(
      user,
      req,
      { walletAddress: stellarPubKey },
    );

    logger.info(`[Auth] Session created for user ${user.id}`);

    res.status(200).json({
      token,
      userId: user.id,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    logger.error('[Auth] Verify error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/auth/google
 *
 * Body: { credential: string }  — a Google Identity Services ID token (JWT)
 * Returns: { token: string, userId: string, expiresAt: ISO-8601 }
 *
 * Steps:
 *  1. Verify the Google ID token signature + audience with google-auth-library.
 *  2. Find the user by googleId, else by verified email; create if neither exists.
 *  3. Link the googleId to the account so future sign-ins are stable.
 *  4. Issue JWT and store session in DB (no wallet attached until one is linked).
 *
 * Requires GOOGLE_CLIENT_ID to be configured on the backend; otherwise 503.
 */
export async function googleSignIn(req: Request, res: Response): Promise<void> {
  const { credential } = req.body as { credential: string };

  if (!config.google.clientId) {
    res.status(503).json({ error: 'Google sign-in is not configured on this server' });
    return;
  }

  // 1. Verify the ID token (signature + audience + issuer)
  const profile = await verifyGoogleIdToken(credential);
  if (!profile) {
    res.status(401).json({ error: 'Invalid Google credential' });
    return;
  }

  try {
    // 2. Find by googleId first, then by verified email (account linking)
    let user = await db.user.findUnique({ where: { googleId: profile.googleId } });

    if (!user && profile.email) {
      user = await db.user.findUnique({ where: { email: profile.email } });
    }

    // 3. Create or link
    if (!user) {
      user = await db.user.create({
        data: {
          googleId: profile.googleId,
          email: profile.email ?? undefined,
          displayName: profile.name ?? undefined,
          avatarUrl: profile.picture ?? undefined,
          positions: {
            create: {
              protocolName: 'unassigned',
              assetSymbol: 'USDC',
              depositedAmount: 0,
              currentValue: 0,
            },
          },
        },
      });
      logger.info(`[Auth] New Google user created: ${user.id} (${profile.googleId})`);
    } else if (!user.googleId) {
      user = await db.user.update({
        where: { id: user.id },
        data: { googleId: profile.googleId },
      });
      logger.info(`[Auth] Linked Google identity to existing user ${user.id}`);
    }

    // 4. Issue JWT + session (wallet-linked later — Google is the primary identity)
    const { token, expiresAt } = await issueSession(user, req, { walletAddress: null });

    logger.info(`[Auth] Google session created for user ${user.id}`);

    res.status(200).json({
      token,
      userId: user.id,
      expiresAt: expiresAt.toISOString(),
      // Profile fields so the frontend can build a rich session without
      // re-decoding the Google ID token client-side.
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      avatarUrl: user.avatarUrl ?? null,
      walletAddress: user.walletAddress ?? null,
    });
  } catch (error) {
    logger.error('[Auth] Google sign-in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/auth/logout
 *
 * Requires a valid JWT (via AuthMiddleware.validateJwt).
 * Deletes the session from the database so the token cannot be reused.
 */
export async function logout(req: Request, res: Response): Promise<void> {
  const authorization = req.header('Authorization') ?? '';
  const token = authorization.split(' ')[1] ?? '';

  try {
    await db.session.deleteMany({ where: { token } });
    logger.info(`[Auth] Session revoked for user ${req.userId}`);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('[Auth] Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
