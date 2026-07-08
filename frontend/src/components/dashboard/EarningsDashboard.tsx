"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "@/contexts";
import { useWallet } from "@/contexts/WalletProvider";
import { ensureBackendSession, backendUrl } from "@/lib/backend-auth";
import { formatCurrency, formatApy } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface PositionSummary {
  id: string;
  protocolName: string;
  assetSymbol: string;
  currentValue: number;
  yieldEarned: number;
  status: string;
}

interface PortfolioSummary {
  totalBalance: number;
  totalEarnings: number;
  activePositions: number;
  positions: PositionSummary[];
}

interface EarningsSummary {
  totalEarnings: number;
  periodEarnings: number;
  averageApy: number;
}

interface HistoryPoint {
  date: string;
  yieldAmount: number;
}

type Period = "7d" | "30d" | "90d";

export function EarningsDashboard() {
  const { user } = useAuth();
  const { publicKey, connected } = useWallet();

  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [period, setPeriod] = useState<Period>("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!publicKey || !user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await ensureBackendSession(publicKey);
      const authHeaders = { Authorization: `Bearer ${token}` };

      const [summaryRes, earningsRes, historyRes] = await Promise.all([
        fetch(`${backendUrl()}/api/portfolio/${user.id}`, { headers: authHeaders }),
        fetch(`${backendUrl()}/api/portfolio/${user.id}/earnings`, { headers: authHeaders }),
        fetch(`${backendUrl()}/api/portfolio/${user.id}/history?period=${period}`, { headers: authHeaders }),
      ]);

      if (summaryRes.ok) setSummary(await summaryRes.json());
      if (earningsRes.ok) setEarnings(await earningsRes.json());
      if (historyRes.ok) {
        const data = await historyRes.json();
        // Backend returns most-recent-first; charts read left-to-right.
        setHistory([...(data.points ?? [])].reverse());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load your earnings data.");
    } finally {
      setLoading(false);
    }
  }, [publicKey, user, period]);

  useEffect(() => {
    void load();
  }, [load]);

  const hasHistory = history.length > 0;

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6 p-4 md:p-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-text-secondary hover:text-text-primary underline underline-offset-2"
        >
          ← Back to dashboard
        </Link>
        <h1 className="text-2xl font-bold text-text-primary mt-2">Earnings</h1>
        <p className="text-sm text-text-secondary mt-1">
          Your balance, yield earned, and APY over time.
        </p>
      </div>

      {!connected ? (
        <div className="card p-6 text-center text-sm text-text-secondary">
          Connect your wallet to see your earnings.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-5">
              <p className="text-xs uppercase tracking-wide text-text-muted">Balance</p>
              <p className="text-2xl font-bold text-text-primary font-mono mt-1">
                {loading && !summary ? "—" : formatCurrency(summary?.totalBalance ?? 0)}
              </p>
            </div>
            <div className="card p-5">
              <p className="text-xs uppercase tracking-wide text-text-muted">Total yield earned</p>
              <p className="text-2xl font-bold text-success font-mono mt-1">
                {loading && !summary ? "—" : formatCurrency(summary?.totalEarnings ?? 0)}
              </p>
            </div>
            <div className="card p-5">
              <p className="text-xs uppercase tracking-wide text-text-muted">Avg. APY ({period})</p>
              <p className="text-2xl font-bold text-text-primary mt-1">
                {loading && !earnings ? "—" : formatApy(earnings?.averageApy ?? 0)}
              </p>
            </div>
            <div className="card p-5">
              <p className="text-xs uppercase tracking-wide text-text-muted">Earned this period</p>
              <p className="text-2xl font-bold text-text-primary font-mono mt-1">
                {loading && !earnings ? "—" : formatCurrency(earnings?.periodEarnings ?? 0)}
              </p>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text-primary">Yield over time</h2>
              <div className="flex gap-1 rounded-lg border border-border p-1">
                {(["7d", "30d", "90d"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                      period === p
                        ? "bg-primary text-white"
                        : "text-text-secondary hover:bg-surface/80",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {error ? (
              <p className="text-sm text-error">{error}</p>
            ) : loading && !hasHistory ? (
              <div className="h-48 rounded bg-surface animate-pulse" />
            ) : !hasHistory ? (
              <p className="text-sm text-text-muted">
                No yield recorded yet for this period — check back once the agent has deployed your funds.
              </p>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={24}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={48}
                      tickFormatter={(v) => formatCurrency(Number(v))}
                    />
                    <Tooltip
                      formatter={(value) => [formatCurrency(Number(value)), "Yield"]}
                      labelFormatter={(label) => label}
                    />
                    <Area
                      type="monotone"
                      dataKey="yieldAmount"
                      stroke="var(--color-success)"
                      fill="url(#yieldGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Positions</h2>
            {loading && !summary ? (
              <div className="space-y-3">
                {[0, 1].map((i) => (
                  <div key={i} className="h-12 rounded bg-surface animate-pulse" />
                ))}
              </div>
            ) : !summary || summary.positions.length === 0 ? (
              <p className="text-sm text-text-muted">No positions yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {summary.positions.map((pos) => (
                  <li key={pos.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-text-primary capitalize">
                        {pos.protocolName}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">{pos.status.toLowerCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono text-text-primary">
                        {formatCurrency(pos.currentValue)}
                      </p>
                      <p className="text-xs font-mono text-success">
                        +{formatCurrency(pos.yieldEarned)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
