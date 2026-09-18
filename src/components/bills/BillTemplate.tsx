import type { Bill, BillTypeId } from "@/types/bill";
import type { BusinessProfile } from "@/types/business";

export type BillTemplateProps = {
  bill: Bill;
  business?: BusinessProfile | null;
};

const money = (value: number) => Math.round(value).toLocaleString("en-PK");

function billDate(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
}

function safeText(value?: string | null) {
  return value?.trim() || "";
}

// ============================================================================
// AL GHANI TRADERS CONFIGURATION
// ============================================================================
const alGhaniConfig = {
  billNo: { left: "78%", top: "31.5%", width: "17%", height: "3%", color: "#111", fontSize: "14px", fontWeight: "700" },
  date: { left: "78%", top: "35%", width: "17%", height: "3%", color: "#111", fontSize: "14px", fontWeight: "700" },
  customer: { left: "24%", top: "30.5%", width: "40%", height: "3%", color: "#0d3b36", fontSize: "14px", fontWeight: "700" },
  place: { left: "15%", top: "33.5%", width: "42%", height: "3%", color: "#0d3b36", fontSize: "13px", fontWeight: "600" },
  phone: { left: "15%", top: "36.5%", width: "42%", height: "3%", color: "#0d3b36", fontSize: "13px", fontWeight: "600" },
  total: { left: "76%", top: "76.5%", width: "18.5%", height: "3.5%", color: "#ffffff", fontSize: "15px", fontWeight: "800", alignItems: "center" },
  remarks: { left: "52%", top: "80.6%", width: "13%", height: "2.5%", color: "#0d3b36", fontSize: "10px", fontWeight: "400", alignItems: "center" },
  tableStart: 45.5,
  rowHeight: 2.95,
  cols: {
    sr: { left: "3%", width: "9%" },
    detail: { left: "14%", width: "39%", isLeft: true },
    qty: { left: "54%", width: "12%" },
    rate: { left: "66%", width: "12.5%" },
    amount: { left: "78.5%", width: "18%" }
  }
};

function AlGhaniBillRenderer({ bill, business }: BillTemplateProps) {
  const lineOne = safeText(bill.partyName);
  const lineTwo = safeText(bill.partyAddress);
  const lineThree = safeText(bill.partyPhone) || safeText(business?.phone) || "";
  const billNumber = safeText(bill.billNumber) || String(bill.serialNumber || "");
  const billDateValue = bill.date ? billDate(bill.date) : "";
  const remarks = safeText(bill.notes);
  const rows = (bill.items ?? [])
    .filter((item) => item && (safeText(item.productNameSnapshot) || !!item.productId || item.quantity > 0 || item.rate > 0))
    .slice(0, 13);
  const cfg = alGhaniConfig;

  return (
    <article className="bill-sheet reference-sheet" aria-label="AL-GHANI TRADERS bill invoice">
      <img className="reference-page" src="/Al Ghani.jpeg" alt="" aria-hidden="true" />
      <div className="reference-overlay">
        <div className="reference-field" style={{ ...cfg.customer }}>{lineOne}</div>
        <div className="reference-field" style={{ ...cfg.place }}>{lineTwo}</div>
        <div className="reference-field" style={{ ...cfg.phone }}>{lineThree}</div>
        <div className="reference-field" style={{ ...cfg.billNo, justifyContent: "center" }}>{billNumber}</div>
        <div className="reference-field" style={{ ...cfg.date, justifyContent: "center" }}>{billDateValue}</div>

        <div className="reference-items">
          {rows.map((item, index) => {
            const hasItem = !!item.productNameSnapshot;
            return (
            <div className="reference-row" key={item.id || index} style={{ top: `${cfg.tableStart + index * cfg.rowHeight}%`, height: `${cfg.rowHeight}%`, color: "#0d3b36", fontSize: "12px", fontWeight: "600" }}>
              <span className="reference-cell" style={{ left: cfg.cols.sr.left, width: cfg.cols.sr.width }}>{hasItem ? index + 1 : ""}</span>
              <span className="reference-cell reference-cell-left" style={{ left: cfg.cols.detail.left, width: cfg.cols.detail.width }}>{item.productNameSnapshot}</span>
              <span className="reference-cell" style={{ left: cfg.cols.qty.left, width: cfg.cols.qty.width }}>{hasItem && item.quantity ? item.quantity : ""}</span>
              <span className="reference-cell" style={{ left: cfg.cols.rate.left, width: cfg.cols.rate.width }}>{hasItem && item.rate ? money(item.rate) : ""}</span>
              <span className="reference-cell" style={{ left: cfg.cols.amount.left, width: cfg.cols.amount.width }}>{hasItem && item.amount ? money(item.amount) : ""}</span>
            </div>
            );
          })}
        </div>
        <div className="reference-field" style={{ ...cfg.total, justifyContent: "center" }}>{money(bill.totalAmount)}</div>
        <div className="reference-field" style={{ ...cfg.remarks, justifyContent: "center" }}>{remarks}</div>
      </div>
    </article>
  );
}

