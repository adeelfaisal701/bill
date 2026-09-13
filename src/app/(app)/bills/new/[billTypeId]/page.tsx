"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Info } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";
import { BillItemFormRow, type DraftBillItem } from "@/components/bills/BillItemFormRow";
import { useProducts } from "@/hooks/useProducts";
import { useToast } from "@/context/ToastContext";
import { createBill, getNextBillNumber } from "@/services/billService";
import { formatCurrency, generateId, todayIso } from "@/lib/utilities";
import { validateBillDraft } from "@/lib/validation";
import { BillTemplate, billTemplateName, billTemplateSubtitle } from "@/components/bills/BillTemplate";
import { getBusinessProfile } from "@/services/businessService";
import type { Bill, BillTypeId } from "@/types/bill";
import type { BusinessProfile } from "@/types/business";

const BILL_TYPE_LABEL: Record<BillTypeId, string> = {
  "type-1": "SHAREEF TRADERS",
  "type-2": "AL-GHANI TRADERS",
  "type-3": "KING ENTERPRISE",
};

function emptyItem(): DraftBillItem {
  return { key: generateId("draft"), productId: null, productNameSnapshot: "", quantity: 1, rate: 0 };
}

export default function CreateBillFoundationPage({
  params,
}: {
  params: Promise<{ billTypeId: string }>;
}) {
  const { billTypeId } = use(params);
  const billType = (["type-1", "type-2", "type-3"].includes(billTypeId) ? billTypeId : "type-1") as BillTypeId;

  const router = useRouter();
  const { show } = useToast();
  const { products, loading: productsLoading } = useProducts();
  const activeProducts = useMemo(() => products.filter((p) => p.isActive), [products]);

  const [partyName, setPartyName] = useState("");
  const [partyPhone, setPartyPhone] = useState("");
  const [partyAddress, setPartyAddress] = useState("");
  const [nextBillNumber, setNextBillNumber] = useState<number | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<DraftBillItem[]>([emptyItem()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);

  useEffect(() => {
    getBusinessProfile().then(setBusiness);
    getNextBillNumber().then(setNextBillNumber);
  }, []);

  const subtotal = items.reduce(
    (sum, i) => sum + Math.max(0, i.quantity) * Math.max(0, i.rate),
    0
  );

  const previewBill = useMemo<Bill>(() => ({
    id: "preview",
    billType,
    serialNumber: nextBillNumber ?? 0,
    partyName,
    partyPhone: partyPhone || undefined,
    partyAddress: partyAddress || undefined,
    date: new Date(date).toISOString(),
    items: items.map((item, index) => ({
      id: item.key,
      billId: "preview",
      productId: item.productId,
      productNameSnapshot: item.productNameSnapshot,
      quantity: item.quantity,
      rate: item.rate,
      costPrice: item.costPrice,
      amount: Math.max(0, item.quantity) * Math.max(0, item.rate),
    })),
    subtotal,
    totalAmount: subtotal,
    notes: notes || undefined,
    status: "draft",
    paymentStatus: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }), [billType, date, items, nextBillNumber, notes, partyAddress, partyName, partyPhone, subtotal]);

  function updateItem(key: string, patch: Partial<DraftBillItem>) {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((it) => it.key !== key));
  }

  async function handleSave() {
    const validationErrors = validateBillDraft({
      partyName,
      items: items.map((i) => ({
        productNameSnapshot: i.productNameSnapshot,
        quantity: i.quantity,
        rate: i.rate,
      })),
    });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      show(Object.values(validationErrors)[0], "error");
      return;
    }

    setSaving(true);
    try {
      const bill = await createBill({
        billType,
        partyName,
        partyPhone: partyPhone || undefined,
        partyAddress: partyAddress || undefined,
        date: new Date(date).toISOString(),
        notes: notes || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          productNameSnapshot: i.productNameSnapshot,
          quantity: i.quantity,
          rate: i.rate,
          costPrice: i.costPrice,
        })),
      });
      show("Bill saved successfully.", "success");
      router.push(`/bills/${bill.id}`);
    } catch {
      show("Unable to save bill. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pb-28">
      <div className="no-print">
        <PageHeader title={BILL_TYPE_LABEL[billType]} subtitle={`Serial number is assigned automatically on save`} />
      </div>

      <div className="no-print flex items-start gap-2 mx-4 sm:mx-6 rounded-xl bg-brand-50 px-4 py-3 text-xs text-brand-700">
        <Info size={16} className="mt-0.5 shrink-0" />
        {billTemplateSubtitle(billType)}. The preview below updates from the values entered here.
      </div>

      <div className="mt-4 space-y-5 px-4 sm:px-6">
          <Card className="no-print p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-400">
            Party Information
          </h2>
          <div className="flex flex-col gap-3">
            <Input
              label="Party / Customer Name"
              required
              placeholder="e.g. ABC Traders"
              value={partyName}
              error={errors.partyName}
              onChange={(e) => { setPartyName(e.target.value); setErrors((er) => ({ ...er, partyName: "" })); }}
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink-700">Bill Number</span>
                <div className="rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-[15px] text-ink-500">
                  {nextBillNumber ?? "Loading..."}
                </div>
              </div>
              <Input
                label="Phone (optional)"
                value={partyPhone}
                onChange={(e) => setPartyPhone(e.target.value)}
              />
            </div>
            <Input
              label="Address (optional)"
              placeholder="Customer address"
              value={partyAddress}
              onChange={(e) => setPartyAddress(e.target.value)}
            />
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </Card>

        <Card className="no-print p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
              Products
            </h2>
            <Button size="sm" variant="outline" onClick={addItem}>
              <Plus size={15} className="mr-1" /> Add Product
            </Button>
          </div>

          {productsLoading ? (
            <LoadingState rows={1} />
          ) : activeProducts.length === 0 ? (
            <div className="rounded-xl bg-ink-50 p-4 text-center text-sm text-ink-500">
              No active products yet.{" "}
              <a href="/products/new" className="font-medium text-brand-600 hover:underline">
                Add a product
              </a>{" "}
              first.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <BillItemFormRow
                  key={item.key}
                  item={item}
                  products={activeProducts}
                  onChange={(patch) => updateItem(item.key, patch)}
                  onRemove={() => removeItem(item.key)}
                  removable={items.length > 1}
                />
              ))}
            </div>
          )}
        </Card>

        <Card className="no-print p-4">
          <div className="flex items-center justify-between text-sm text-ink-500">
            <span>Subtotal</span>
            <span className="font-mono">{formatCurrency(subtotal)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-ink-100 pt-2">
            <span className="font-semibold text-ink-900">Total</span>
            <span className="font-mono text-lg font-bold text-ink-900">
              {formatCurrency(subtotal)}
            </span>
          </div>
        </Card>

        <Card className="no-print p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-400">
            Notes (optional)
          </h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes for this bill…"
            className="min-h-[80px] w-full rounded-xl border border-ink-200 bg-white p-3 text-sm text-ink-900 placeholder:text-ink-300 focus-ring focus:border-brand-400"
          />
        </Card>

        <div className="bill-preview-wrap bill-print-area">
          <p className="no-print mb-3 text-sm font-semibold text-ink-700">{billTemplateName(billType)} preview</p>
          <BillTemplate bill={previewBill} business={business} />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-ink-100 bg-surface/95 px-4 py-3 backdrop-blur md:bottom-0 md:pl-60">
        <div className="mx-auto flex max-w-2xl gap-2">
          <Button variant="outline" fullWidth onClick={() => document.querySelector(".bill-preview-wrap")?.scrollIntoView({ behavior: "smooth" })}>
            Preview
          </Button>
          <Button fullWidth onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Bill"}
          </Button>
        </div>
      </div>
    </div>
  );
}
