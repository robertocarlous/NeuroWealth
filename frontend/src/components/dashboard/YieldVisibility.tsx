"use client";

import { useCallback, useEffect, useState } from "react";
import { backendUrl } from "@/lib/backend-auth";
import { formatApy, formatCompactCurrency, formatTimestamp } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface ProtocolRate {
  protocolName: string;
  assetSymbol: string;
  supplyApy: number;
  borrowApy: number | null;
  tvl: number | null;
  network: string;
  fetchedAt: string;
}

interface RatesResponse {
  rates: ProtocolRate[];
}

interface YieldVisibilityProps {
  connected: boolean;
  activeProtocol: string;
  activeApy: number;
}

/** The agent only rebalances when the net gain after fees clears this bar (agent/router.ts). */
const REBALANCE_THRESHOLD_PERCENT = 0.5;

function buildReasoning(opts: {
  activeProtocol: string;
  activeApy: number;
  best?: ProtocolRate;
}): string {
  const { activeProtocol, activeApy, best } = opts;

  if (activeProtocol && activeProtocol !== "none" && best) {
    const isBest =
      best.protocolName.toLowerCase() === activeProtocol.toLowerCase();
    if (isBest) {
      return `${activeProtocol} is the best-yielding USDC pool on Stellar right now at ${formatApy(
        best.supplyApy,
      )} APY. The agent holds here and rescans every hour — it only moves your funds if another protocol clears ${REBALANCE_THRESHOLD_PERCENT}% net APY above this after network fees.`;
    }
    return `Your funds are in ${activeProtocol} at ${formatApy(
      activeApy,
    )} APY. ${best.protocolName} currently offers the best scanned USDC rate at ${formatApy(
      best.supplyApy,
    )} APY, but the agent only rebalances when the net gain after network fees exceeds ${REBALANCE_THRESHOLD_PERCENT}% — it won't move funds for a marginal difference. It rescans every hour and acts automatically if a better opportunity clears that bar.`;
  }

  return `The agent compares every Stellar USDC pool every hour and deploys into the highest-yielding one. It only switches protocols when a new option beats the current one by more than ${REBALANCE_THRESHOLD_PERCENT}% net after network fees — so small, fee-eating moves are skipped automatically.`;
}

export function YieldVisibility({
  connected,
  activeProtocol,
  activeApy,
}: YieldVisibilityProps) {
  const [rates, setRates] = useState<ProtocolRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!connected) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${backendUrl()}/api/protocols/rates`);
      if (!res.ok) throw new Error(`Failed to load protocol rates (${res.status})`);
      const data = (await res.json()) as RatesResponse;

      // Keep the latest scan per USDC pool (the vault's asset).
      const latestByProtocol = new Map<string, ProtocolRate>();
      for (const rate of data.rates ?? []) {
        if (rate.assetSymbol !== "USDC") continue;
        const current = latestByProtocol.get(rate.protocolName);
        if (!current || rate.fetchedAt > current.fetchedAt) {
          latestByProtocol.set(rate.protocolName, rate);
        }
      }

      const pools = Array.from(latestByProtocol.values()).sort(
        (a, b) => b.supplyApy - a.supplyApy,
      );
      setRates(pools);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load yield rates.");
    } finally {
      setLoading(false);
    }
  }, [connected]);

  useEffect(() => {
    void load();
  }, [load]);

  const best = rates.length > 0 ? rates[0] : undefined;
  const isDeployed =
    Boolean(activeProtocol && activeProtocol !== "none") && activeApy > 0;
  const reasoning = buildReasoning({ activeProtocol, activeApy, best });
  const lastScan = rates.reduce<string | null>(
    (latest, rate) => (!latest || rate.fetchedAt > latest ? rate.fetchedAt : latest),
    null,
  );

  return (
    <div className="card p-6" data-qa="yield-visibility-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">
            Yield opportunities
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Live supply APY across Stellar USDC pools — see why the agent picks
            what it picks.
          </p>
        </div>
        {lastScan && (
          <span className="shrink-0 text-xs text-text-muted">
            Scanned {formatTimestamp(lastScan)}
          </span>
        )}
      </div>

      {!connected ? (
        <p className="mt-4 text-sm text-text-secondary">
          Connect your wallet to see live yield rates across Stellar protocols.
        </p>
      ) : error ? (
        <p className="mt-4 text-sm text-error">{error}</p>
      ) : loading && rates.length === 0 ? (
        <div className="mt-4 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-surface animate-pulse" />
          ))}
        </div>
      ) : rates.length === 0 ? (
        <p className="mt-4 text-sm text-text-muted">
          No USDC yield rates available yet — the agent has not completed a scan.
        </p>
      ) : (
        <>
          <div className="mt-4 space-y-2">
            {rates.map((rate) => {
              const isActive =
                isDeployed &&
                rate.protocolName.toLowerCase() === activeProtocol.toLowerCase();
              const isBest = rate.protocolName === best?.protocolName;
              return (
                <div
                  key={rate.protocolName}
                  className={cn(
                    "flex items-center justify-between gap-4 rounded-lg border px-4 py-3",
                    isActive
                      ? "border-primary/60 bg-primary/5"
                      : "border-border bg-surface/40",
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-text-primary capitalize truncate">
                      {rate.protocolName}
                    </span>
                    {isBest && (
                      <span className="shrink-0 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                        Best APY
                      </span>
                    )}
                    {isActive && (
                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                        Your funds
                      </span>
                    )}
                    <span className="shrink-0 text-[11px] text-text-muted uppercase tracking-wide">
                      {rate.network}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {rate.tvl != null && (
                      <span className="text-xs text-text-muted hidden sm:block">
                        {formatCompactCurrency(rate.tvl)} TVL
                      </span>
                    )}
                    <span
                      className={cn(
                        "text-sm font-semibold font-mono",
                        isActive ? "text-success" : "text-text-primary",
                      )}
                    >
                      {formatApy(rate.supplyApy)} APY
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex gap-3 rounded-lg border border-border bg-surface/60 p-4">
            <span className="mt-0.5 shrink-0 h-2 w-2 rounded-full bg-primary" />
            <div>
              <p className="text-xs font-semibold text-text-primary uppercase tracking-wide">
                Why this protocol
              </p>
              <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                {reasoning}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
