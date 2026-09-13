"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Receipt, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { BillCard } from "@/components/bills/BillCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { useBills } from "@/hooks/useBills";
import { useAuth } from "@/context/AuthContext";
import { computeDashboardStats } from "@/services/billService";
import { formatCurrency, greeting } from "@/lib/utilities";

export default function HomePage() {
  const { user } = useAuth();
  const { bills, loading, error, reload } = useBills();
  const router = useRouter();

  const stats = computeDashboardStats(bills);

  async function handleTogglePaymentStatus(bill: any) {
    try {
      const newStatus = bill.paymentStatus === "Paid" ? "Pending" : "Paid";
      // Update directly via the bill service
      await import("@/services/billService").then(m => m.updateBill(bill.id, { paymentStatus: newStatus }));
      reload(); // refresh bills
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <PageHeader
        title={greeting()}
        subtitle={user?.name ? user.name : undefined}
      />

      <div className="px-4 sm:px-6">
        <div className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-5 text-white shadow-floating">
          <div className="grid grid-cols-2 divide-x divide-white/20">
            <div className="pr-4">
              <p className="text-sm font-medium text-white/80">Today&apos;s Total</p>
              <p className="mt-1 font-mono text-2xl font-bold">
                {formatCurrency(stats.todaysTotal)}
              </p>
            </div>
            <div className="pl-4">
              <p className="text-sm font-medium text-white/80">Today&apos;s Bills</p>
              <p className="mt-1 text-2xl font-bold">
                {stats.todaysBillCount} <span className="text-base font-medium">Bills Today</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-400">
            Payment Tracking
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink-500">Total Sales</p>
              <p className="mt-1 font-mono text-lg font-bold text-ink-900">
                {formatCurrency(stats.totalSales)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-success">Received</p>
              <p className="mt-1 font-mono text-lg font-bold text-ink-900">
                {formatCurrency(stats.totalReceived)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-danger">Pending</p>
              <p className="mt-1 font-mono text-lg font-bold text-ink-900">
                {formatCurrency(stats.totalPending)}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push("/bills/new")}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink-900 py-4 text-base font-semibold text-white shadow-floating transition-transform active:scale-[0.99] focus-ring"
        >
          <Plus size={20} />
          Create New Bill
        </button>
      </div>

      <div className="mt-7 px-4 sm:px-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-ink-900">Recent Bills</h2>
          {bills.length > 0 && (
            <Link href="/bills" className="text-sm font-medium text-brand-600 hover:underline">
              View all
            </Link>
          )}
        </div>

        {loading ? (
          <LoadingState rows={3} />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : stats.recentBills.length === 0 ? (
          <EmptyState
            icon={<Receipt size={26} />}
            title="No bills created yet."
            body="Create your first bill to get started."
            actionLabel="Create Your First Bill"
            onAction={() => router.push("/bills/new")}
          />
        ) : (
          <div className="space-y-3">
            {stats.recentBills.map((b) => (
              <BillCard key={b.id} bill={b} onTogglePaymentStatus={handleTogglePaymentStatus} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-2 px-4 pb-4 sm:px-6">
        <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-xs text-brand-700">
          <FileText size={16} className="shrink-0" />
          Physical bill formats: SHAREEF TRADERS and AL-GHANI TRADERS.
        </div>
      </div>
    </div>
  );
}
