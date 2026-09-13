"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Receipt } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { Select } from "@/components/ui/Select";
import { BillCard } from "@/components/bills/BillCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { useBills } from "@/hooks/useBills";
import { filterBills } from "@/services/billService";
import type { BillTypeId } from "@/types/bill";

export default function BillsPage() {
  const { bills, loading, error, reload, updateBillInState } = useBills();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [billType, setBillType] = useState<BillTypeId | "all">("all");

  const filtered = useMemo(
    () => filterBills(bills, { query, billType }),
    [bills, query, billType]
  );

  async function handleTogglePaymentStatus(bill: any) {
    try {
      const newStatus = bill.paymentStatus === "paid" ? "pending" : "paid";
      updateBillInState(bill.id, { paymentStatus: newStatus });
      await import("@/services/billService").then(m => m.updateBill(bill.id, { paymentStatus: newStatus }));
      // Optional background refresh
      // reload(); 
    } catch (err) {
      console.error(err);
      reload();
    }
  }

  return (
    <div>
      <PageHeader
        title="Previous Bills"
        action={
          <Button size="sm" onClick={() => router.push("/bills/new")}>
            <Plus size={16} className="mr-1" /> New
          </Button>
        }
      />

      <div className="flex flex-col gap-3 px-4 sm:px-6">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search party or serial..."
        />
        <Select
          value={billType}
          onChange={(e) => setBillType(e.target.value as BillTypeId | "all")}
          options={[
            { value: "all", label: "All Types" },
            { value: "type-1", label: "SHAREEF TRADERS" },
            { value: "type-2", label: "AL-GHANI TRADERS" },
          ]}
        />
      </div>

      <div className="mt-4 px-4 sm:px-6">
        {(loading && bills.length === 0) ? (
          <LoadingState rows={4} />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : filtered.length === 0 ? (
          bills.length === 0 ? (
            <EmptyState
              icon={<Receipt size={26} />}
              title="No bills created yet."
              body="Create your first bill to get started."
              actionLabel="Create Your First Bill"
              onAction={() => router.push("/bills/new")}
            />
          ) : (
            <EmptyState
              icon={<Receipt size={26} />}
              title="No bills found."
              body="Try changing your search or filters."
            />
          )
        ) : (
          <div className="space-y-3 pb-4">
            {filtered.map((b) => (
              <BillCard key={b.id} bill={b} onTogglePaymentStatus={handleTogglePaymentStatus} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
