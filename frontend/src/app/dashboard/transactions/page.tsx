import { DepositWithdrawForm } from "@/components/transactions/DepositWithdrawForm";
import { Suspense } from "react";
import { TransactionFormSkeleton } from "@/components/ui/Skeleton";

export const dynamic = "force-dynamic";

export default function TransactionsPage() {
  return (
    <Suspense fallback={<TransactionFormSkeleton />}>
      <DepositWithdrawForm />
    </Suspense>
  );
}