// ============================================================================
// SHAREEF TRADERS CONFIGURATION
// ============================================================================
const shareefConfig = {
  billNo: { left: "76%", top: "32%", width: "19%", height: "3%", color: "#111", fontSize: "14px", fontWeight: "700" },
  date: { left: "76%", top: "33.8%", width: "19%", height: "3%", color: "#111", fontSize: "14px", fontWeight: "700" },
  customer: { left: "28%", top: "31%", width: "35%", height: "3%", color: "#0d3b36", fontSize: "14px", fontWeight: "700" },
  place: { left: "23%", top: "34%", width: "37%", height: "3%", color: "#0d3b36", fontSize: "13px", fontWeight: "600" },
  phone: { left: "23%", top: "38%", width: "37%", height: "3%", color: "#0d3b36", fontSize: "13px", fontWeight: "600" },
  total: { left: "81%", top: "79.5%", width: "16%", height: "3.5%", color: "#111", fontSize: "15px", fontWeight: "800", alignItems: "center" },
  remarks: { left: "54%", top: "80.6%", width: "11%", height: "2.5%", color: "#0d3b36", fontSize: "10px", fontWeight: "400", alignItems: "center" },
  tableStart: 47,
  rowHeight: 2.9,
  cols: {
    sr: { left: "3.5%", width: "9.5%" },
    detail: { left: "16%", width: "38.5%", isLeft: true },
    qty: { left: "55%", width: "11.5%" },
    rate: { left: "66.5%", width: "12.5%" },
    amount: { left: "79.5%", width: "17%" }
  }
};

function ShareefBillRenderer({ bill, business }: BillTemplateProps) {
  const lineOne = safeText(bill.partyName);
  const lineTwo = safeText(bill.partyAddress);
  const lineThree = safeText(bill.partyPhone) || safeText(business?.phone) || "";
  const billNumber = safeText(bill.billNumber) || String(bill.serialNumber || "");
  const billDateValue = bill.date ? billDate(bill.date) : "";
  const remarks = safeText(bill.notes);
  const rows = (bill.items ?? [])
    .filter((item) => item && (safeText(item.productNameSnapshot) || !!item.productId || item.quantity > 0 || item.rate > 0))
    .slice(0, 13);
  const cfg = shareefConfig;

  return (
    <article className="bill-sheet reference-sheet" aria-label="SHAREEF TRADERS bill invoice">
      <img className="reference-page" src="/Al Shareef.png" alt="" aria-hidden="true" />
      <div className="reference-overlay">
        <div className="reference-field" style={{ ...cfg.customer }}>{lineOne}</div>
        <div className="reference-field" style={{ ...cfg.place }}>{lineTwo}</div>
        <div className="reference-field" style={{ ...cfg.phone }}>{lineThree}</div>
        <div className="reference-field" style={{ ...cfg.billNo, justifyContent: "center" }}>{billNumber}</div>
        <div className="reference-field" style={{ ...cfg.date, justifyContent: "center" }}>{billDateValue}</div>

        <div className="reference-items">
          {rows.map((item, index) => {
            const hasItem = !!item.productNameSnapshot;
            return (
            <div className="reference-row" key={item.id || index} style={{ top: `${cfg.tableStart + index * cfg.rowHeight}%`, height: `${cfg.rowHeight}%`, color: "#0d3b36", fontSize: "12px", fontWeight: "600" }}>
              <span className="reference-cell" style={{ left: cfg.cols.sr.left, width: cfg.cols.sr.width }}>{hasItem ? index + 1 : ""}</span>
              <span className="reference-cell reference-cell-left" style={{ left: cfg.cols.detail.left, width: cfg.cols.detail.width }}>{item.productNameSnapshot}</span>
              <span className="reference-cell" style={{ left: cfg.cols.qty.left, width: cfg.cols.qty.width }}>{hasItem && item.quantity ? item.quantity : ""}</span>
              <span className="reference-cell" style={{ left: cfg.cols.rate.left, width: cfg.cols.rate.width }}>{hasItem && item.rate ? money(item.rate) : ""}</span>
              <span className="reference-cell" style={{ left: cfg.cols.amount.left, width: cfg.cols.amount.width }}>{hasItem && item.amount ? money(item.amount) : ""}</span>
            </div>
            );
          })}
        </div>
        <div className="reference-field" style={{ ...cfg.total, justifyContent: "center" }}>{money(bill.totalAmount)}</div>
        <div className="reference-field" style={{ ...cfg.remarks, justifyContent: "center" }}>{remarks}</div>
      </div>
    </article>
  );
}

