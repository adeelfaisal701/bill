"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, CalendarDays, ChevronDown, Download, FileText, ListFilter, Printer, Search, Wallet } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useBills } from "@/hooks/useBills";
import { getLedgerAccountBySlug, getLedgerAccountSummary } from "@/services/ledgerService";
import { formatCurrency, formatDate } from "@/lib/utilities";
import type { LedgerAccount, LedgerTransaction } from "@/types/ledger";

type LedgerSummary = ReturnType<typeof getLedgerAccountSummary>;

type Filters = { query: string; transactionType: string; paymentMode: string; fromDate: string; toDate: string };

export default function LedgerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { bills, loading, error, reload } = useBills();
  const [account, setAccount] = useState<LedgerAccount | null>(null);
  const [summary, setSummary] = useState<LedgerSummary | null>(null);
  const [query, setQuery] = useState("");
  const [transactionType, setTransactionType] = useState("all");
  const [paymentMode, setPaymentMode] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filters, setFilters] = useState<Filters>({ query: "", transactionType: "all", paymentMode: "all", fromDate: "", toDate: "" });

  useEffect(() => {
    getLedgerAccountBySlug(slug).then((value) => {
      setAccount(value);
      setSummary(value ? getLedgerAccountSummary(value.id) : null);
    });
  }, [slug]);

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
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f7f9fc] pb-24 text-[#24324a] md:pb-8">
      <div className="flex flex-col gap-3 border-b border-[#e5ebf3] px-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-5 lg:px-8">
        <Link href="/ledger" className="inline-flex min-w-0 items-center gap-1.5 text-sm font-medium text-[#58708f] hover:text-brand-600"><ArrowLeft size={16} /> <span className="truncate">Back to Ledger</span></Link>
        <div className="flex min-w-0 gap-2"><button type="button" onClick={() => window.print()} className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border border-[#dce4ef] bg-white px-3 py-2.5 text-sm font-semibold text-[#435875] shadow-sm sm:flex-none sm:px-4"><Printer size={16} /> <span className="truncate">Print</span></button><button type="button" onClick={() => window.print()} className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border border-[#dce4ef] bg-white px-3 py-2.5 text-sm font-semibold text-[#435875] shadow-sm sm:flex-none sm:px-4"><Download size={16} /> <span className="truncate">Download PDF</span></button></div>
      </div>
      <div className="min-w-0 px-3 pt-5 sm:px-6 sm:pt-6 lg:px-8"><p className="flex min-w-0 items-start gap-2 break-words text-2xl font-bold leading-tight sm:text-[28px]"><span className="mt-2 h-3 w-3 shrink-0 rounded-full bg-[#1eaaa5]" /><span className="min-w-0 break-words">{account.name}</span></p><p className="mt-1 text-sm text-[#75869e]">Ledger Account - Transaction History</p></div>

      <div className="min-w-0 space-y-5 px-3 pt-5 sm:space-y-6 sm:px-6 sm:pt-6 lg:px-8">
        <section className="min-w-0 rounded-2xl border border-[#e0e7f0] bg-white p-4 shadow-[0_8px_24px_rgba(30,55,90,0.06)] sm:p-5"><div className="grid min-w-0 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
          <div className="flex min-w-0 gap-3 sm:gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[#263c5c] text-[#263c5c]"><FileText size={24} /></div><div className="min-w-0 text-[15px] leading-7 text-[#50627c]"><p className="mb-2 break-words text-[18px] font-bold leading-6 text-[#24324a]">{account.name}</p><Info label="Account Code" value={account.accountCode || "-"} /><Info label="Type" value={account.type} /><Info label="Project Name" value={account.projectName || "-"} /><Info label="Project Code" value={account.projectCode || "-"} /></div></div>
          <div className="min-w-0 border-t border-[#e4eaf2] pt-4 text-[15px] leading-7 text-[#50627c] md:border-l md:border-t-0 md:pl-6 md:pt-0"><Info label="Contact Details" value={account.contactDetails || "-"} /><Info label="Account Created" value={formatDate(account.createdAt)} /><Info label="Last Updated" value={formatDate(account.updatedAt)} /><Info label="Opening Balance" value={`${formatCurrency(account.openingBalance)} ${account.openingBalanceType === "debit" ? "Dr" : "Cr"}`} /></div>
          <div className="min-w-0 rounded-xl bg-[#f1f6ff] px-4 py-4 text-[15px] leading-7 text-[#50627c] md:col-span-2 xl:col-span-1"><p className="mb-2 text-[18px] font-semibold leading-6 text-[#344b69]">Tax Information</p><Info label="Tax Enabled" value={account.taxEnabled ? "Yes" : "No"} /><Info label="Tax Name" value={account.taxName || "-"} /><Info label="Tax Rate" value={`${account.taxRate ?? 0}%`} /></div>
        </div></section>

        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4"><MetricCard icon={<ArrowUp size={20} />} label="Total Debit" value={formatCurrency(summary.totalDebit)} tone="debit" /><MetricCard icon={<ArrowDown size={20} />} label="Total Credit" value={formatCurrency(summary.totalCredit)} tone="credit" /><MetricCard icon={<ListFilter size={20} />} label="Current Balance" value={`${formatCurrency(summary.currentBalance)} Dr`} tone="balance" /><MetricCard icon={<FileText size={20} />} label="Total Transactions" value={String(summary.totalTransactions)} tone="transactions" /></div>

        <section className="min-w-0 overflow-hidden rounded-2xl border border-[#e0e7f0] bg-white shadow-[0_8px_24px_rgba(30,55,90,0.06)]"><div className="grid min-w-0 gap-3 border-b border-[#e5ebf3] p-3 sm:p-4 lg:grid-cols-[minmax(240px,1fr)_repeat(5,minmax(130px,auto))] lg:items-center"><label className="relative min-w-0"><Search size={16} className="absolute left-3 top-3 text-[#91a0b5]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by voucher, description..." className="h-11 w-full min-w-0 rounded-lg border border-[#dce4ef] pl-10 pr-3 text-sm outline-none focus:border-brand-400" /></label><FilterSelect value={transactionType} onChange={setTransactionType} options={[["all", "All Transactions"], ["bill", "Bills"], ["payment", "Payments"], ["opening", "Opening"]]} /><FilterSelect value={paymentMode} onChange={setPaymentMode} options={[["all", "Payment Mode"], ["Bank", "Bank"], ["Cash", "Cash"], ["Cheque", "Cheque"], ["Opening", "Opening"]]} /><DateFilter icon={<CalendarDays size={16} />} label="From" value={fromDate} onChange={setFromDate} /><DateFilter label="To" value={toDate} onChange={setToDate} /><div className="flex min-w-0 gap-2"><button type="button" onClick={applyFilters} className="h-11 min-w-0 flex-1 rounded-lg bg-brand-500 px-3 text-sm font-bold text-white sm:flex-none sm:px-6">Apply</button><button type="button" onClick={resetFilters} className="h-11 min-w-0 flex-1 rounded-lg border border-[#dce4ef] bg-white px-3 text-sm font-semibold text-[#516782] sm:flex-none sm:px-5">Reset</button></div></div>
          <div className="min-w-0 max-w-full overflow-x-auto"><table className="w-full min-w-[900px] table-fixed border-collapse text-sm text-[#435875]"><thead className="sticky top-0 z-10"><tr className="bg-[#eef3f9] text-left text-xs font-bold text-[#344b69]"><th className="w-16 px-4 py-3">Sr. No.</th><th className="w-28 px-4 py-3">Date</th><th className="w-36 px-4 py-3">Voucher / Bill #</th><th className="w-32 px-4 py-3">Payment Mode</th><th className="w-[220px] px-4 py-3">Description</th><th className="w-32 px-4 py-3 text-right">Debit (Rs.)</th><th className="w-32 px-4 py-3 text-right">Credit (Rs.)</th><th className="w-36 px-4 py-3 text-right">Balance (Rs.)</th></tr></thead><tbody>{transactions.map((transaction, index) => <TransactionRow key={transaction.id} transaction={transaction} index={index} />)}</tbody><tfoot><tr className="bg-[#f1f6ff] font-bold"><td colSpan={5} className="px-4 py-4 text-right">Closing Balance</td><td colSpan={2} /><td className="px-4 py-4 text-right">{formatCurrency(summary.currentBalance)} Dr</td></tr></tfoot></table>{transactions.length === 0 && <p className="px-4 py-8 text-center text-sm text-[#75869e]">No transactions match these filters.</p>}</div>
        </section>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) { return <p className="break-words">{label} <span className="mx-2 text-[#a8b4c5]">:</span> <span className="break-words">{value}</span></p>; }

function MetricCard({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: "debit" | "credit" | "balance" | "transactions" }) {
  const styles = { debit: "bg-[#e5f9f1] text-[#12a879]", credit: "bg-[#fff0f0] text-[#ee4e56]", balance: "bg-[#eaf1ff] text-[#3563e9]", transactions: "bg-[#f5edff] text-[#8c55d9]" };
  return <div className="flex min-h-[88px] min-w-0 items-center gap-3 rounded-2xl border border-[#e0e7f0] bg-white p-4 shadow-[0_8px_24px_rgba(30,55,90,0.06)] sm:min-h-[92px] sm:gap-4 sm:p-5"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${styles[tone]}`}>{icon}</span><div className="min-w-0"><p className="text-sm text-[#75869e]">{label}</p><p className="mt-1 break-words font-mono text-base font-bold sm:text-lg">{value}</p></div></div>;
}

function FilterSelect({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[][] }) { return <label className="relative min-w-0"><select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full appearance-none rounded-lg border border-[#dce4ef] bg-white py-2 pl-3 pr-8 text-sm text-[#516782] outline-none">{options.map(([optionValue, label]) => <option key={optionValue} value={optionValue}>{label}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-3 top-3.5 text-[#91a0b5]" /></label>; }

function DateFilter({ icon, label, value, onChange }: { icon?: ReactNode; label: string; value: string; onChange: (value: string) => void }) { return <label className="relative flex h-11 min-w-0 items-center gap-2 rounded-lg border border-[#dce4ef] bg-white px-3 text-sm text-[#516782]"><span className="text-[#91a0b5]">{icon}</span><span>{label}</span><input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label>; }

function TransactionRow({ transaction, index }: { transaction: LedgerTransaction; index: number }) {
  return <tr className="hover:bg-[#fafcff]"><td className="border-b border-[#edf1f6] px-4 py-3">{index + 1}</td><td className="whitespace-nowrap border-b border-[#edf1f6] px-4 py-3">{formatDate(transaction.date)}</td><td className="break-words border-b border-[#edf1f6] px-4 py-3 font-semibold text-[#344b69]">{transaction.voucherNumber ? `#${transaction.voucherNumber}` : "-"}</td><td className="break-words border-b border-[#edf1f6] px-4 py-3">{transaction.paymentMode || "-"}</td><td className="break-words border-b border-[#edf1f6] px-4 py-3">{transaction.billId ? <Link href={`/bills/${transaction.billId}`} className="break-words hover:text-brand-600 hover:underline">{transaction.description}</Link> : transaction.description}</td><td className="whitespace-nowrap border-b border-[#edf1f6] px-4 py-3 text-right">{transaction.debit ? transaction.debit.toLocaleString("en-PK") : "-"}</td><td className="whitespace-nowrap border-b border-[#edf1f6] px-4 py-3 text-right">{transaction.credit ? transaction.credit.toLocaleString("en-PK") : "-"}</td><td className="whitespace-nowrap border-b border-[#edf1f6] px-4 py-3 text-right font-medium">{transaction.balance.toLocaleString("en-PK")} Dr</td></tr>;
}
