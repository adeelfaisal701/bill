import { NextResponse } from "next/server";
import * as data from "@/repositories/supabase/server";

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Persistence request failed.";
  return NextResponse.json({ message }, { status: message === "Unauthorized" ? 401 : 500 });
}

export async function GET(request: Request) {
  try {
    await data.requireFixedSession();
    const url = new URL(request.url);
    const resource = url.searchParams.get("resource");
    if (resource === "products") return NextResponse.json({ data: await data.listProducts() });
    if (resource === "product") return NextResponse.json({ data: await data.getProduct(url.searchParams.get("id") ?? "") });
    if (resource === "bills") return NextResponse.json({ data: await data.listBills() });
    if (resource === "bill") return NextResponse.json({ data: await data.getBill(url.searchParams.get("id") ?? "") });
    if (resource === "bill-types") return NextResponse.json({ data: await data.getBillTypes() });
    if (resource === "next-bill-number") return NextResponse.json({ data: await data.getNextBillNumber(url.searchParams.get("billType") as Parameters<typeof data.getNextBillNumber>[0]) });
    if (resource === "business-profile") return NextResponse.json({ data: await data.getBusinessProfile() });
    if (resource === "ledger-accounts") return NextResponse.json({ data: await data.listLedgerAccounts() });
    if (resource === "ledger-account") return NextResponse.json({ data: await data.getLedgerAccount(url.searchParams.get("id") ?? "") });
    if (resource === "ledger-account-slug") return NextResponse.json({ data: await data.getLedgerAccountBySlug(url.searchParams.get("slug") ?? "") });
    if (resource === "ledger-transactions") return NextResponse.json({ data: await data.listLedgerTransactions(url.searchParams.get("accountId") ?? "") });
    if (resource === "ledger-summary") return NextResponse.json({ data: await data.getLedgerAccountSummary(url.searchParams.get("accountId") ?? "", url.searchParams.get("fromDate") ?? undefined, url.searchParams.get("toDate") ?? undefined) });
    return NextResponse.json({ message: "Unknown persistence resource." }, { status: 400 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await data.requireFixedSession();
    const body = await request.json() as { resource?: string; id?: string; accountId?: string; bill?: unknown; input?: unknown; patch?: unknown };
    if (body.resource === "product") return NextResponse.json({ data: await data.createProduct(body.input as Parameters<typeof data.createProduct>[0]) });
    if (body.resource === "bill") return NextResponse.json({ data: await data.createBill(body.input as Parameters<typeof data.createBill>[0]) });
    if (body.resource === "reserve-serial") return NextResponse.json({ data: await data.reserveNextSerialNumber((body.input as { billType: Parameters<typeof data.reserveNextSerialNumber>[0] }).billType) });
    if (body.resource === "update-product") return NextResponse.json({ data: await data.updateProduct(body.id ?? "", body.patch as Parameters<typeof data.updateProduct>[1]) });
    if (body.resource === "update-bill") return NextResponse.json({ data: await data.updateBill(body.id ?? "", body.patch as Parameters<typeof data.updateBill>[1]) });
    if (body.resource === "delete-product") { await data.deleteProduct(body.id ?? ""); return NextResponse.json({ data: null }); }
    if (body.resource === "delete-bill") { await data.deleteBill(body.id ?? ""); return NextResponse.json({ data: null }); }
    if (body.resource === "business-profile") return NextResponse.json({ data: await data.saveBusinessProfile(body.input as Parameters<typeof data.saveBusinessProfile>[0]) });
    if (body.resource === "ledger-account") return NextResponse.json({ data: await data.createLedgerAccount(body.input as Parameters<typeof data.createLedgerAccount>[0]) });
    if (body.resource === "update-ledger-account") return NextResponse.json({ data: await data.updateLedgerAccount(body.id ?? "", body.patch as Parameters<typeof data.updateLedgerAccount>[1]) });
    if (body.resource === "delete-ledger-account") { await data.deleteLedgerAccount(body.id ?? ""); return NextResponse.json({ data: null }); }
    if (body.resource === "ledger-transaction") return NextResponse.json({ data: await data.createLedgerTransaction(body.accountId ?? "", body.input as Parameters<typeof data.createLedgerTransaction>[1]) });
    if (body.resource === "update-ledger-transaction") return NextResponse.json({ data: await data.updateLedgerTransaction(body.id ?? "", body.patch as Parameters<typeof data.updateLedgerTransaction>[1]) });
    if (body.resource === "delete-ledger-transaction") { await data.deleteLedgerTransaction(body.id ?? ""); return NextResponse.json({ data: null }); }
    if (body.resource === "sync-bill-ledger") { await data.syncBillToLedger(body.bill as Parameters<typeof data.syncBillToLedger>[0], body.accountId ?? ""); return NextResponse.json({ data: null }); }
    if (body.resource === "remove-bill-ledger") { await data.removeBillFromLedger(body.bill as Parameters<typeof data.removeBillFromLedger>[0], body.accountId ?? ""); return NextResponse.json({ data: null }); }
    return NextResponse.json({ message: "Unknown persistence resource." }, { status: 400 });
  } catch (error) {
    return errorResponse(error);
  }
}
