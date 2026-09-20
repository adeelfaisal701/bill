"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, CalendarDays, ChevronDown, Download, FileText, ListFilter, Printer, Search, Wallet, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useBills } from "@/hooks/useBills";
import { getLedgerAccountBySlug, getLedgerAccountSummary } from "@/services/ledgerService";
import { getBusinessProfile, listCompanyOptions } from "@/services/businessService";
import { formatCurrency, formatDate } from "@/lib/utilities";
import type { LedgerAccount, LedgerTransaction } from "@/types/ledger";
import type { BusinessProfile } from "@/types/business";

type LedgerSummary = Awaited<ReturnType<typeof getLedgerAccountSummary>>;

type Filters = { query: string; transactionType: string; paymentMode: string; fromDate: string; toDate: string };

export default function LedgerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { bills, loading, error, reload } = useBills();
  const [account, setAccount] = useState<LedgerAccount | null>(null);
  const [summary, setSummary] = useState<LedgerSummary | null>(null);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [companyOptions, setCompanyOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [query, setQuery] = useState("");
  const [transactionType, setTransactionType] = useState("all");
  const [paymentMode, setPaymentMode] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filters, setFilters] = useState<Filters>({ query: "", transactionType: "all", paymentMode: "all", fromDate: "", toDate: "" });
  const [showAllMobileTransactions, setShowAllMobileTransactions] = useState(false);

  useEffect(() => {
    listCompanyOptions().then(setCompanyOptions);
    getBusinessProfile().then(setBusiness);
    getLedgerAccountBySlug(slug).then((value) => {
      setAccount(value);
      if (value) getLedgerAccountSummary(value.id).then(setSummary);
      else setSummary(null);
    });
  }, [slug]);

  const companyName = account?.companyId
    ? companyOptions.find((company) => company.id === account.companyId)?.name
    : business?.businessName ?? null;

  const transactions = useMemo(() => {
    if (!summary) return [];
    const search = filters.query.trim().toLowerCase();
    return summary.transactions.filter((transaction) => {
      const time = new Date(transaction.date).getTime();
      const matchesSearch = !search || [transaction.voucherNumber, transaction.description, transaction.paymentMode].filter(Boolean).some((value) => value!.toLowerCase().includes(search));
      const matchesType = filters.transactionType === "all" || transaction.transactionType === filters.transactionType;
      const matchesPayment = filters.paymentMode === "all" || (transaction.paymentMode ?? "-") === filters.paymentMode;
      const matchesFrom = !filters.fromDate || time >= new Date(filters.fromDate).getTime();
      const matchesTo = !filters.toDate || time <= new Date(`${filters.toDate}T23:59:59`).getTime();
      return matchesSearch && matchesType && matchesPayment && matchesFrom && matchesTo;
    });
  }, [filters, summary]);

  if (loading && bills.length === 0) return <LoadingState rows={4} />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!account || !summary) return <div className="min-h-screen w-full px-4 py-6 sm:px-6 lg:px-8"><EmptyState icon={<Wallet size={26} />} title="Client not found." body="This client does not exist in the current bill ledger." actionLabel="Back to Ledger" onAction={() => window.history.back()} /></div>;

  function applyFilters() { setFilters({ query, transactionType, paymentMode, fromDate, toDate }); }
  function resetFilters() {
    setQuery(""); setTransactionType("all"); setPaymentMode("all"); setFromDate(""); setToDate("");
    setFilters({ query: "", transactionType: "all", paymentMode: "all", fromDate: "", toDate: "" });
  }

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f7f9fc] pb-24 text-[#24324a] md:pb-8 print:bg-white print:pb-0">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#e5ebf3] bg-white px-4 py-3 sm:gap-4 sm:px-6 sm:py-5 md:bg-transparent lg:px-8 print:hidden">
        <Link href="/ledger" className="inline-flex min-w-0 items-center gap-1.5 text-sm font-medium text-[#58708f] hover:text-brand-600"><ArrowLeft size={16} /> <span className="truncate">Back to Ledger</span></Link>
        <div className="flex min-w-0 gap-2">
          <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#dce4ef] bg-white p-2 text-sm font-semibold text-[#435875] shadow-sm sm:px-4 sm:py-2.5"><Printer size={16} /> <span className="hidden truncate sm:inline">Print</span></button>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#dce4ef] bg-white p-2 text-sm font-semibold text-[#435875] shadow-sm sm:px-4 sm:py-2.5"><Download size={16} /> <span className="hidden truncate sm:inline">PDF</span></button>
        </div>
      </div>
      
      {/* TITLE */}
      <div className="min-w-0 px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 print:px-0 print:pt-0">
        <div className="flex flex-col items-center justify-center text-center">
          {companyName ? (
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-[#58708f] print:text-black">
              {companyName}
            </p>
          ) : null}
          <p className="flex items-center justify-center gap-3 text-xl font-bold leading-tight sm:gap-2 sm:text-[28px] print:text-2xl">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white sm:hidden print:hidden">
              <FileText size={24} />
            </span>
            <span className="min-w-0 break-words">{account.name}</span>
          </p>
          <p className="mt-2 text-[13px] text-[#75869e] sm:text-sm print:text-black">Ledger Account &middot; Transaction History</p>
          
          <span className="mt-3 rounded-full bg-[#e5f9f1] px-2.5 py-1 text-[11px] font-bold tracking-wide text-[#12a879] uppercase sm:hidden print:hidden">Active</span>
        </div>
      </div>

      <div className="min-w-0 space-y-4 px-4 pt-4 sm:space-y-6 sm:px-6 sm:pt-6 lg:px-8 print:px-0 print:pt-4">
        
        {/* DESKTOP ACCOUNT INFO (Hidden on mobile) */}
        <section className="hidden min-w-0 rounded-2xl border border-[#e0e7f0] bg-white p-4 shadow-[0_8px_24px_rgba(30,55,90,0.06)] sm:p-5 md:block print:block print:shadow-none print:border-[#000]">
          <div className="grid min-w-0 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 print:grid-cols-3">
            <div className="flex min-w-0 gap-3 sm:gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[#263c5c] text-[#263c5c] print:hidden"><FileText size={24} /></div><div className="min-w-0 text-[15px] leading-7 text-[#50627c] print:text-black"><p className="mb-2 break-words text-[18px] font-bold leading-6 text-[#24324a] print:text-black">{account.name}</p><Info label="Account Code" value={account.accountCode || "-"} /><Info label="Type" value={account.type} /><Info label="Project Name" value={account.projectName || "-"} /><Info label="Project Code" value={account.projectCode || "-"} /></div></div>
            <div className="min-w-0 border-t border-[#e4eaf2] pt-4 text-[15px] leading-7 text-[#50627c] md:border-l md:border-t-0 md:pl-6 md:pt-0 print:border-[#000] print:border-l print:border-t-0 print:pl-6 print:pt-0 print:text-black"><Info label="Contact Details" value={account.contactDetails || "-"} /><Info label="Account Created" value={formatDate(account.createdAt)} /><Info label="Last Updated" value={formatDate(account.updatedAt)} /><Info label="Opening Balance" value={`${formatCurrency(account.openingBalance)} ${account.openingBalanceType === "debit" ? "Dr" : "Cr"}`} /></div>
            <div className="min-w-0 rounded-xl bg-[#f1f6ff] px-4 py-4 text-[15px] leading-7 text-[#50627c] md:col-span-2 xl:col-span-1 print:col-span-1 print:bg-white print:border print:border-[#000] print:text-black"><p className="mb-2 text-[18px] font-semibold leading-6 text-[#344b69] print:text-black">Tax Information</p><Info label="Tax Enabled" value={account.taxEnabled ? "Yes" : "No"} /><Info label="Tax Name" value={account.taxName || "-"} /><Info label="Tax Rate" value={`${account.taxRate ?? 0}%`} /></div>
          </div>
        </section>

        {/* MOBILE ACCOUNT INFO */}
        <section className="block md:hidden print:hidden">
          <div className="rounded-[16px] border border-[#e8ecf2] bg-white p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-x-2 gap-y-4">
              <MobileInfo icon={<FileText size={14} />} label="Account Code" value={account.accountCode || "-"} />
              <MobileInfo icon={<FileText size={14} />} label="Contact" value={account.contactDetails || "-"} />
              <MobileInfo icon={<FileText size={14} />} label="Type" value={account.type} />
              <MobileInfo icon={<CalendarDays size={14} />} label="Created" value={formatDate(account.createdAt)} />
              <MobileInfo icon={<FileText size={14} />} label="Project Name" value={account.projectName || "-"} />
              <MobileInfo icon={<CalendarDays size={14} />} label="Updated" value={formatDate(account.updatedAt)} />
              <MobileInfo icon={<FileText size={14} />} label="Project Code" value={account.projectCode || "-"} />
            </div>
          </div>
        </section>

        {/* MOBILE TAX INFO */}
        <section className="block md:hidden print:hidden">
          <div className="flex items-center gap-3 rounded-[16px] border border-[#e3efeb] bg-[#f8fbfa] p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#22c55e] text-white">
              <FileText size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-[#1f2937]">Tax Information</p>
              <p className="truncate text-[13px] text-[#6b7280]">Tax Enabled: {account.taxEnabled ? "Yes" : "No"} &middot; {account.taxName || "Tax"}: {account.taxRate ?? 0}%</p>
            </div>
            <ChevronDown size={18} className="text-[#9ca3af]" />
          </div>
        </section>

        {/* SUMMARY CARDS */}
        <div className="grid min-w-0 grid-cols-2 gap-3 xl:grid-cols-4 print:grid-cols-4">
          <MetricCard icon={<ArrowUp size={20} className="sm:h-5 sm:w-5 h-4 w-4 print:h-5 print:w-5" />} label="Total Debit" value={formatCurrency(summary.totalDebit)} tone="debit" />
          <MetricCard icon={<ArrowDown size={20} className="sm:h-5 sm:w-5 h-4 w-4 print:h-5 print:w-5" />} label="Total Credit" value={formatCurrency(summary.totalCredit)} tone="credit" />
          <MetricCard icon={<ListFilter size={20} className="sm:h-5 sm:w-5 h-4 w-4 print:h-5 print:w-5" />} label="Balance" value={`${formatCurrency(summary.currentBalance)} Dr`} tone="balance" />
          <MetricCard icon={<FileText size={20} className="sm:h-5 sm:w-5 h-4 w-4 print:h-5 print:w-5" />} label="Transactions" value={String(summary.totalTransactions)} tone="transactions" />
        </div>

        {/* MOBILE TRANSACTIONS */}
        <section className="block pb-6 md:hidden print:hidden">
          <div className="mb-4 mt-2 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1f2937]">{showAllMobileTransactions ? "All Transactions" : "Recent Transactions"}</h2>
            {!showAllMobileTransactions && (
              <button onClick={() => setShowAllMobileTransactions(true)} className="flex items-center gap-1 text-sm font-semibold text-brand-600">View All <ArrowLeft size={14} className="rotate-180" /></button>
            )}
            {showAllMobileTransactions && (
              <button onClick={() => setShowAllMobileTransactions(false)} className="flex items-center gap-1 text-sm font-semibold text-[#6b7280]">Collapse <ArrowUp size={14} /></button>
            )}
          </div>
          
          {showAllMobileTransactions && (
            <div className="mb-4 space-y-2">
              <label className="relative min-w-0 block"><Search size={16} className="absolute left-3 top-3 text-[#91a0b5]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by voucher, description..." className="h-11 w-full min-w-0 rounded-lg border border-[#dce4ef] bg-white pl-10 pr-3 text-sm outline-none focus:border-brand-400" /></label>
              <div className="grid grid-cols-2 gap-2">
                <FilterSelect value={transactionType} onChange={setTransactionType} options={[["all", "All Types"], ["bill", "Bills"], ["payment", "Payments"], ["opening", "Opening"]]} />
                <FilterSelect value={paymentMode} onChange={setPaymentMode} options={[["all", "All Modes"], ["Bank", "Bank"], ["Cash", "Cash"], ["Cheque", "Cheque"], ["Opening", "Opening"]]} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <DateFilter label="From" value={fromDate} onChange={setFromDate} />
                <DateFilter label="To" value={toDate} onChange={setToDate} />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={applyFilters} className="h-11 flex-1 rounded-lg bg-brand-500 text-sm font-bold text-white">Apply</button>
                <button type="button" onClick={resetFilters} className="h-11 flex-1 rounded-lg border border-[#dce4ef] bg-white text-sm font-semibold text-[#516782]">Reset</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {(showAllMobileTransactions ? transactions : transactions.slice(0, 5)).map((t, idx) => (
              <Link href={t.billId ? `/bills/${t.billId}` : "#"} key={t.id} className="flex items-center gap-3 rounded-[16px] border border-[#e8ecf2] bg-white p-3 shadow-sm hover:border-brand-300">
                <div className="flex flex-col items-center justify-center px-1 text-center">
                  <span className="text-[15px] font-bold leading-none text-[#1f2937]">{new Date(t.date).getDate()}</span>
                  <span className="mt-1 text-[10px] font-bold uppercase text-[#6b7280]">{new Date(t.date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-[10px] font-medium text-[#9ca3af]">{new Date(t.date).getFullYear()}</span>
                </div>
                <div className="min-w-0 flex-1 border-l border-[#f3f4f6] pl-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate pr-2 text-[14px] font-semibold text-[#1f2937]">{t.description || (t.billId ? "Bill Generated" : "Transaction")}</p>
                    <p className="whitespace-nowrap text-[14px] font-bold text-[#1f2937]">Rs. {(t.debit || t.credit || 0).toLocaleString("en-PK")}</p>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-[12px] text-[#6b7280]">{t.voucherNumber ? `#${t.voucherNumber}` : "#-"} &middot; {t.paymentMode || "Opening"}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${t.debit ? 'bg-[#e5f9f1] text-[#12a879]' : 'bg-[#fff0f0] text-[#ee4e56]'}`}>{t.debit ? 'Debit' : 'Credit'}</span>
                  </div>
                </div>
                {t.billId && <ChevronRight size={16} className="shrink-0 text-[#d1d5db]" />}
              </Link>
            ))}
            {transactions.length === 0 && <p className="py-6 text-center text-sm text-[#6b7280]">No transactions match these filters.</p>}
          </div>
        </section>

        {/* DESKTOP TABLE */}
        <section className="hidden min-w-0 overflow-hidden rounded-2xl border border-[#e0e7f0] bg-white shadow-[0_8px_24px_rgba(30,55,90,0.06)] md:block print:block print:shadow-none print:border-none"><div className="grid min-w-0 gap-3 border-b border-[#e5ebf3] p-3 sm:p-4 lg:grid-cols-[minmax(240px,1fr)_repeat(5,minmax(130px,auto))] lg:items-center print:hidden"><label className="relative min-w-0"><Search size={16} className="absolute left-3 top-3 text-[#91a0b5]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by voucher, description..." className="h-11 w-full min-w-0 rounded-lg border border-[#dce4ef] pl-10 pr-3 text-sm outline-none focus:border-brand-400" /></label><FilterSelect value={transactionType} onChange={setTransactionType} options={[["all", "All Transactions"], ["bill", "Bills"], ["payment", "Payments"], ["opening", "Opening"]]} /><FilterSelect value={paymentMode} onChange={setPaymentMode} options={[["all", "Payment Mode"], ["Bank", "Bank"], ["Cash", "Cash"], ["Cheque", "Cheque"], ["Opening", "Opening"]]} /><DateFilter icon={<CalendarDays size={16} />} label="From" value={fromDate} onChange={setFromDate} /><DateFilter label="To" value={toDate} onChange={setToDate} /><div className="flex min-w-0 gap-2"><button type="button" onClick={applyFilters} className="h-11 min-w-0 flex-1 rounded-lg bg-brand-500 px-3 text-sm font-bold text-white sm:flex-none sm:px-6">Apply</button><button type="button" onClick={resetFilters} className="h-11 min-w-0 flex-1 rounded-lg border border-[#dce4ef] bg-white px-3 text-sm font-semibold text-[#516782] sm:flex-none sm:px-5">Reset</button></div></div>
          <div className="min-w-0 max-w-full overflow-x-auto print:overflow-visible"><table className="w-full min-w-[900px] table-fixed border-collapse text-sm text-[#435875] print:min-w-0 print:text-[11px] print:text-black"><thead className="sticky top-0 z-10 print:static"><tr className="bg-[#eef3f9] text-left text-xs font-bold text-[#344b69] print:bg-gray-100 print:text-[11px] print:text-black"><th className="w-16 px-4 py-3 border-b border-[#000] print:w-auto print:px-2 print:py-2 print:border-b-2">Sr. No.</th><th className="w-28 px-4 py-3 border-b border-[#000] print:w-auto print:px-2 print:py-2 print:border-b-2">Date</th><th className="w-36 px-4 py-3 border-b border-[#000] print:w-auto print:px-2 print:py-2 print:border-b-2">Voucher / Bill #</th><th className="w-32 px-4 py-3 border-b border-[#000] print:w-auto print:px-2 print:py-2 print:border-b-2">Payment Mode</th><th className="w-[220px] px-4 py-3 border-b border-[#000] print:w-auto print:px-2 print:py-2 print:border-b-2">Description</th><th className="w-32 px-4 py-3 text-right border-b border-[#000] print:w-auto print:px-2 print:py-2 print:border-b-2">Debit (Rs.)</th><th className="w-32 px-4 py-3 text-right border-b border-[#000] print:w-auto print:px-2 print:py-2 print:border-b-2">Credit (Rs.)</th><th className="w-36 px-4 py-3 text-right border-b border-[#000] print:w-auto print:px-2 print:py-2 print:border-b-2">Balance (Rs.)</th></tr></thead><tbody>{transactions.map((transaction, index) => <TransactionRow key={transaction.id} transaction={transaction} index={index} />)}</tbody><tfoot><tr className="bg-[#f1f6ff] font-bold print:bg-white print:text-[11px]"><td colSpan={5} className="px-4 py-4 text-right print:px-2 print:py-2 print:border-t print:border-[#000]">Closing Balance</td><td colSpan={2} className="print:border-t print:border-[#000]" /><td className="px-4 py-4 text-right print:px-2 print:py-2 print:border-t print:border-[#000]">{formatCurrency(summary.currentBalance)} Dr</td></tr></tfoot></table>{transactions.length === 0 && <p className="px-4 py-8 text-center text-sm text-[#75869e] print:hidden">No transactions match these filters.</p>}</div>
        </section>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) { return <p className="break-words">{label} <span className="mx-2 text-[#a8b4c5]">:</span> <span className="break-words">{value}</span></p>; }

function MobileInfo({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-[#9ca3af] text-[12px] font-medium">
        {icon} <span>{label}</span>
      </div>
      <p className="text-[14px] font-semibold text-[#1f2937] leading-tight break-words">{value}</p>
    </div>
  );
}

function MetricCard({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: "debit" | "credit" | "balance" | "transactions" }) {
  const styles = { debit: "bg-[#e5f9f1] text-[#12a879]", credit: "bg-[#fff0f0] text-[#ee4e56]", balance: "bg-[#eaf1ff] text-[#3563e9]", transactions: "bg-[#f5edff] text-[#8c55d9]" };
  return <div className="flex min-h-[72px] min-w-0 items-center gap-3 rounded-2xl border border-[#e0e7f0] bg-white p-3 shadow-[0_8px_24px_rgba(30,55,90,0.06)] sm:min-h-[92px] sm:gap-4 sm:p-5"><span className={`flex h-8 w-8 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full ${styles[tone]}`}>{icon}</span><div className="min-w-0"><p className="text-[12px] sm:text-sm text-[#75869e]">{label}</p><p className="mt-0.5 break-words font-mono text-[14px] font-bold sm:text-lg">{value}</p></div></div>;
}

function FilterSelect({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[][] }) { return <label className="relative min-w-0"><select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full appearance-none rounded-lg border border-[#dce4ef] bg-white py-2 pl-3 pr-8 text-sm text-[#516782] outline-none">{options.map(([optionValue, label]) => <option key={optionValue} value={optionValue}>{label}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-3 top-3.5 text-[#91a0b5]" /></label>; }

function DateFilter({ icon, label, value, onChange }: { icon?: ReactNode; label: string; value: string; onChange: (value: string) => void }) { return <label className="relative flex h-11 min-w-0 items-center gap-2 rounded-lg border border-[#dce4ef] bg-white px-3 text-sm text-[#516782]"><span className="text-[#91a0b5]">{icon}</span><span>{label}</span><input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label>; }

function TransactionRow({ transaction, index }: { transaction: LedgerTransaction; index: number }) {
  return <tr className="hover:bg-[#fafcff] print:border-b print:border-[#000] print:text-[11px]"><td className="border-b border-[#edf1f6] px-4 py-3 print:border-none print:px-2 print:py-2 print:text-black">{index + 1}</td><td className="whitespace-nowrap border-b border-[#edf1f6] px-4 py-3 print:border-none print:px-2 print:py-2 print:text-black">{formatDate(transaction.date)}</td><td className="break-words border-b border-[#edf1f6] px-4 py-3 font-semibold text-[#344b69] print:border-none print:px-2 print:py-2 print:text-black">{transaction.voucherNumber ? `#${transaction.voucherNumber}` : "-"}</td><td className="break-words border-b border-[#edf1f6] px-4 py-3 print:border-none print:px-2 print:py-2 print:text-black">{transaction.paymentMode || "-"}</td><td className="break-words border-b border-[#edf1f6] px-4 py-3 print:border-none print:px-2 print:py-2 print:text-black">{transaction.billId ? <Link href={`/bills/${transaction.billId}`} className="break-words hover:text-brand-600 hover:underline print:text-black print:no-underline">{transaction.description}</Link> : transaction.description}</td><td className="whitespace-nowrap border-b border-[#edf1f6] px-4 py-3 text-right print:border-none print:px-2 print:py-2 print:text-black">{transaction.debit ? transaction.debit.toLocaleString("en-PK") : "-"}</td><td className="whitespace-nowrap border-b border-[#edf1f6] px-4 py-3 text-right print:border-none print:px-2 print:py-2 print:text-black">{transaction.credit ? transaction.credit.toLocaleString("en-PK") : "-"}</td><td className="whitespace-nowrap border-b border-[#edf1f6] px-4 py-3 text-right font-medium print:border-none print:px-2 print:py-2 print:text-black">{transaction.balance.toLocaleString("en-PK")} Dr</td></tr>;
}
