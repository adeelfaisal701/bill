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
    if (resource === "bills") return NextResponse.json({ data: await data.listBills() });
    if (resource === "bill") return NextResponse.json({ data: await data.getBill(url.searchParams.get("id") ?? "") });
    if (resource === "bill-types") return NextResponse.json({ data: await data.getBillTypes() });
    if (resource === "next-bill-number") return NextResponse.json({ data: await data.getNextBillNumber() });
    return NextResponse.json({ message: "Unknown persistence resource." }, { status: 400 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await data.requireFixedSession();
    const body = await request.json() as { resource?: string; id?: string; input?: unknown; patch?: unknown };
    if (body.resource === "product") return NextResponse.json({ data: await data.createProduct(body.input as Parameters<typeof data.createProduct>[0]) });
    if (body.resource === "bill") return NextResponse.json({ data: await data.createBill(body.input as Parameters<typeof data.createBill>[0]) });
    if (body.resource === "reserve-serial") return NextResponse.json({ data: await data.reserveNextSerialNumber((body.input as { billType: Parameters<typeof data.reserveNextSerialNumber>[0] }).billType) });
    if (body.resource === "update-product") return NextResponse.json({ data: await data.updateProduct(body.id ?? "", body.patch as Parameters<typeof data.updateProduct>[1]) });
    if (body.resource === "update-bill") return NextResponse.json({ data: await data.updateBill(body.id ?? "", body.patch as Parameters<typeof data.updateBill>[1]) });
    if (body.resource === "delete-product") { await data.deleteProduct(body.id ?? ""); return NextResponse.json({ data: null }); }
    if (body.resource === "delete-bill") { await data.deleteBill(body.id ?? ""); return NextResponse.json({ data: null }); }
    return NextResponse.json({ message: "Unknown persistence resource." }, { status: 400 });
  } catch (error) {
    return errorResponse(error);
  }
}
