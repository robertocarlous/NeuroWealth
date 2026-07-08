"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWallet } from "@/contexts/WalletProvider";
import { ensureBackendSession, backendUrl } from "@/lib/backend-auth";
import { signTransaction } from "@/lib/stellar-wallet-kit";
import { submitSignedXdr } from "@/lib/soroban-submit";
import { formatCurrency } from "@/lib/formatters";
import { getConfiguredStellarNetwork } from "@/lib/stellar-network";
import { cn } from "@/lib/utils";

/** stellar.expert uses "public" for mainnet, "testnet" for testnet in its URL path. */
function explorerTxUrl(hash: string): string {
  const network = getConfiguredStellarNetwork() === "mainnet" ? "public" : "testnet";
  return `https://stellar.expert/explorer/${network}/tx/${hash}`;
}

type Kind = "deposit" | "withdraw";
type Stage = "form" | "pending" | "success" | "failure";

/** Extracts a readable message from either error response shape the backend uses. */
async function readBackendError(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.error === "string") return body.error;
    if (typeof body?.error?.message === "string") return body.error.message;
    if (typeof body?.error?.details?.message === "string") return body.error.details.message;
  } catch {
    // not JSON — fall through
  }
  return fallback;
}

export function DepositWithdrawForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { connected, publicKey, walletName, balances } = useWallet();

  const initialKind: Kind = searchParams.get("kind") === "withdrawal" ? "withdraw" : "deposit";
  const [kind, setKind] = useState<Kind>(initialKind);
  const [amount, setAmount] = useState("");
  const [stage, setStage] = useState<Stage>("form");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const walletUsdc = useMemo(() => {
    const entry = balances.find((b) => b.asset_code === "USDC");
    return entry ? Number(entry.balance) : 0;
  }, [balances]);

  function reset() {
    setStage("form");
    setAmount("");
    setError(null);
    setTxHash(null);
  }

  function switchKind(next: Kind) {
    setKind(next);
    reset();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const numericAmount = Number(amount);
    if (!publicKey) {
      setError("Connect your wallet first.");
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (kind === "deposit" && numericAmount > walletUsdc) {
      setError("Amount exceeds your wallet's USDC balance.");
      return;
    }

    setStage("pending");
    try {
      const token = await ensureBackendSession(publicKey);
      const buildRes = await fetch(`${backendUrl()}/api/vault/build-transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: kind,
          amount: numericAmount,
          assetSymbol: "USDC",
        }),
      });
      if (!buildRes.ok) {
        throw new Error(await readBackendError(buildRes, `Failed to build ${kind} transaction.`));
      }
      const { xdr } = await buildRes.json();

      const signedXdr = await signTransaction({ unsignedTransaction: xdr, address: publicKey });
      const result = await submitSignedXdr(signedXdr);

      if (result.status !== "SUCCESS") {
        throw new Error("The transaction was not successful on-chain.");
      }
      setTxHash(result.hash);
      setStage("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStage("failure");
    }
  }

  return (
    <div className="max-w-lg mx-auto w-full p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          {kind === "deposit" ? "Deposit" : "Withdraw"}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {kind === "deposit"
            ? "Move USDC from your connected wallet into the vault."
            : "Move USDC from the vault back to your connected wallet."}
        </p>
      </div>

      {/* Deposit / Withdraw tabs */}
      <div className="grid grid-cols-2 gap-2 rounded-lg border border-border p-1">
        {(["deposit", "withdraw"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => switchKind(option)}
            className={cn(
              "rounded-md py-2 text-sm font-medium transition-colors min-h-[40px]",
              kind === option
                ? "bg-primary text-white"
                : "text-text-secondary hover:bg-surface/80",
            )}
          >
            {option === "deposit" ? "Deposit" : "Withdraw"}
          </button>
        ))}
      </div>

      {!connected ? (
        <div className="card p-6 text-center text-sm text-text-secondary">
          Connect your wallet to {kind === "deposit" ? "deposit" : "withdraw"}.
        </div>
      ) : (
        <div className="card p-6 space-y-5">
          {stage === "success" ? (
            <div className="space-y-3 text-center py-4">
              <p className="text-lg font-semibold text-success">
                {kind === "deposit" ? "Deposit" : "Withdrawal"} confirmed
              </p>
              <p className="text-sm text-text-secondary">
                {formatCurrency(Number(amount))} has been{" "}
                {kind === "deposit" ? "deposited into" : "withdrawn from"} the vault.
              </p>

              <div className="rounded-lg bg-surface border border-border p-3 text-left space-y-1.5">
                <p className="text-xs uppercase tracking-wide text-text-muted">
                  Transaction hash
                </p>
                {txHash ? (
                  <>
                    <p className="text-xs font-mono text-text-primary break-all">{txHash}</p>
                    <a
                      href={explorerTxUrl(txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs text-primary underline underline-offset-2 hover:no-underline"
                    >
                      View on Stellar Expert ↗
                    </a>
                  </>
                ) : (
                  <p className="text-xs text-text-muted">
                    Confirmed, but no hash was returned — check Activity on the
                    dashboard for this transaction.
                  </p>
                )}
              </div>

              <button type="button" onClick={reset} className="btn-primary mt-2">
                {kind === "deposit" ? "Make another deposit" : "Make another withdrawal"}
              </button>
            </div>
          ) : stage === "failure" ? (
            <div className="space-y-3 text-center py-4">
              <p className="text-lg font-semibold text-error">
                {kind === "deposit" ? "Deposit" : "Withdrawal"} failed
              </p>
              <p className="text-sm text-text-secondary">{error}</p>
              <button type="button" onClick={reset} className="btn-primary mt-2">
                Try again
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="amount" className="text-sm font-medium text-text-primary">
                    Amount (USDC)
                  </label>
                  {kind === "deposit" && (
                    <span className="text-xs text-text-muted">
                      Wallet balance: {formatCurrency(walletUsdc)}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="amount"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.0000001"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setError(null);
                    }}
                    placeholder="0.00"
                    disabled={stage === "pending"}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 pr-16 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:ring-2 focus:ring-primary/40 focus:border-primary/60"
                  />
                  {kind === "deposit" && walletUsdc > 0 && (
                    <button
                      type="button"
                      onClick={() => setAmount(String(walletUsdc))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary font-medium"
                    >
                      Max
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-surface border border-border p-3 text-xs text-text-secondary space-y-1">
                <div className="flex items-center justify-between">
                  <span>Connected wallet</span>
                  <span className="font-mono text-text-primary">
                    {walletName ?? "Wallet"} · {publicKey?.slice(0, 6)}...{publicKey?.slice(-4)}
                  </span>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-lg bg-error/10 border border-error/20 px-4 py-3 text-sm text-error"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={stage === "pending"}
                className="btn-primary w-full min-h-[44px] flex items-center justify-center"
              >
                {stage === "pending"
                  ? "Confirm in your wallet…"
                  : kind === "deposit"
                    ? "Deposit"
                    : "Withdraw"}
              </button>
            </form>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="text-sm text-text-secondary hover:text-text-primary underline underline-offset-2"
      >
        Back to dashboard
      </button>
    </div>
  );
}
