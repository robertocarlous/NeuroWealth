import {
  Keypair,
  Contract,
  rpc,
  TransactionBuilder,
  Transaction,
  BASE_FEE,
  xdr,
  scValToNative,
  nativeToScVal,
} from '@stellar/stellar-sdk';
import { getRpcServer, getNetworkPassphrase, getAgentKeypair, submitTransaction, waitForConfirmation, simulateTransaction, prepareTransaction, getAccount } from './client';
import { getKeypairForUser } from './wallet';
import { config } from '../config';
import { OnChainBalance, TransactionResult } from './types';

const VAULT_CONTRACT_ID = config.stellar.vaultContractId;
const STROOPS_PER_TOKEN = 10_000_000n;

export type VaultWriteMethod = 'deposit' | 'withdraw';

/**
 * Get vault contract instance
 */
function getVaultContract(): Contract {
  if (!VAULT_CONTRACT_ID) {
    throw new Error('VAULT_CONTRACT_ID not configured');
  }
  return new Contract(VAULT_CONTRACT_ID);
}

/**
 * Build contract invocation transaction
 */
async function buildContractCall(
  method: string,
  args: xdr.ScVal[],
  sourcePublicKey: string = getAgentKeypair().publicKey(),
): Promise<Transaction> {
  const server = getRpcServer();
  const contract = getVaultContract();
  const account = await getAccount(sourcePublicKey);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();
  return tx;
}

function toContractAmount(amount: number): bigint {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be a positive number');
  }

  return BigInt(Math.round(amount * Number(STROOPS_PER_TOKEN)));
}

async function executeWriteContractCall(
  method: string,
  args: xdr.ScVal[],
  signer: Keypair,
): Promise<TransactionResult> {
  const tx = await buildContractCall(method, args, signer.publicKey());

  // Pre-Transaction Simulation & Validation (Issue #58)
  const simulation = await simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simulation)) {
    throw new Error(`Transaction simulation failed for ${method}: ${simulation.error}`);
  }
  if (!simulation.result) {
    throw new Error(`Transaction simulation failed for ${method}: No result returned from simulation`);
  }

  const prepared = await prepareTransaction(tx);
  prepared.sign(signer);

  const txHash = await submitTransaction(prepared);
  const result = await waitForConfirmation(txHash);

  if (result.status !== 'success') {
    throw new Error(`Transaction ${method} failed on-chain`);
  }

  return result;
}

/**
 * Execute a custodial user operation against the vault contract.
 *
 * Signing strategy:
 * - The backend uses the encrypted user secret managed by src/stellar/wallet.ts
 * - Only the public address is passed to the contract arguments
 * - User secrets are never logged or returned from this module
 */
async function executeCustodialVaultOperation(
  method: VaultWriteMethod,
  userId: string,
  userAddress: string,
  amount: number,
): Promise<TransactionResult> {
  const signer = await getKeypairForUser(userId);
  const userScVal = nativeToScVal(userAddress, { type: 'address' });
  const amountScVal = nativeToScVal(toContractAmount(amount), { type: 'i128' });

  // The vault contract's deposit/withdraw take only (user, amount) — it holds
  // a single configured USDC token (see initialize()), not a per-call asset.
  return executeWriteContractCall(method, [userScVal, amountScVal], signer);
}

/**
 * Simulate and parse contract read call
 */
async function simulateRead(method: string, args: xdr.ScVal[] = []): Promise<any> {
  const tx = await buildContractCall(method, args);
  
  const simulation = await simulateTransaction(tx);
  
  if (rpc.Api.isSimulationError(simulation)) {
    throw new Error(`Simulation failed: ${simulation.error}`);
  }
  
  if (!simulation.result) {
    throw new Error('No result from simulation');
  }
  
  return scValToNative(simulation.result.retval);
}

/**
 * Get on-chain balance for user
 */
export async function getOnChainBalance(userAddress: string): Promise<OnChainBalance> {
  const addressScVal = nativeToScVal(userAddress, { type: 'address' });
  const [balance, shares] = await Promise.all([
    simulateRead('get_balance', [addressScVal]),
    simulateRead('get_shares', [addressScVal]),
  ]);

  return {
    balance: balance?.toString() || '0',
    shares: shares?.toString() || '0',
  };
}

/**
 * Get active protocol.
 *
 * The vault contract has no APY getter — APY is an off-chain concept the
 * agent computes from external protocol rates (see `agent/scanner.ts`), not
 * on-chain vault state. Callers needing an APY should look up the most
 * recent `ProtocolRate` row for the protocol name returned here.
 */