// ============================================================================
// KING ENTERPRISE CONFIGURATION
// ============================================================================
const kingConfig = {
  billNo: { left: "10%", top: "29.5%", width: "42%", height: "3%", color: "#111", fontSize: "14px", fontWeight: "700" },
  date: { left: "70%", top: "33.5%", width: "24%", height: "3%", color: "#111", fontSize: "14px", fontWeight: "700" },
  customer: { left: "12%", top: "33.5%", width: "40%", height: "3%", color: "#111", fontSize: "14px", fontWeight: "700" },
  total: { left: "71.5%", top: "88%", width: "24%", height: "3.5%", color: "#111", fontSize: "15px", fontWeight: "800", alignItems: "center" },
  tableStart: 42.4,
  rowHeight: 3.9,
  cols: {
    detail: { left: "13%", width: "40%", isLeft: true },
    qty: { left: "55%", width: "11%" },
    rate: { left: "66%", width: "13.5%" },
    amount: { left: "79.5%", width: "16.5%" }
  }
};

function KingEnterpriseBillRenderer({ bill }: BillTemplateProps) {
  const lineOne = safeText(bill.partyName);
  const billNumber = safeText(bill.billNumber) || String(bill.serialNumber || "");
  const billDateValue = bill.date ? billDate(bill.date) : "";
  const rows = (bill.items ?? [])
    .filter((item) => item && (safeText(item.productNameSnapshot) || !!item.productId || item.quantity > 0 || item.rate > 0))
    .slice(0, 13);
  const cfg = kingConfig;

  return (
    <article className="bill-sheet reference-sheet" aria-label="KING ENTERPRISE bill invoice">
      <img className="reference-page" src="/king enterprise.jpeg" alt="" aria-hidden="true" />
      <div className="reference-overlay">
        <div className="reference-field" style={{ ...cfg.customer }}>{lineOne}</div>
        <div className="reference-field" style={{ ...cfg.billNo, justifyContent: "center" }}>{billNumber}</div>
        <div className="reference-field" style={{ ...cfg.date, justifyContent: "center" }}>{billDateValue}</div>

        <div className="reference-items">
          {rows.map((item, index) => {
            const hasItem = !!item.productNameSnapshot;
            return (
            <div className="reference-row" key={item.id || index} style={{ top: `${cfg.tableStart + index * cfg.rowHeight}%`, height: `${cfg.rowHeight}%`, color: "#111", fontSize: "12px", fontWeight: "600" }}>
              <span className="reference-cell reference-cell-left" style={{ left: cfg.cols.detail.left, width: cfg.cols.detail.width }}>{item.productNameSnapshot}</span>
              <span className="reference-cell" style={{ left: cfg.cols.qty.left, width: cfg.cols.qty.width }}>{hasItem && item.quantity ? item.quantity : ""}</span>
              <span className="reference-cell" style={{ left: cfg.cols.rate.left, width: cfg.cols.rate.width }}>{hasItem && item.rate ? money(item.rate) : ""}</span>
              <span className="reference-cell" style={{ left: cfg.cols.amount.left, width: cfg.cols.amount.width }}>{hasItem && item.amount ? money(item.amount) : ""}</span>
            </div>
            );
          })}
        </div>
        <div className="reference-field" style={{ ...cfg.total, justifyContent: "center" }}>{money(bill.totalAmount)}</div>
      </div>
    </article>
  );
}

// ============================================================================
// TEMPLATE EXPORTS
// ============================================================================
export function BillTemplate(props: BillTemplateProps) {
  if (props.bill.billType === "type-3") {
    return <KingEnterpriseBillRenderer {...props} />;
  }

  if (props.bill.billType === "type-2") {
    return <AlGhaniBillRenderer {...props} />;
  }

  // type-1
  return <ShareefBillRenderer {...props} />;
}

export function billTemplateName(type: BillTypeId) {
  if (type === "type-3") return "KING ENTERPRISE";
  if (type === "type-2") return "AL-GHANI TRADERS";
  return "SHAREEF TRADERS";
}

export function billTemplateSubtitle(type: BillTypeId) {
  if (type === "type-3") return "Purple hardware bill";
  if (type === "type-2") return "Classic black and white bill";
  return "Green stationery format";
}