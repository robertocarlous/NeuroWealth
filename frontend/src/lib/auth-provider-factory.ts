/**
 * auth-provider-factory.ts
 *
 * Factory for creating auth provider instances.
 * Allows swapping between mock and real auth implementations.
 */

import type { AuthAdapter } from "./auth-adapter";
import { mockAuth } from "./mock-auth";

/**
 * Get the current auth adapter instance.
 * In development, this returns mockAuth.
 * In production, this would return a real backend adapter.
 */
export function getAuthAdapter(): AuthAdapter {
    // TODO: In production, check environment and return real backend adapter
    return mockAuth;
}
