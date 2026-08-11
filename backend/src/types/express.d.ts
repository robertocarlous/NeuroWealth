import type { Network } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      correlationId?: string
      userId?: string
      stellarPubKey?: string | null
      auth?: {
        userId: string
        sessionId: string
        walletAddress: string | null
        network: Network
      }
    }
  }
}

export {}
