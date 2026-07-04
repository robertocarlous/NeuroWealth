/**
 * Submits an already-signed Soroban transaction (XDR) directly from the
 * browser to Stellar's Soroban RPC and polls until it confirms.
 *
 * Part of the non-custodial deposit/withdraw flow: the backend only builds
 * unsigned XDR (`POST /vault/build-transaction`) and never sees the signed
 * transaction — the connected wallet signs it, and it goes straight to the
 * network from here.
 */

import { rpc, TransactionBuilder } from "@stellar/stellar-sdk";
import { getConfiguredNetworkPassphrase } from "./stellar-network";

function getRpcUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org"
  );
}

export interface SubmitResult {
  status: "SUCCESS" | "FAILED";
  hash: string;
}

const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 20;

/** Submits a signed transaction envelope XDR and waits for it to land. */
export async function submitSignedXdr(signedXdr: string): Promise<SubmitResult> {
  const server = new rpc.Server(getRpcUrl());
  const tx = TransactionBuilder.fromXDR(signedXdr, getConfiguredNetworkPassphrase());

  const sendResponse = await server.sendTransaction(tx);
  if (sendResponse.status === "ERROR") {
    throw new Error(`Transaction submission failed: ${JSON.stringify(sendResponse.errorResult)}`);
  }

  const hash = sendResponse.hash;

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    const result = await server.getTransaction(hash);
    if (result.status === "SUCCESS") {
      return { status: "SUCCESS", hash };
    }
    if (result.status === "FAILED") {
      return { status: "FAILED", hash };
    }
    // status === "NOT_FOUND" — still pending, keep polling
  }

  throw new Error(`Transaction ${hash} did not confirm within the polling window`);
}
