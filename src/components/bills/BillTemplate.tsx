import { useLayoutEffect, useRef, useState } from "react";
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

type ReferenceColumn = { left: string; width: string };

type ReferenceConfig = {
  tableStart: number;
  rowHeight: number;
  summaryBottomTop: number;
  summaryGap: number;
  total: { top: string };
  cols: {
    sr?: ReferenceColumn;
    detail: ReferenceColumn;
    qty: ReferenceColumn;
    rate: ReferenceColumn;
    amount: ReferenceColumn;
  };
};

const REFERENCE_PAGE_HEIGHT = 1123;

function useReferenceRowLayout(
  rows: Bill["items"],
  cfg: ReferenceConfig,
) {
  const detailRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [rowHeights, setRowHeights] = useState<number[]>([]);

  useLayoutEffect(() => {
    const measureRows = () => {
      const nextHeights = rows.map((_, index) => {
        const minimumHeight = (cfg.rowHeight / 100) * REFERENCE_PAGE_HEIGHT;
        const detail = detailRefs.current[index];
        return Math.max(minimumHeight, detail?.scrollHeight ?? minimumHeight);
      });

      setRowHeights((current) =>
        current.length === nextHeights.length && current.every((height, index) => height === nextHeights[index])
          ? current
          : nextHeights,
      );
    };

    measureRows();
    const observers = detailRefs.current.map((detail) => {
      if (!detail) return null;
      const observer = new ResizeObserver(measureRows);
      observer.observe(detail);
      return observer;
    });

    return () => observers.forEach((observer) => observer?.disconnect());
  }, [cfg, rows]);

  const heights = rows.map((_, index) => rowHeights[index] ?? (cfg.rowHeight / 100) * REFERENCE_PAGE_HEIGHT);
  const itemsEnd = (cfg.tableStart / 100) * REFERENCE_PAGE_HEIGHT + heights.reduce((sum, height) => sum + height, 0);
  const summaryStart = (cfg.summaryBottomTop / 100) * REFERENCE_PAGE_HEIGHT;
  const shift = Math.max(0, itemsEnd - summaryStart);

  return { detailRefs, heights, shift };
}

