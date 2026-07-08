import { Suspense } from "react";
import { EarningsDashboard } from "@/components/dashboard/EarningsDashboard";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export const dynamic = "force-dynamic";
export const metadata = { title: "Earnings — NeuroWealth" };

export default function PortfolioPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<DashboardSkeleton />}>
        <EarningsDashboard />
      </Suspense>
    </ProtectedRoute>
  );
}
