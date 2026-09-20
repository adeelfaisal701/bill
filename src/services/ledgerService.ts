import type { Bill } from "@/types/bill";
import type { LedgerAccount, LedgerTransaction } from "@/types/ledger";
import { repositories } from "@/repositories";
import { readAll, writeAll } from "@/repositories/mock/storage";
import { generateId } from "@/lib/utilities";

const LEDGER_ACCOUNTS_KEY = "ledgerAccounts";
const LEDGER_TRANSACTIONS_KEY = "ledgerTransactions";

export type LedgerSort = "name" | "bills" | "amount" | "recent";

export interface LedgerAccountSummary {
  totalDebit: number;
  totalCredit: number;
  currentBalance: number;
  totalTransactions: number;
}

export function loadLedgerAccounts(): LedgerAccount[] {
  return readAll<LedgerAccount[]>(LEDGER_ACCOUNTS_KEY, []);
}

export function saveLedgerAccounts(accounts: LedgerAccount[]): void {
  writeAll(LEDGER_ACCOUNTS_KEY, accounts);
}

export function loadLedgerTransactions(): LedgerTransaction[] {
  return readAll<LedgerTransaction[]>(LEDGER_TRANSACTIONS_KEY, []);
}

export function saveLedgerTransactions(transactions: LedgerTransaction[]): void {
  writeAll(LEDGER_TRANSACTIONS_KEY, transactions);
}