function ReferenceItems({
  rows,
  cfg,
  color,
  includeSerial,
  taxAmount,
  discountAmount,
  totalAmount,
  remarks,
  remarksStyle,
  footerFields,
}: {
  rows: Bill["items"];
  cfg: ReferenceConfig;
  color: string;
  includeSerial: boolean;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  remarks?: string;
  remarksStyle?: React.CSSProperties;
  footerFields?: (shift: number) => React.ReactNode;
}) {
  const layout = useReferenceRowLayout(rows, cfg);
  const baseTop = (cfg.tableStart / 100) * REFERENCE_PAGE_HEIGHT;
  const totalTop = parseFloat(cfg.total.top) + (layout.shift / REFERENCE_PAGE_HEIGHT) * 100;
  const hasTax = !!taxAmount;
  const hasDiscount = !!discountAmount;
  const taxTop = cfg.summaryBottomTop - (hasTax && hasDiscount ? cfg.summaryGap : 0) + (layout.shift / REFERENCE_PAGE_HEIGHT) * 100;
  const discountTop = cfg.summaryBottomTop + (layout.shift / REFERENCE_PAGE_HEIGHT) * 100;

  return (
    <>
      <div className="reference-items">
        {rows.map((item, index) => {
          const hasItem = !!item.productNameSnapshot;
          const top = baseTop + layout.heights.slice(0, index).reduce((sum, height) => sum + height, 0);
          return (
            <div
              className="reference-row"
              key={item.id || index}
              style={{ top: `${top}px`, height: `${layout.heights[index]}px`, color, fontSize: "12px", fontWeight: "600" }}
            >
              {includeSerial && <span className="reference-cell" style={{ left: cfg.cols.sr!.left, width: cfg.cols.sr!.width }}>{hasItem ? index + 1 : ""}</span>}
              <div
                ref={(element) => { layout.detailRefs.current[index] = element; }}
                className="reference-cell reference-cell-left"
                style={{
                  left: cfg.cols.detail.left,
                  width: cfg.cols.detail.width,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  whiteSpace: "normal",
                  wordWrap: "break-word",
                  lineHeight: "1.3",
                  fontSize: "13.5px",
                }}
              >
                {item.productNameSnapshot}
              </div>
              <span className="reference-cell" style={{ left: cfg.cols.qty.left, width: cfg.cols.qty.width }}>{hasItem && item.quantity ? item.quantity : ""}</span>
              <span className="reference-cell" style={{ left: cfg.cols.rate.left, width: cfg.cols.rate.width }}>{hasItem && item.rate ? money(item.rate) : ""}</span>
              <span className="reference-cell" style={{ left: cfg.cols.amount.left, width: cfg.cols.amount.width }}>{hasItem && item.amount ? money(item.amount) : ""}</span>
            </div>
          );
        })}

        {hasTax && (
          <div className="reference-row" style={{ top: `${taxTop}%`, height: `${cfg.summaryGap}%`, color: "#111", fontSize: "12px", fontWeight: "700" }}>
            <span className="reference-cell reference-cell-left" style={{ left: cfg.cols.rate.left, width: cfg.cols.rate.width, display: "flex", alignItems: "center", justifyContent: "flex-start", paddingLeft: "10px" }}>Tax</span>
            <span className="reference-cell" style={{ left: cfg.cols.amount.left, width: cfg.cols.amount.width }}>Rs. {money(taxAmount!)}</span>
          </div>
        )}

        {hasDiscount && (
          <div className="reference-row" style={{ top: `${discountTop}%`, height: `${cfg.summaryGap}%`, color: "#111", fontSize: "12px", fontWeight: "700" }}>
            <span className="reference-cell reference-cell-left" style={{ left: cfg.cols.rate.left, width: cfg.cols.rate.width, display: "flex", alignItems: "center", justifyContent: "flex-start", paddingLeft: "10px" }}>Discount</span>
            <span className="reference-cell" style={{ left: cfg.cols.amount.left, width: cfg.cols.amount.width }}>Rs. {money(discountAmount!)}</span>
          </div>
        )}
      </div>

      <div className="reference-field" style={{ ...cfg.total, top: `${totalTop}%`, justifyContent: "center" }}>{money(totalAmount)}</div>
      {remarksStyle && <div className="reference-field" style={{ ...remarksStyle, top: `${parseFloat(String(remarksStyle.top)) + (layout.shift / REFERENCE_PAGE_HEIGHT) * 100}%`, justifyContent: "center" }}>{remarks}</div>}
      {footerFields?.(layout.shift)}
    </>
  );
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
  total: { left: "76%", top: "76.5%", width: "18.5%", height: "3.5%", color: "#ffffff", fontSize: "22px", fontWeight: "800", alignItems: "center" },
  remarks: { left: "52%", top: "80.6%", width: "13%", height: "2.5%", color: "#0d3b36", fontSize: "10px", fontWeight: "400", alignItems: "center" },
  tableStart: 45.5,
  rowHeight: 4.4,
  summaryBottomTop: 71.5,
  summaryGap: 2.5,
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
  const cfg = alGhaniConfig;
  
  const hasTax = !!bill.taxAmount;
  const hasDiscount = !!bill.discountAmount;
  
  let taxTop = 0;
  let discountTop = 0;
  
  if (hasTax && hasDiscount) {
    taxTop = cfg.summaryBottomTop - cfg.summaryGap;
    discountTop = cfg.summaryBottomTop;
  } else if (hasTax) {
    taxTop = cfg.summaryBottomTop;
  } else if (hasDiscount) {
    discountTop = cfg.summaryBottomTop;
  }
  
  const spaceLimitTop = hasTax || hasDiscount ? (hasTax && hasDiscount ? taxTop : cfg.summaryBottomTop) : parseFloat(cfg.total.top);
  const maxRows = Math.floor((spaceLimitTop - cfg.tableStart) / cfg.rowHeight);
  
  const rows = (bill.items ?? [])
    .filter((item) => item && (safeText(item.productNameSnapshot) || !!item.productId || item.quantity > 0 || item.rate > 0))
    .slice(0, maxRows);

  return (
    <article className="bill-sheet reference-sheet" aria-label="AL-GHANI TRADERS bill invoice">
      <div className="reference-page" style={{ backgroundImage: 'url("/Al Ghani.jpeg")', backgroundSize: '100% 100%', backgroundPosition: 'center top', backgroundRepeat: 'no-repeat' }} aria-hidden="true"></div>
      <div className="reference-overlay">
        <div className="reference-field" style={{ ...cfg.customer }}>{lineOne}</div>
        <div className="reference-field" style={{ ...cfg.place }}>{lineTwo}</div>
        <div className="reference-field" style={{ ...cfg.phone }}>{lineThree}</div>
        <div className="reference-field" style={{ ...cfg.billNo, justifyContent: "center" }}>{billNumber}</div>
        <div className="reference-field" style={{ ...cfg.date, justifyContent: "center" }}>{billDateValue}</div>

        <ReferenceItems
          rows={rows}
          cfg={cfg}
          color="#0d3b36"
          includeSerial
          taxAmount={bill.taxAmount}
          discountAmount={bill.discountAmount}
          totalAmount={bill.totalAmount}
          remarks={remarks}
          remarksStyle={cfg.remarks}
        />
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
  total: { left: "81%", top: "79.5%", width: "16%", height: "3.5%", color: "#111", fontSize: "20px", fontWeight: "800", alignItems: "center" },
  remarks: { left: "54%", top: "80.6%", width: "11%", height: "2.5%", color: "#0d3b36", fontSize: "10px", fontWeight: "400", alignItems: "center" },
  tableStart: 47,
  rowHeight: 4.6,
  summaryBottomTop: 74.5,
  summaryGap: 2.5,
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
  const cfg = shareefConfig;
  
  const hasTax = !!bill.taxAmount;
  const hasDiscount = !!bill.discountAmount;
  
  let taxTop = 0;
  let discountTop = 0;
  
  if (hasTax && hasDiscount) {
    taxTop = cfg.summaryBottomTop - cfg.summaryGap;
    discountTop = cfg.summaryBottomTop;
  } else if (hasTax) {
    taxTop = cfg.summaryBottomTop;
  } else if (hasDiscount) {
    discountTop = cfg.summaryBottomTop;
  }
  
  const spaceLimitTop = hasTax || hasDiscount ? (hasTax && hasDiscount ? taxTop : cfg.summaryBottomTop) : parseFloat(cfg.total.top);
  const maxRows = Math.floor((spaceLimitTop - cfg.tableStart) / cfg.rowHeight);
  
  const rows = (bill.items ?? [])
    .filter((item) => item && (safeText(item.productNameSnapshot) || !!item.productId || item.quantity > 0 || item.rate > 0))
    .slice(0, maxRows);

  return (
    <article className="bill-sheet reference-sheet" aria-label="SHAREEF TRADERS bill invoice">
      <div className="reference-page" style={{ backgroundImage: 'url("/Al Shareef.jpeg")', backgroundSize: '100% 100%', backgroundPosition: 'center top', backgroundRepeat: 'no-repeat' }} aria-hidden="true"></div>
      <div className="reference-overlay">
        <div className="reference-field" style={{ ...cfg.customer }}>{lineOne}</div>
        <div className="reference-field" style={{ ...cfg.place }}>{lineTwo}</div>
        <div className="reference-field" style={{ ...cfg.phone }}>{lineThree}</div>
        <div className="reference-field" style={{ ...cfg.billNo, justifyContent: "center" }}>{billNumber}</div>
        <div className="reference-field" style={{ ...cfg.date, justifyContent: "center" }}>{billDateValue}</div>

        <ReferenceItems
          rows={rows}
          cfg={cfg}
          color="#0d3b36"
          includeSerial
          taxAmount={bill.taxAmount}
          discountAmount={bill.discountAmount}
          totalAmount={bill.totalAmount}
          remarks={remarks}
          remarksStyle={cfg.remarks}
        />
      </div>
    </article>
  );
}

// ============================================================================
// KING ENTERPRISE CONFIGURATION
// ============================================================================
const kingConfig = {
  billNo: { left: "11.5%", top: "34.8%", width: "43%", height: "3%", color: "#111", fontSize: "14px", fontWeight: "700" },
  date: { left: "72.5%", top: "37.2%", width: "25%", height: "3%", color: "#111", fontSize: "14px", fontWeight: "700" },
  customer: { left: "11.5%", top: "37.2%", width: "51%", height: "3%", color: "#111", fontSize: "14px", fontWeight: "700" },
  address: { left: "11.5%", top: "84.0%", width: "37%", height: "3.2%", color: "#fff", fontSize: "14px", fontWeight: "600" },
  phone: { left: "11.5%", top: "88.5%", width: "37%", height: "3.2%", color: "#fff", fontSize: "18px", fontWeight: "700" },
  total: { left: "65.5%", top: "86.8%", width: "30.5%", height: "4.5%", color: "#111", fontSize: "20px", fontWeight: "800", alignItems: "center" },
  tableStart: 44.1,
  rowHeight: 3.55,
  summaryBottomTop: 81.3,
  summaryGap: 2.5,
  cols: {
    sr: { left: "2.5%", width: "9.5%" },
    detail: { left: "12%", width: "38%", isLeft: true },
    qty: { left: "50%", width: "14.5%" },
    rate: { left: "64.5%", width: "16.5%" },
    amount: { left: "81%", width: "16.5%" }
  }
};

function KingEnterpriseBillRenderer({ bill }: BillTemplateProps) {
  const lineOne = safeText(bill.partyName);
  const address = safeText(bill.partyAddress);
  const phone = safeText(bill.partyPhone);
  const billNumber = safeText(bill.billNumber) || String(bill.serialNumber || "");
  const billDateValue = bill.date ? billDate(bill.date) : "";
  const cfg = kingConfig;
  
  const hasTax = !!bill.taxAmount;
  const hasDiscount = !!bill.discountAmount;
  
  let taxTop = 0;
  let discountTop = 0;
  
  if (hasTax && hasDiscount) {
    taxTop = cfg.summaryBottomTop - cfg.summaryGap;
    discountTop = cfg.summaryBottomTop;
  } else if (hasTax) {
    taxTop = cfg.summaryBottomTop;
  } else if (hasDiscount) {
    discountTop = cfg.summaryBottomTop;
  }
  
  const spaceLimitTop = hasTax || hasDiscount ? (hasTax && hasDiscount ? taxTop : cfg.summaryBottomTop) : parseFloat(cfg.total.top);
  const maxRows = Math.floor((spaceLimitTop - cfg.tableStart) / cfg.rowHeight);
  
  const rows = (bill.items ?? [])
    .filter((item) => item && (safeText(item.productNameSnapshot) || !!item.productId || item.quantity > 0 || item.rate > 0))
    .slice(0, maxRows);

  return (
    <article className="bill-sheet reference-sheet" aria-label="KING ENTERPRISE bill invoice">
      <div className="reference-page" style={{ backgroundImage: 'url("/king enterprise.jpeg")', backgroundSize: '100% 100%', backgroundPosition: 'center top', backgroundRepeat: 'no-repeat' }} aria-hidden="true"></div>
      <div className="reference-overlay">
        <div className="reference-field" style={{ ...cfg.customer, alignItems: "center", padding: 0 }}>{lineOne}</div>
        <div className="reference-field" style={{ ...cfg.billNo, alignItems: "center", padding: 0 }}>{billNumber}</div>
        <div className="reference-field" style={{ ...cfg.date, alignItems: "center", padding: 0 }}>{billDateValue}</div>

        <ReferenceItems
          rows={rows}
          cfg={cfg}
          color="#111"
          includeSerial
          taxAmount={bill.taxAmount}
          discountAmount={bill.discountAmount}
          totalAmount={bill.totalAmount}
          footerFields={(shift) => (
            <>
              <div className="reference-field" style={{ ...cfg.address, top: `calc(${cfg.address.top} + ${shift}px)`, alignItems: "center", padding: 0 }}>{address}</div>
              <div className="reference-field" style={{ ...cfg.phone, top: `calc(${cfg.phone.top} + ${shift}px)`, alignItems: "center", padding: 0 }}>{phone}</div>
            </>
          )}
        />
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