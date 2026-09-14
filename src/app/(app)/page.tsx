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
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useBills } from "@/hooks/useBills";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/context/AuthContext";
import { computeDashboardStats, computeSalesOverview, type SalesPeriod } from "@/services/billService";
import { formatCurrency, greeting, todayIso } from "@/lib/utilities";

export default function HomePage() {
  const { user } = useAuth();
  const { bills, loading: billsLoading, error, reload, updateBillInState } = useBills();
  const { products, loading: productsLoading } = useProducts();
  const router = useRouter();

  const [period, setPeriod] = useState<SalesPeriod>("week");
  const [customRange, setCustomRange] = useState({ start: todayIso().split("T")[0], end: todayIso().split("T")[0] });

  const stats = computeDashboardStats(bills);
  const salesOverview = computeSalesOverview(bills, products, period, customRange);

  const initialLoading = (billsLoading && bills.length === 0) || (productsLoading && products.length === 0);

  async function handleTogglePaymentStatus(bill: any) {
    try {
      const newStatus = bill.paymentStatus === "paid" ? "pending" : "paid";
      
      // 1. Optimistic instant update in main state
      updateBillInState(bill.id, { paymentStatus: newStatus });

      // 2. Persist to local storage
      const { updateBill } = await import("@/services/billService");
      await updateBill(bill.id, { paymentStatus: newStatus });
      
      // 3. Background refresh not strictly needed for instant UI, but good to sync
      // We don't call reload() here because it sets loading=true and we want to keep
      // the UI perfectly snappy without background loader flashes if possible, 
      // but to ensure sync, we just let the optimistic update stay.
    } catch (err) {
      console.error(err);
      // Optional: on error we could revert, but a full reload is safer
      reload();
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
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
              Sales Overview
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as SalesPeriod)}
                className="rounded-lg border border-ink-200 bg-ink-50 px-3 py-1.5 text-sm font-medium text-ink-700 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Custom Range</option>
              </select>
              {period === "custom" && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={customRange.start}
                    onChange={(e) => setCustomRange((prev) => ({ ...prev, start: e.target.value }))}
                    className="rounded-lg border border-ink-200 bg-ink-50 px-2 py-1 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                  <span className="text-ink-400">-</span>
                  <input
                    type="date"
                    value={customRange.end}
                    onChange={(e) => setCustomRange((prev) => ({ ...prev, end: e.target.value }))}
                    className="rounded-lg border border-ink-200 bg-ink-50 px-2 py-1 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
            <div className="rounded-xl bg-ink-50 p-3.5 transition-colors hover:bg-ink-100">
              <p className="text-xs font-medium text-ink-500 uppercase tracking-wider">Total Sales</p>
              <p className="mt-1.5 font-mono text-lg font-bold text-ink-900">
                {formatCurrency(salesOverview.totalSales)}
              </p>
            </div>
            <div className="rounded-xl bg-brand-50 border border-brand-100 p-3.5 shadow-sm">
              <p className="text-xs font-medium text-brand-600 uppercase tracking-wider">Total Profit</p>
              <p className="mt-1.5 font-mono text-lg font-bold text-brand-800">
                {formatCurrency(salesOverview.totalProfit)}
              </p>
            </div>
            <div className="rounded-xl bg-ink-50 p-3.5 transition-colors hover:bg-ink-100">
              <p className="text-xs font-medium text-ink-500 uppercase tracking-wider">Total Cost</p>
              <p className="mt-1.5 font-mono text-lg font-bold text-ink-900">
                {formatCurrency(salesOverview.totalCost)}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3.5 shadow-sm">
              <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider">Received</p>
              <p className="mt-1.5 font-mono text-lg font-bold text-emerald-800">
                {formatCurrency(salesOverview.totalReceived)}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-xl bg-rose-50 border border-rose-100 p-3.5 shadow-sm">
              <p className="text-xs font-medium text-rose-700 uppercase tracking-wider">Pending</p>
              <p className="mt-1.5 font-mono text-lg font-bold text-rose-800">
                {formatCurrency(salesOverview.totalPending)}
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

        {initialLoading ? (
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
