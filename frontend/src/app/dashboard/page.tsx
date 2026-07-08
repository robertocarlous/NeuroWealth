import type { Metadata } from "next";
import { VaultDashboard } from "@/components/dashboard/VaultDashboard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Deposit and withdraw USDC, and see how NeuroWealth's AI agent is putting your funds to work.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <VaultDashboard />
    </ProtectedRoute>
  );
}
