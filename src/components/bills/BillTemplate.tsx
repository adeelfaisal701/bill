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
  billNo: { left: "74%", top: "22.5%", width: "22%", height: "3%", color: "#111", fontSize: "14px", fontWeight: "700" },
  date: { left: "74%", top: "25.5%", width: "22%", height: "3%", color: "#111", fontSize: "14px", fontWeight: "700" },
  customer: { left: "20%", top: "25.5%", width: "42%", height: "3%", color: "#0d3b36", fontSize: "14px", fontWeight: "700" },
  place: { left: "20%", top: "28.5%", width: "42%", height: "3%", color: "#0d3b36", fontSize: "13px", fontWeight: "600" },
  phone: { left: "20%", top: "31.5%", width: "42%", height: "3%", color: "#0d3b36", fontSize: "13px", fontWeight: "600" },
  total: { left: "78.5%", top: "79.5%", width: "18.5%", height: "3.5%", color: "#ffffff", fontSize: "15px", fontWeight: "800", alignItems: "center" },
  remarks: { left: "52%", top: "80.6%", width: "13%", height: "2.5%", color: "#0d3b36", fontSize: "10px", fontWeight: "400", alignItems: "center" },
  tableStart: 38.8,
  rowHeight: 2.95,
  cols: {
    sr: { left: "3%", width: "9%" },
    detail: { left: "12.5%", width: "41%", isLeft: true },
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
  const rows = bill.items.slice(0, 13);
  const cfg = alGhaniConfig;

  return (
    <article className="bill-sheet reference-sheet" aria-label="AL-GHANI TRADERS bill invoice">
      <div className="reference-page" style={{ backgroundImage: "url('/Al Ghani.png')" }} aria-hidden="true" />
      <div className="reference-overlay">
        <div className="reference-field" style={{ ...cfg.customer }}>{lineOne}</div>
        <div className="reference-field" style={{ ...cfg.place }}>{lineTwo}</div>
        <div className="reference-field" style={{ ...cfg.phone }}>{lineThree}</div>
        <div className="reference-field" style={{ ...cfg.billNo, justifyContent: "center" }}>{billNumber}</div>
        <div className="reference-field" style={{ ...cfg.date, justifyContent: "center" }}>{billDateValue}</div>

        <div className="reference-items">
          {rows.map((item, index) => (
            <div className="reference-row" key={item.id || index} style={{ top: `${cfg.tableStart + index * cfg.rowHeight}%`, height: `${cfg.rowHeight}%`, color: "#0d3b36", fontSize: "12px", fontWeight: "600" }}>
              <span className="reference-cell" style={{ left: cfg.cols.sr.left, width: cfg.cols.sr.width }}>{index + 1}</span>
              <span className="reference-cell reference-cell-left" style={{ left: cfg.cols.detail.left, width: cfg.cols.detail.width }}>{item.productNameSnapshot}</span>
              <span className="reference-cell" style={{ left: cfg.cols.qty.left, width: cfg.cols.qty.width }}>{item.quantity || ""}</span>
              <span className="reference-cell" style={{ left: cfg.cols.rate.left, width: cfg.cols.rate.width }}>{item.rate ? money(item.rate) : ""}</span>
              <span className="reference-cell" style={{ left: cfg.cols.amount.left, width: cfg.cols.amount.width }}>{item.amount ? money(item.amount) : ""}</span>
            </div>
          ))}
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
  billNo: { left: "80%", top: "1.8%", width: "16%", height: "3%", color: "#ffffff", fontSize: "14px", fontWeight: "700" },
  date: { left: "78%", top: "4.2%", width: "18%", height: "3%", color: "#ffffff", fontSize: "14px", fontWeight: "700" },
  customer: { left: "22.5%", top: "21.6%", width: "44%", height: "3%", color: "#0d3b36", fontSize: "14px", fontWeight: "700" },
  place: { left: "22.5%", top: "24.6%", width: "44%", height: "3%", color: "#0d3b36", fontSize: "13px", fontWeight: "600" },
  phone: { left: "22.5%", top: "27.6%", width: "44%", height: "3%", color: "#0d3b36", fontSize: "13px", fontWeight: "600" },
  total: { left: "79.5%", top: "79.5%", width: "17%", height: "3.5%", color: "#ffffff", fontSize: "15px", fontWeight: "800", alignItems: "center" },
  remarks: { left: "54%", top: "80.6%", width: "11%", height: "2.5%", color: "#0d3b36", fontSize: "10px", fontWeight: "400", alignItems: "center" },
  tableStart: 34.6,
  rowHeight: 3.3,
  cols: {
    sr: { left: "3.5%", width: "9.5%" },
    detail: { left: "13.5%", width: "41%", isLeft: true },
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
  const rows = bill.items.slice(0, 13);
  const cfg = shareefConfig;

  return (
    <article className="bill-sheet reference-sheet" aria-label="SHAREEF TRADERS bill invoice">
      <div className="reference-page" style={{ backgroundImage: "url('/Al Shareef.png')" }} aria-hidden="true" />
      <div className="reference-overlay">
        <div className="reference-field" style={{ ...cfg.customer }}>{lineOne}</div>
        <div className="reference-field" style={{ ...cfg.place }}>{lineTwo}</div>
        <div className="reference-field" style={{ ...cfg.phone }}>{lineThree}</div>
        <div className="reference-field" style={{ ...cfg.billNo, justifyContent: "center" }}>{billNumber}</div>
        <div className="reference-field" style={{ ...cfg.date, justifyContent: "center" }}>{billDateValue}</div>

        <div className="reference-items">
          {rows.map((item, index) => (
            <div className="reference-row" key={item.id || index} style={{ top: `${cfg.tableStart + index * cfg.rowHeight}%`, height: `${cfg.rowHeight}%`, color: "#0d3b36", fontSize: "12px", fontWeight: "600" }}>
              <span className="reference-cell" style={{ left: cfg.cols.sr.left, width: cfg.cols.sr.width }}>{index + 1}</span>
              <span className="reference-cell reference-cell-left" style={{ left: cfg.cols.detail.left, width: cfg.cols.detail.width }}>{item.productNameSnapshot}</span>
              <span className="reference-cell" style={{ left: cfg.cols.qty.left, width: cfg.cols.qty.width }}>{item.quantity || ""}</span>
              <span className="reference-cell" style={{ left: cfg.cols.rate.left, width: cfg.cols.rate.width }}>{item.rate ? money(item.rate) : ""}</span>
              <span className="reference-cell" style={{ left: cfg.cols.amount.left, width: cfg.cols.amount.width }}>{item.amount ? money(item.amount) : ""}</span>
            </div>
          ))}
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
  billNo: { left: "10%", top: "25.2%", width: "12%", height: "3%", color: "#111", fontSize: "14px", fontWeight: "700" },
  date: { left: "70%", top: "29.2%", width: "22%", height: "3%", color: "#111", fontSize: "14px", fontWeight: "700" },
  customer: { left: "15%", top: "29.2%", width: "42%", height: "3%", color: "#111", fontSize: "14px", fontWeight: "700" },
  total: { left: "80%", top: "89.5%", width: "16.5%", height: "4%", color: "#111", fontSize: "15px", fontWeight: "800", alignItems: "center" },
  tableStart: 38.6,
  rowHeight: 4.0,
  cols: {
    detail: { left: "4%", width: "49%", isLeft: true },
    qty: { left: "53.5%", width: "11.5%" },
    rate: { left: "65.5%", width: "14%" },
    amount: { left: "79.5%", width: "16.5%" }
  }
};

function KingEnterpriseBillRenderer({ bill }: BillTemplateProps) {
  const lineOne = safeText(bill.partyName);
  const billNumber = safeText(bill.billNumber) || String(bill.serialNumber || "");
  const billDateValue = bill.date ? billDate(bill.date) : "";
  const rows = bill.items.slice(0, 13);
  const cfg = kingConfig;

  return (
    <article className="bill-sheet reference-sheet" aria-label="KING ENTERPRISE bill invoice">
      <div className="reference-page" style={{ backgroundImage: "url('/king enterprise.png')" }} aria-hidden="true" />
      <div className="reference-overlay">
        <div className="reference-field" style={{ ...cfg.customer }}>{lineOne}</div>
        <div className="reference-field" style={{ ...cfg.billNo, justifyContent: "center" }}>{billNumber}</div>
        <div className="reference-field" style={{ ...cfg.date, justifyContent: "center" }}>{billDateValue}</div>

        <div className="reference-items">
          {rows.map((item, index) => (
            <div className="reference-row" key={item.id || index} style={{ top: `${cfg.tableStart + index * cfg.rowHeight}%`, height: `${cfg.rowHeight}%`, color: "#111", fontSize: "12px", fontWeight: "600" }}>
              <span className="reference-cell reference-cell-left" style={{ left: cfg.cols.detail.left, width: cfg.cols.detail.width }}>{item.productNameSnapshot}</span>
              <span className="reference-cell" style={{ left: cfg.cols.qty.left, width: cfg.cols.qty.width }}>{item.quantity || ""}</span>
              <span className="reference-cell" style={{ left: cfg.cols.rate.left, width: cfg.cols.rate.width }}>{item.rate ? money(item.rate) : ""}</span>
              <span className="reference-cell" style={{ left: cfg.cols.amount.left, width: cfg.cols.amount.width }}>{item.amount ? money(item.amount) : ""}</span>
            </div>
          ))}
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