export async function getActiveProtocol(): Promise<string> {
  return await simulateRead('get_current_protocol');
}

/**
 * Trigger rebalance (agent only).
 *
 * Real signature: `rebalance(protocol: Symbol, expected_apy: i128, min_out: i128)`.
 * `minOut` defaults to 0 (disables slippage protection) — callers that need
 * a slippage floor should pass it explicitly.
 */
export async function triggerRebalance(
  protocol: string,
  expectedApyBasisPoints: number,
  minOut: string | bigint = 0n,
): Promise<TransactionResult> {
  const protocolScVal = nativeToScVal(protocol, { type: 'symbol' });
  const apyScVal = nativeToScVal(BigInt(expectedApyBasisPoints), { type: 'i128' });
  const minOutScVal = nativeToScVal(BigInt(minOut), { type: 'i128' });
  const keypair = getAgentKeypair();

  return executeWriteContractCall(
    'rebalance',
    [protocolScVal, apyScVal, minOutScVal],
    keypair,
  );
}

/**
 * Update total assets (agent only).
 *
 * Real signature: `update_total_assets(agent: Address, new_total: i128,
 * allow_decrease: bool, max_decrease_bps: u32)`. A decrease additionally
 * requires the owner to co-sign — not needed for the increase-only path
 * used by the yield-reporting job (`allowDecrease = false`).
 */
export async function updateTotalAssets(
  newTotalStroops: string,
  allowDecrease = false,
  maxDecreaseBps = 0,
): Promise<TransactionResult> {
  const keypair = getAgentKeypair();
  const agentScVal = nativeToScVal(keypair.publicKey(), { type: 'address' });
  const amountScVal = nativeToScVal(BigInt(newTotalStroops), { type: 'i128' });
  const allowDecreaseScVal = nativeToScVal(allowDecrease, { type: 'bool' });
  const maxDecreaseBpsScVal = nativeToScVal(maxDecreaseBps, { type: 'u32' });

  return executeWriteContractCall(
    'update_total_assets',
    [agentScVal, amountScVal, allowDecreaseScVal, maxDecreaseBpsScVal],
    keypair,
  );
}

/**
 * Submit a user-signed deposit transaction to the vault contract.
 */
export async function deposit(
  userId: string,
  userAddress: string,
  amount: number,
): Promise<TransactionResult> {
  return depositForUser(userId, userAddress, amount);
}

export async function depositForUser(
  userId: string,
  userAddress: string,
  amount: number,
): Promise<TransactionResult> {
  return executeCustodialVaultOperation('deposit', userId, userAddress, amount);
}

/**
 * Submit a user-signed withdrawal transaction to the vault contract.
 */
export async function withdraw(
  userId: string,
  userAddress: string,
  amount: number,
): Promise<TransactionResult> {
  return withdrawForUser(userId, userAddress, amount);
}

export async function withdrawForUser(
  userId: string,
  userAddress: string,
  amount: number,
): Promise<TransactionResult> {
  return executeCustodialVaultOperation('withdraw', userId, userAddress, amount);
}

/**
 * Build an unsigned XDR transaction for non-custodial signing.
 * The backend constructs and prepares the transaction but never signs it.
 * The client (e.g. Freighter) signs and submits the returned XDR.
 *
 * `assetSymbol` is accepted for API-level bookkeeping only (matching the
 * request/DB shape) — the contract's deposit/withdraw take only (user,
 * amount); it holds a single configured USDC token set at initialize().
 */
export async function buildUnsignedVaultTransaction(
  method: VaultWriteMethod,
  userAddress: string,
  amount: number,
  _assetSymbol: string,
): Promise<string> {
  const userScVal = nativeToScVal(userAddress, { type: 'address' });
  const amountScVal = nativeToScVal(toContractAmount(amount), { type: 'i128' });

  const tx = await buildContractCall(method, [userScVal, amountScVal], userAddress);

  // Pre-Transaction Simulation & Validation (Issue #58)
  const simulation = await simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simulation)) {
    throw new Error(`Transaction simulation failed for ${method}: ${simulation.error}`);
  }
  if (!simulation.result) {
    throw new Error(`Transaction simulation failed for ${method}: No result returned from simulation`);
  }

  const prepared = await prepareTransaction(tx);

  return prepared.toXDR();
}
