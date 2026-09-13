import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utilities";
import type { Bill } from "@/types/bill";
import { billTemplateName } from "./BillTemplate";

const BILL_TYPE_LABEL: Record<Bill["billType"], string> = {
  "type-1": billTemplateName("type-1"),
  "type-2": billTemplateName("type-2"),
  "type-3": billTemplateName("type-3"),
};

export function BillCard({ bill, onTogglePaymentStatus }: { bill: Bill, onTogglePaymentStatus?: (bill: Bill) => void }) {
  return (
    <Link href={`/bills/${bill.id}`}>
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white px-4 py-4 shadow-card transition-shadow hover:shadow-floating">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-ink-800">#{bill.serialNumber}</span>
            <Badge tone="brand">{BILL_TYPE_LABEL[bill.billType]}</Badge>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onTogglePaymentStatus) onTogglePaymentStatus(bill);
              }}
              className="ml-auto sm:ml-0 cursor-pointer rounded-full focus-ring focus:outline-none focus-visible:ring-2"
              aria-label={`Mark as ${bill.paymentStatus === "paid" ? "pending" : "paid"}`}
            >
              <Badge tone={bill.paymentStatus === "paid" ? "success" : "neutral"} className="hover:opacity-80 capitalize">
                {bill.paymentStatus}
              </Badge>
            </button>
          </div>
          <p className="mt-1 truncate font-medium text-ink-900">{bill.partyName}</p>
          <p className="text-xs text-ink-400">{formatDate(bill.date)}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-base font-bold text-ink-900">
            {formatCurrency(bill.totalAmount)}
          </p>
        </div>
      </div>
    </Link>
  );
}
