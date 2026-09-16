"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { BookText } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { Select } from "@/components/ui/Select";
import { useBills } from "@/hooks/useBills";
import { listLedgerAccounts, type LedgerSort } from "@/services/ledgerService";
import { formatCurrency } from "@/lib/utilities";
import { Button } from "@/components/ui/Button";

const COMPANY_OPTIONS = [
  { value: "all", label: "All Companies" },
  { value: "type-1", label: "SHAREEF TRADERS" },
  { value: "type-2", label: "AL-GHANI TRADERS" },
  { value: "type-3", label: "KING ENTERPRISE" },
];

export default function LedgerPage() {
  const { bills, loading, error, reload } = useBills();
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<LedgerSort>("name");
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    listLedgerAccounts().then(setAccounts);
  }, []);

  const shownAccounts = accounts.length > 0 ? accounts : [];

  const clients = useMemo(() => {
    const q = query.trim().toLowerCase();
    
    // Filter by company first
    const companyFiltered = selectedCompany === "all" 
      ? shownAccounts 
      : shownAccounts.filter(a => a.companyId === selectedCompany || !a.companyId); // include undefined for legacy accounts if desired, but requirements state strict isolation. Let's strictly isolate:
      
    // Wait, if an existing record doesn't have a company, we should probably still show it under "all", but under a specific company we only show if it matches.
    const strictlyCompanyFiltered = selectedCompany === "all"
      ? shownAccounts
      : shownAccounts.filter(a => a.companyId === selectedCompany);

    const filtered = q
      ? strictlyCompanyFiltered.filter((account) => account.name.toLowerCase().includes(q) || (account.accountCode ?? "").toLowerCase().includes(q))
      : strictlyCompanyFiltered;

    return [...filtered].sort((a, b) => {
      if (sortBy === "bills") return (b.totalTransactions ?? 0) - (a.totalTransactions ?? 0) || a.name.localeCompare(b.name);
      if (sortBy === "amount") return (b.currentBalance ?? 0) - (a.currentBalance ?? 0) || a.name.localeCompare(b.name);
      if (sortBy === "recent") return (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "") || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    }).map((account) => ({
      id: account.id,
      name: account.name,
      accountCode: account.accountCode,
      type: account.type,
      companyId: account.companyId,
      totalTransactions: account.totalTransactions ?? 0,
      totalDebit: account.totalDebit ?? 0,
      totalCredit: account.totalCredit ?? 0,
      currentBalance: account.currentBalance ?? 0,
      updatedAt: account.updatedAt,
      slug: account.id,
    }));
  }, [shownAccounts, query, sortBy, selectedCompany]);

  function getCompanyName(id?: string) {
    if (!id) return null;
    return COMPANY_OPTIONS.find(o => o.value === id)?.label;
  }

  return (
    <div>
      <PageHeader title="Ledger" subtitle="Manage society/company accounts and transaction history" action={
        <Button size="sm" onClick={() => window.location.href = `/ledger/new${selectedCompany !== 'all' ? `?company=${selectedCompany}` : ''}`}>+ Add Society / Company</Button>
      } />

      <div className="flex flex-col gap-4 px-4 sm:px-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold uppercase tracking-wide text-brand-600">Company / Business</label>
          <Select
            value={selectedCompany}
            onChange={(event) => setSelectedCompany(event.target.value)}
            options={COMPANY_OPTIONS}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search client name"
            />
          </div>
          <div className="sm:w-48">
            <Select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as LedgerSort)}
              options={[
                { value: "name", label: "Client Name" },
                { value: "bills", label: "Number of Bills" },
                { value: "amount", label: "Total Amount" },
                { value: "recent", label: "Most Recent Bill" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 px-4 pb-4 sm:px-6">
        {loading && bills.length === 0 ? (
          <LoadingState rows={4} />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : clients.length === 0 ? (
          <EmptyState
            icon={<BookText size={26} />}
            title="No ledger clients yet."
            body="Saved bills will automatically appear here grouped by client."
          />
        ) : (
          <div className="space-y-3">
            {clients.map((client) => (
              <Link
                key={client.id}
                href={`/ledger/${client.slug}`}
                className="block rounded-2xl border border-ink-100 bg-white p-4 shadow-card transition-shadow hover:shadow-floating"
              >
                {client.companyId && (
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-600">
                    {getCompanyName(client.companyId)}
                  </p>
                )}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate text-lg font-semibold text-ink-900">
                      <span className="text-ink-400">•</span> {client.name}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-500">
                      <span>{client.type}</span>
                      {client.accountCode && (
                        <>
                          <span>•</span>
                          <span>{client.accountCode}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{client.totalTransactions} {client.totalTransactions === 1 ? "Transaction" : "Transactions"}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-medium uppercase tracking-wider text-ink-400">Balance</p>
                    <p className="mt-1 font-mono text-base font-bold text-ink-900">{formatCurrency(client.currentBalance)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
