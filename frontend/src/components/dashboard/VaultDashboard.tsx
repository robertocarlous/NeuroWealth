"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts";
import { useWallet } from "@/contexts/WalletProvider";
import { ensureBackendSession, backendUrl } from "@/lib/backend-auth";
import { formatCurrency, formatApy, formatSignedCurrency, formatTimestamp } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface VaultState {
  apy: number;
  activeProtocol: string;
}

interface VaultBalance {
  balance: number;
  shares: number;
}

interface TransactionItem {
  id: string;
  txHash: string;
  type: string;
  status: string;
  amount: number | null;
  assetSymbol: string;
  protocolName: string | null;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  DEPOSIT: "Deposit",
  WITHDRAWAL: "Withdrawal",
  REBALANCE: "Agent rebalance",
  YIELD_CLAIM: "Yield claim",
  SWAP: "Swap",
};

export function VaultDashboard() {
  const { user } = useAuth();
  const { publicKey, connected } = useWallet();

  const [vaultState, setVaultState] = useState<VaultState | null>(null);
  const [balance, setBalance] = useState<VaultBalance | null>(null);
  const [activity, setActivity] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!publicKey || !user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await ensureBackendSession(publicKey);
      const authHeaders = { Authorization: `Bearer ${token}` };

      const [stateRes, balanceRes, txRes] = await Promise.all([
        fetch(`${backendUrl()}/api/vault/state`),
        fetch(`${backendUrl()}/api/vault/balance`, { headers: authHeaders }),
        fetch(`${backendUrl()}/api/transactions/${user.id}?limit=25`, { headers: authHeaders }),
      ]);

      if (stateRes.ok) setVaultState(await stateRes.json());
      if (balanceRes.ok) setBalance(await balanceRes.json());
      if (txRes.ok) {
        const data = await txRes.json();
        setActivity(data.transactions ?? []);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load your vault data.",
      );
    } finally {
      setLoading(false);
    }
  }, [publicKey, user]);

  useEffect(() => {
    void load();
  }, [load]);

  const hasFunds = Boolean(balance && balance.balance > 0);
  const isDeployed = Boolean(
    vaultState && vaultState.activeProtocol && vaultState.activeProtocol !== "none",
  );

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6 p-4 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Your vault</h1>
          <p className="text-sm text-text-secondary mt-1">
            Deposit USDC and NeuroWealth&apos;s AI agent puts it to work across Stellar
            DeFi automatically.
          </p>
        </div>
        {connected && (
          <Link
            href="/dashboard/portfolio"
            className="text-sm text-primary underline underline-offset-2 hover:no-underline shrink-0 mt-1"
          >
            View earnings →
          </Link>
        )}
      </div>

      {!connected ? (
        <div className="card p-6 text-center text-sm text-text-secondary">
          Connect your wallet from the top of the page to see your balance and
          activity.
        </div>
      ) : (
        <>
          {/* Balance */}
          <div className="card p-6 space-y-5">
            {loading && !balance ? (
              <div className="animate-pulse space-y-3">
                <div className="h-3 w-24 rounded bg-surface" />
                <div className="h-9 w-40 rounded bg-surface" />
              </div>
            ) : (
              <div>
                <p className="text-xs uppercase tracking-wide text-text-muted">
                  Your balance
                </p>
                <p className="text-3xl font-bold text-text-primary font-mono mt-1">
                  {formatCurrency(balance?.balance ?? 0)}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Link
                href="/dashboard/transactions?kind=deposit"
                className="btn-primary flex-1 text-center min-h-[44px] flex items-center justify-center"
                data-qa="dashboard-deposit-button"
              >
                Deposit
              </Link>
              <Link
                href="/dashboard/transactions?kind=withdrawal"
                aria-disabled={!hasFunds}
                data-qa="dashboard-withdraw-button"
                className={cn(
                  "flex-1 text-center min-h-[44px] flex items-center justify-center rounded-lg border border-border text-text-primary transition-colors",
                  hasFunds
                    ? "hover:bg-surface/80"
                    : "opacity-50 pointer-events-none",
                )}
              >
                Withdraw
              </Link>
            </div>
          </div>

          {/* AI agent status — where your money actually is */}
          <div className="card p-6 space-y-3" data-qa="agent-status-card">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">
                AI agent status
              </h2>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                  isDeployed
                    ? "bg-success/10 text-success"
                    : "bg-surface text-text-muted border border-border",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isDeployed ? "bg-success" : "bg-text-muted",
                  )}
                />
                {isDeployed ? "Active" : "Idle"}
              </span>
            </div>

            {loading && !vaultState ? (
              <div className="h-4 w-64 rounded bg-surface animate-pulse" />
            ) : isDeployed && vaultState ? (
              <p className="text-sm text-text-secondary leading-relaxed">
                Your funds are deployed in{" "}
                <span className="font-medium text-text-primary capitalize">
                  {vaultState.activeProtocol}
                </span>
                , currently earning{" "}
                <span className="font-semibold text-success">
                  {formatApy(vaultState.apy)} APY
                </span>
                . New deposits are deployed within seconds, and the agent
                re-checks hourly afterward, moving your funds automatically
                if a better opportunity appears — no action needed from you.
              </p>
            ) : (
              <p className="text-sm text-text-secondary leading-relaxed">
                {hasFunds
                  ? "Your deposit is in the vault — the agent deploys idle funds into the best available protocol (e.g. Blend) within seconds of a deposit confirming on-chain. Refresh in a moment if this doesn't update right away."
                  : "Nothing to deploy yet. As soon as you deposit, the agent picks up the funds and moves them into a yield strategy within seconds — you don't need to do anything else."}
              </p>
            )}
          </div>

          {/* Agent activity */}
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-text-primary mb-4">
              Agent activity
            </h2>

            {error ? (
              <p className="text-sm text-error">{error}</p>
            ) : loading && activity.length === 0 ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-12 rounded bg-surface animate-pulse" />
                ))}
              </div>
            ) : activity.length === 0 ? (
              <p className="text-sm text-text-muted">
                No activity yet — make your first deposit to get started.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {activity.map((tx) => {
                  const isWithdrawal = tx.type === "WITHDRAWAL";
                  const signedAmount =
                    tx.amount == null
                      ? null
                      : formatSignedCurrency(
                          isWithdrawal ? -Math.abs(tx.amount) : Math.abs(tx.amount),
                        );

                  return (
                    <li
                      key={tx.id}
                      className="py-3 flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {TYPE_LABELS[tx.type] ?? tx.type}
                          {tx.type === "REBALANCE" && tx.protocolName
                            ? ` → ${tx.protocolName}`
                            : ""}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {formatTimestamp(tx.createdAt)} ·{" "}
                          {tx.status.toLowerCase()}
                        </p>
                      </div>
                      {signedAmount && (
                        <span className="text-sm font-mono text-text-primary shrink-0">
                          {signedAmount}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
