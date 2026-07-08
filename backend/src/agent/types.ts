/**
 * Agent Types - Core data structures for the autonomous rebalancing system
 */

/**
 * Positions aren't assigned a protocol until the agent's first rebalance.
 * Shared between `stellar/events.ts` (sets it on deposit) and `agent/router.ts`
 * (treats it as a 0%-APY baseline so the very first deployment isn't blocked
 * on a "current APY" that doesn't exist yet).
 */
export const UNASSIGNED_PROTOCOL = 'unassigned';

export interface YieldProtocol {
  name: string;
  apy: number;
  tvl?: number;
  assetSymbol: string;
  lastUpdated: Date;
  isAvailable: boolean;
  errorMessage?: string;
}

export interface ProtocolComparison {
  current: YieldProtocol;
  best: YieldProtocol;
  improvement: number; // percentage points
  shouldRebalance: boolean;
}

export interface RebalanceDetails {
  fromProtocol: string;
  toProtocol: string;
  amount: string;
  estimatedGasfee?: string;
  txHash?: string;
  timestamp: Date;
  improvedBy: number; // percentage points
}

export interface UserBalance {
  userId: string;
  walletAddress: string;
  positionId: string;
  protocolName: string;
  amount: string;
  currentValue: string;
  apy: number;
  snapshotAt: Date;
}

export interface AgentStatus {
  isRunning: boolean;
  lastRebalanceAt?: Date;
  currentProtocol?: string;
  currentApy?: number;
  nextScheduledCheck: Date;
  lastError?: string;
  healthStatus: 'healthy' | 'degraded' | 'error';
}

export interface AgentJobResult {
  jobName: string;
  success: boolean;
  duration: number; // milliseconds
  timestamp: Date;
  details?: Record<string, unknown>;
  error?: string;
}

export interface ProtocolRate {
  protocolName: string;
  assetSymbol: string;
  supplyApy: number;
  borrowApy?: number;
  tvl?: number;
  network: string;
  fetchedAt: Date;
}

export interface RebalanceThresholds {
  minimumImprovement: number; // 0.5% default
  maxGasPercent: number; // 0.1% default
}
