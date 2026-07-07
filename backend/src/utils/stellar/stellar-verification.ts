import { createHash } from 'crypto';
import { config } from '../../config/env';
import { Keypair } from '@stellar/stellar-sdk';

export interface NonceEntry {
  nonce: string;
  expiresAt: number; // ms since epoch
  stellarPubKey: string;
}

/**
 * In-memory nonce store. Exported as _nonceStoreForTests so integration tests
 * can inspect and pre-populate nonces without hitting the database.
 */
export const _nonceStoreForTests = new Map<string, NonceEntry>();

/**
 * SEP-53 message-signing prefix. Wallets (Freighter, etc.) don't sign the raw
 * message — they sign SHA256("Stellar Signed Message:\n" + message). Skipping
 * either the prefix or the hash step here makes every real wallet signature
 * fail verification.
 * https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0053.md
 */
const SEP53_PREFIX = 'Stellar Signed Message:\n';

export default class StellarVerification {
    /**
     * Verify a SEP-53 message signature.
     * Stellar's Keypair.verify() expects a Buffer and a base64-encoded signature.
     */
    verifyStellarSignature(
        publicKey: string,
        message: string,
        signatureBase64: string,
    ): boolean {
        try {
            const keypair = Keypair.fromPublicKey(publicKey);
            const encodedMessage = Buffer.concat([
                Buffer.from(SEP53_PREFIX, 'utf8'),
                Buffer.from(message, 'utf8'),
            ]);
            const messageHash = createHash('sha256').update(encodedMessage).digest();
            const signatureBytes = Buffer.from(signatureBase64, 'base64');
            return keypair.verify(messageHash, signatureBytes);
        } catch {
            return false;
        }
    }

    /** Remove all expired nonces (lazy cleanup called from challenge). */
    purgeExpiredNonces(): void {
        const now = Date.now();
        for (const [key, entry] of _nonceStoreForTests.entries()) {
            if (entry.expiresAt <= now) {
                _nonceStoreForTests.delete(key);
            }
        }
    }

    /** Map STELLAR_NETWORK env value to Prisma Network enum */
    resolveNetwork(): 'MAINNET' | 'TESTNET' | 'FUTURENET' {
        switch (config.stellar.network.toLowerCase()) {
            case 'mainnet':
                return 'MAINNET';
            case 'futurenet':
                return 'FUTURENET';
            case 'testnet':
            default:
                return 'TESTNET';
        }
    }
}

/** Shared singleton — imported by auth-controller */
export const stellarVerification = new StellarVerification();