export function normalizeLedgerName(value: string): string {
  return (value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function slugifyLedgerAccount(value: string): string {
  return normalizeLedgerName(value).replace(/\s+/g, "-") || "ledger-account";
}

export function listLedgerAccounts(): Promise<LedgerAccount[]> {
  if (repositories.mode === "cloud" && repositories.ledger) return repositories.ledger.listAccounts();
  return Promise.resolve(loadLedgerAccounts());
}

export function getLedgerAccount(id: string): Promise<LedgerAccount | null> {
  if (repositories.mode === "cloud" && repositories.ledger) return repositories.ledger.getAccount(id);
  return Promise.resolve(loadLedgerAccounts().find((account) => account.id === id) ?? null);
}

export function getLedgerAccountBySlug(slug: string): Promise<LedgerAccount | null> {
  if (repositories.mode === "cloud" && repositories.ledger) return repositories.ledger.getAccountBySlug(slug);
  const normalized = decodeURIComponent(slug);
  const accounts = loadLedgerAccounts();
  const byId = accounts.find((account) => account.id === normalized);
  if (byId) return Promise.resolve(byId);

  return Promise.resolve(
    accounts.find((account) => slugifyLedgerAccount(account.name) === normalized) ?? null
  );
}

export function createLedgerAccount(input: Omit<LedgerAccount, "id" | "createdAt" | "updatedAt">): Promise<LedgerAccount> {
  if (repositories.mode === "cloud" && repositories.ledger) return repositories.ledger.createAccount(input);
  const companyId = input.companyId?.trim();
  if (!companyId) {
    throw new Error("Please select a company/business.");
  }

  const now = new Date().toISOString();
  const account: LedgerAccount = {
    ...input,
    companyId,
    name: input.name.trim(),
    id: generateId("ledger"),
    createdAt: now,
    updatedAt: now,
  };

  const accounts = loadLedgerAccounts();
  accounts.push(account);
  saveLedgerAccounts(accounts);

  if (account.openingBalance !== 0) {
    const txs = loadLedgerTransactions();
    const openingAmount = Math.abs(account.openingBalance);
    txs.push({
      id: generateId("ledger_tx"),
      ledgerAccountId: account.id,
      date: now,
      description: "Opening Balance",
      debit: account.openingBalanceType === "debit" ? openingAmount : 0,
      credit: account.openingBalanceType === "credit" ? openingAmount : 0,
      balance: 0,
      paymentMode: "Opening",
      transactionType: "opening",
      createdAt: now,
      updatedAt: now,
    });
    refreshAccountBalances(account.id, txs);
  }

  return Promise.resolve(account);
}

export function updateLedgerAccount(id: string, patch: Partial<LedgerAccount>): Promise<LedgerAccount> {
  if (repositories.mode === "cloud" && repositories.ledger) return repositories.ledger.updateAccount(id, patch);
  const accounts = loadLedgerAccounts();
  const idx = accounts.findIndex((account) => account.id === id);
  if (idx === -1) throw new Error("Ledger account not found.");

  const nextCompanyId = patch.companyId !== undefined ? patch.companyId.trim() : accounts[idx].companyId;
  if (patch.companyId !== undefined && !nextCompanyId) {
    throw new Error("Please select a company/business.");
  }

  const updated: LedgerAccount = {
    ...accounts[idx],
    ...patch,
    companyId: nextCompanyId,
    name: patch.name?.trim() ?? accounts[idx].name,
    updatedAt: new Date().toISOString(),
  };

  accounts[idx] = updated;
  saveLedgerAccounts(accounts);
  return Promise.resolve(updated);
}

export function deleteLedgerAccount(id: string): Promise<void> {
  if (repositories.mode === "cloud" && repositories.ledger) return repositories.ledger.deleteAccount(id);
  saveLedgerAccounts(loadLedgerAccounts().filter((account) => account.id !== id));
  saveLedgerTransactions(loadLedgerTransactions().filter((transaction) => transaction.ledgerAccountId !== id));
  return Promise.resolve();
}

export function listLedgerTransactionsForAccount(accountId: string): Promise<LedgerTransaction[]> {
  if (repositories.mode === "cloud" && repositories.ledger) return repositories.ledger.listTransactions(accountId);
  return Promise.resolve(
    loadLedgerTransactions()
      .filter((transaction) => transaction.ledgerAccountId === accountId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt.localeCompare(b.createdAt))
  );
}

export function getLedgerAccountSummary(accountId: string, fromDate?: string, toDate?: string): Promise<LedgerAccountSummary & { transactions: LedgerTransaction[] }> {
  if (repositories.mode === "cloud" && repositories.ledger) return repositories.ledger.getSummary(accountId, fromDate, toDate);
  const transactions = loadLedgerTransactions().filter((transaction) => transaction.ledgerAccountId === accountId);
  const filtered = transactions.filter((transaction) => {
    if (!fromDate && !toDate) return true;
    const time = new Date(transaction.date).getTime();
    if (fromDate && time < new Date(fromDate).getTime()) return false;
    if (toDate && time > new Date(`${toDate}T23:59:59`).getTime()) return false;
    return true;
  });

  const sorted = filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt.localeCompare(b.createdAt));
  let running = 0;
  const adjusted = sorted.map((transaction) => {
    running += transaction.debit - transaction.credit;
    return { ...transaction, balance: running };
  });

  const totalDebit = adjusted.reduce((sum, tx) => sum + tx.debit, 0);
  const totalCredit = adjusted.reduce((sum, tx) => sum + tx.credit, 0);
  const currentBalance = totalDebit - totalCredit;

  return Promise.resolve({
    totalDebit,
    totalCredit,
    currentBalance,
    totalTransactions: adjusted.length,
    transactions: adjusted,
  });
}

export function refreshAccountBalances(accountId: string, transactionsOverride?: LedgerTransaction[]): void {
  const allTransactions = transactionsOverride ?? loadLedgerTransactions();
  const accountTransactions = allTransactions
    .filter((transaction) => transaction.ledgerAccountId === accountId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt.localeCompare(b.createdAt));

  let running = 0;
  const refreshed = accountTransactions.map((transaction) => {
    running += transaction.debit - transaction.credit;
    return { ...transaction, balance: running };
  });

  const remaining = (transactionsOverride ?? allTransactions).filter((transaction) => transaction.ledgerAccountId !== accountId);
  saveLedgerTransactions([...remaining, ...refreshed]);
}

export function syncBillToLedger(bill: Bill, accountId?: string): Promise<void> {
  if (!accountId) return Promise.resolve();
  if (repositories.mode === "cloud" && repositories.ledger) return repositories.ledger.syncBillToLedger(bill, accountId);

  const allTransactions = loadLedgerTransactions();
  const accountTransactions = allTransactions.filter((transaction) => transaction.ledgerAccountId === accountId);
  const existing = accountTransactions.find((transaction) => transaction.billId === bill.id && transaction.transactionType === "bill");

  const currentEntry: LedgerTransaction = {
    id: existing?.id ?? generateId("ledger_tx"),
    ledgerAccountId: accountId,
    billId: bill.id,
    date: bill.date,
    voucherNumber: String(bill.serialNumber),
    paymentMode: "-",
    description: `Bill Generated — Bill #${bill.serialNumber}`,
    debit: bill.totalAmount,
    credit: 0,
    balance: 0,
    transactionType: "bill",
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const filtered = allTransactions.filter((transaction) => !(transaction.ledgerAccountId === accountId && transaction.billId === bill.id && transaction.transactionType === "bill"));
  const next = [...filtered, currentEntry];
  refreshAccountBalances(accountId, next);

  return Promise.resolve();
}

export function removeBillFromLedger(bill: Bill, accountId?: string): Promise<void> {
  if (!accountId) return Promise.resolve();
  if (repositories.mode === "cloud" && repositories.ledger) return repositories.ledger.removeBillFromLedger(bill, accountId);
  const allTransactions = loadLedgerTransactions();
  const filtered = allTransactions.filter((transaction) => !(transaction.billId === bill.id && transaction.ledgerAccountId === accountId));
  saveLedgerTransactions(filtered);
  refreshAccountBalances(accountId, filtered);
  return Promise.resolve();
}

export function reconcileLedgerAfterBillChange(previousBill: Bill | null, nextBill: Bill): Promise<void> {
  const nextAccountId = nextBill.ledgerAccountId;
  const prevAccountId = previousBill?.ledgerAccountId;

  if (prevAccountId && prevAccountId !== nextAccountId) {
    removeBillFromLedger(previousBill!, prevAccountId);
  }

  if (nextAccountId) {
    syncBillToLedger(nextBill, nextAccountId);
  }

  return Promise.resolve();
}

export function getAccountLedgerForView(accountId: string, fromDate?: string, toDate?: string): Promise<LedgerAccountSummary & { transactions: LedgerTransaction[] }> {
  return getLedgerAccountSummary(accountId, fromDate, toDate);
}
