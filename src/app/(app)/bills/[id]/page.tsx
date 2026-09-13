"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileDown, Share2, Printer, Copy, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/context/ToastContext";
import { getBill, deleteBill } from "@/services/billService";
import { getBusinessProfile } from "@/services/businessService";
import { formatCurrency, formatDate } from "@/lib/utilities";
import { BillTemplate, billTemplateName } from "@/components/bills/BillTemplate";
import { createBillPdf, downloadBillPdf } from "@/lib/billExport";
import type { Bill } from "@/types/bill";
import type { BusinessProfile } from "@/types/business";

const BILL_TYPE_LABEL: Record<Bill["billType"], string> = {
  "type-1": "SHAREEF TRADERS",
  "type-2": "AL-GHANI TRADERS",
  "type-3": "KING ENTERPRISE",
};

export default function BillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { show } = useToast();
  const [bill, setBill] = useState<Bill | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getBill(id)
      .then(setBill)
      .catch(() => setError("Unable to load this bill. Please try again."));
    getBusinessProfile().then(setBusiness);
  }, [id]);

  async function handlePdf() {
    const element = document.querySelector<HTMLElement>(".bill-print-area .bill-sheet");
    if (!element) return;
    setExporting(true);
    try {
      await downloadBillPdf(element, `${BILL_TYPE_LABEL[bill!.billType].toLowerCase().replaceAll(" ", "-")}-${bill!.serialNumber}.pdf`);
      show("PDF downloaded.", "success");
    } catch {
      show("Unable to generate the PDF. Please try again.", "error");
    } finally {
      setExporting(false);
    }
  }

  async function handleShare() {
    const element = document.querySelector<HTMLElement>(".bill-print-area .bill-sheet");
    if (!element || !navigator.share) {
      show("File sharing is not supported in this browser. Download the PDF instead.", "error");
      return;
    }
    setExporting(true);
    try {
      const pdf = await createBillPdf(element);
      const file = new File([pdf.output("blob")], `bill-${bill!.serialNumber}.pdf`, { type: "application/pdf" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: `Bill #${bill!.serialNumber}`, files: [file] });
      } else {
        show("File sharing is not supported in this browser. Download the PDF instead.", "error");
      }
    } catch {
      show("Unable to share this bill. Please try again.", "error");
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    if (!bill) return;
    try {
      await deleteBill(bill.id);
      show("Bill deleted.", "success");
      router.push("/bills");
    } catch {
      show("Unable to delete bill. Please try again.", "error");
    }
  }

  if (error) return <ErrorState message={error} />;
  if (bill === undefined) return <LoadingState rows={4} />;
  if (bill === null) {
    return (
      <div className="p-6 text-center text-sm text-ink-500">
        This bill doesn&apos;t exist.{" "}
        <Link href="/bills" className="text-brand-600 hover:underline">
          Back to bills
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <div className="no-print"><PageHeader title={`Bill #${bill.serialNumber}`} subtitle={BILL_TYPE_LABEL[bill.billType]} /></div>

      <div className="space-y-4 px-4 sm:px-6">
        <Card className="no-print p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-ink-900">{bill.partyName}</p>
              {bill.partyPhone && <p className="text-sm text-ink-400">{bill.partyPhone}</p>}
            </div>
            <Badge tone="brand">{BILL_TYPE_LABEL[bill.billType]}</Badge>
          </div>
          <p className="mt-2 text-sm text-ink-400">{formatDate(bill.date)}</p>
        </Card>

        <Card className="no-print p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-400">
            Items
          </h2>
          <div className="divide-y divide-ink-100">
            {bill.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium text-ink-800">{item.productNameSnapshot}</p>
                  <p className="text-xs text-ink-400">
                    {item.quantity} × {formatCurrency(item.rate)}
                  </p>
                </div>
                <span className="font-mono font-semibold text-ink-900">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3">
            <span className="font-semibold text-ink-900">Total</span>
            <span className="font-mono text-lg font-bold text-ink-900">
              {formatCurrency(bill.totalAmount)}
            </span>
          </div>
        </Card>

        {bill.notes && (
          <Card className="no-print p-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-400">
              Notes
            </h2>
            <p className="text-sm text-ink-700">{bill.notes}</p>
          </Card>
        )}

        <div className="bill-print-area">
          <p className="no-print mb-3 text-sm font-semibold text-ink-700">{billTemplateName(bill.billType)}</p>
          <BillTemplate bill={bill} business={business} />
        </div>

        <Card className="no-print p-2">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <ActionButton icon={<FileDown size={18} />} label={exporting ? "Working" : "PDF"} onClick={handlePdf} />
            <ActionButton icon={<Share2 size={18} />} label="Share" onClick={handleShare} />
            <ActionButton icon={<Printer size={18} />} label="Print" onClick={() => window.print()} />
            <ActionButton icon={<Copy size={18} />} label="Duplicate" onClick={() => show("Duplicate is not available yet.")} />
          </div>
        </Card>

        <Button
          className="no-print"
          variant="danger"
          fullWidth
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 size={16} className="mr-1.5" /> Delete Bill
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this bill?"
        message={`Bill #${bill.serialNumber} for ${bill.partyName} will be permanently removed. This can't be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-xs font-medium text-ink-600 hover:bg-ink-50 focus-ring"
    >
      {icon}
      {label}
    </button>
  );
}
