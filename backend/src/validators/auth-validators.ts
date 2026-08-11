import { z } from 'zod';

export const authChallengeSchema = z.object({
  stellarPubKey: z.string().trim().min(1, 'stellarPubKey is required'),
});

export const authVerifySchema = z.object({
  stellarPubKey: z.string().trim().min(1, 'stellarPubKey is required'),
  signature: z.string().trim().min(1, 'signature is required'),
});

export const authGoogleSchema = z.object({
  credential: z.string().trim().min(1, 'credential is required'),
});
