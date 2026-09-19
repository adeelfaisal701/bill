import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const BILL_WIDTH = 794;
const BILL_HEIGHT = 1123;
const A4_PAGE_WIDTH_MM = 210;
const A4_PAGE_HEIGHT_MM = 297;

async function waitForFonts() {
  if (typeof document === "undefined" || !("fonts" in document)) {
    return;
  }

  const fonts = document.fonts as FontFaceSet | undefined;
  if (fonts && "ready" in fonts) {
    await fonts.ready;
  }
}

function parseBackgroundUrls(value: string) {
  const matches = value.match(/url\((['"]?)(.*?)\1\)/gi) ?? [];

  return matches
    .map((match) => {
      const result = match.match(/url\((['"]?)(.*?)\1\)$/i);
      return result?.[2] ?? "";
    })
    .filter(Boolean);
}

async function waitForImages(element: HTMLElement) {
  const imageUrls = new Set<string>();

  const collectBackgrounds = (node: Element) => {
    const styles = window.getComputedStyle(node);
    for (const background of [styles.backgroundImage]) {
      if (!background || background === "none") continue;
      for (const url of parseBackgroundUrls(background)) {
        if (url.startsWith("data:")) continue;
        imageUrls.add(url);
      }
    }

    for (const child of Array.from(node.children)) {
      collectBackgrounds(child);
    }
  };

  collectBackgrounds(element);

  const imageNodes = Array.from(element.querySelectorAll("img, source, video")) as Array<HTMLImageElement | HTMLSourceElement | HTMLVideoElement>;

  const imageLoads = imageNodes.map((node) => {
    const image = node as HTMLImageElement;
    if (image.complete) return Promise.resolve();

    return new Promise<void>((resolve) => {
      const done = () => resolve();
      image.onload = done;
      image.onerror = done;
    });
  });

  const backgroundLoads = Array.from(imageUrls).map(
    (src) =>
      new Promise<void>((resolve) => {
        const image = new Image();
        image.onload = () => resolve();
        image.onerror = () => resolve();
        image.src = src;
      }),
  );

  await Promise.all([...imageLoads, ...backgroundLoads]);
}

async function lockBillToPreviewDimensions(element: HTMLElement) {
  const previous = {
    position: element.style.position,
    width: element.style.width,
    height: element.style.height,
    minWidth: element.style.minWidth,
    minHeight: element.style.minHeight,
    maxWidth: element.style.maxWidth,
    maxHeight: element.style.maxHeight,
    overflow: element.style.overflow,
    transform: element.style.transform,
    transition: element.style.transition,
    animation: element.style.animation,
  };

  element.style.position = "relative";
  element.style.width = `${BILL_WIDTH}px`;
  element.style.height = `${BILL_HEIGHT}px`;
  element.style.minWidth = `${BILL_WIDTH}px`;
  element.style.minHeight = `${BILL_HEIGHT}px`;
  element.style.maxWidth = `${BILL_WIDTH}px`;
  element.style.maxHeight = `${BILL_HEIGHT}px`;
  element.style.overflow = "visible";
  element.style.transform = "none";
  element.style.transition = "none";
  element.style.animation = "none";

  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));

  return previous;
}

function restoreBillDimensions(element: HTMLElement, previous: Record<string, string>) {
  element.style.position = previous.position;
  element.style.width = previous.width;
  element.style.height = previous.height;
  element.style.minWidth = previous.minWidth;
  element.style.minHeight = previous.minHeight;
  element.style.maxWidth = previous.maxWidth;
  element.style.maxHeight = previous.maxHeight;
  element.style.overflow = previous.overflow;
  element.style.transform = previous.transform;
  element.style.transition = previous.transition;
  element.style.animation = previous.animation;
}

type ExportTextOverlayOptions = {
  verticalOffset?: number;
  centerVertically?: boolean;
};

function createExportTextOverlay(
  sourceField: HTMLElement,
  billRect: DOMRect,
  options: ExportTextOverlayOptions = {},
) {
  const style = window.getComputedStyle(sourceField);
  const rect = sourceField.getBoundingClientRect();
  const fontPx = parseFloat(style.fontSize) || 14;
  const effectiveLineHeight = parseFloat(style.lineHeight) || fontPx;
  const verticalOffset = options.verticalOffset ?? 0;

  const overlay = document.createElement("div");
  overlay.textContent = sourceField.textContent;
  overlay.style.position = "absolute";
  overlay.style.left = `${rect.left - billRect.left}px`;
  overlay.style.top = `${rect.top - billRect.top + verticalOffset}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
  overlay.style.fontFamily = style.fontFamily;
  overlay.style.fontSize = style.fontSize;
  overlay.style.fontWeight = style.fontWeight;
  overlay.style.fontStyle = style.fontStyle;
  overlay.style.color = style.color;
  overlay.style.letterSpacing = style.letterSpacing;
  overlay.style.lineHeight = `${effectiveLineHeight}px`;
  overlay.style.textAlign = style.textAlign || "left";
  overlay.style.whiteSpace = "nowrap";
  overlay.style.overflow = "visible";
  overlay.style.textOverflow = "clip";
  overlay.style.padding = "0";
  overlay.style.margin = "0";
  overlay.style.boxSizing = "border-box";
  overlay.style.display = options.centerVertically ? "flex" : "block";
  overlay.style.zIndex = style.zIndex;
  overlay.style.transform = "none";
  overlay.style.transformOrigin = "0 0";
  overlay.style.verticalAlign = "baseline";
  overlay.style.pointerEvents = "none";
  overlay.style.opacity = style.opacity;

  if (options.centerVertically) {
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
  }

  const justify = style.justifyContent;
  if (justify && justify !== "normal") {
    overlay.style.textAlign = justify === "center" ? "center" : "left";
  }

  return overlay;
}

function isAlGhaniSheet(element: HTMLElement) {
  return element.getAttribute("aria-label") === "AL-GHANI TRADERS bill invoice";
}

function createAlGhaniExportOverlay(
  sourceField: HTMLElement,
  billRect: DOMRect,
  index: number,
) {
  const style = window.getComputedStyle(sourceField);
  const rect = sourceField.getBoundingClientRect();
  const fontPx = parseFloat(style.fontSize) || 14;
  const lineHeight = parseFloat(style.lineHeight) || fontPx;

  if (index === 5) {
    return createExportTextOverlay(sourceField, billRect, {
      verticalOffset: 0,
      centerVertically: true,
    });
  }

  const paddingBottom = parseFloat(style.paddingBottom) || 0;
  return createExportTextOverlay(sourceField, billRect, {
    verticalOffset: rect.height - paddingBottom - lineHeight,
  });
}

function makeExportTextDeterministic(element: HTMLElement) {
  const billRect = element.getBoundingClientRect();
  const sourceFields = Array.from(element.querySelectorAll(".reference-field")) as HTMLElement[];

  sourceFields.forEach((sourceField) => {
    const replacement = createExportTextOverlay(sourceField, billRect);
    sourceField.replaceWith(replacement);
  });
}

function logExportError(step: string, error: unknown) {
  const details = error instanceof Error
    ? { message: error.message, stack: error.stack }
    : { message: String(error), stack: undefined };
  console.error(`[billExport] ${step} failed`, details, error);
}

function computePdfImageDimensions() {
  const billRatio = BILL_WIDTH / BILL_HEIGHT;
  const pageRatio = A4_PAGE_WIDTH_MM / A4_PAGE_HEIGHT_MM;

  let widthMm = A4_PAGE_WIDTH_MM;
  let heightMm = A4_PAGE_HEIGHT_MM;

  if (billRatio > pageRatio) {
    widthMm = A4_PAGE_WIDTH_MM;
    heightMm = widthMm / billRatio;
  } else {
    heightMm = A4_PAGE_HEIGHT_MM;
    widthMm = heightMm * billRatio;
  }

  return { widthMm, heightMm };
}

export async function createBillPdf(element: HTMLElement) {
  let step = "read source dimensions";
  try {
    const originalWidth = element.offsetWidth || BILL_WIDTH;
    const originalHeight = element.offsetHeight || BILL_HEIGHT;
    step = "lock preview dimensions";
    const previous = await lockBillToPreviewDimensions(element);
    let captureSource: HTMLElement | null = null;

    try {
      step = "clone bill element";
      captureSource = element.cloneNode(true) as HTMLElement;
      captureSource.style.position = "fixed";
      captureSource.style.left = "0";
      captureSource.style.top = "0";
      captureSource.style.zIndex = "-1";
      captureSource.style.pointerEvents = "none";
      document.body.appendChild(captureSource);
      await new Promise((resolve) => setTimeout(resolve, 0));
      step = "query cloned reference fields";
      const sourceFields = Array.from(captureSource.querySelectorAll(".reference-field")) as HTMLElement[];
      const captureRect = captureSource.getBoundingClientRect();
      step = `replace ${sourceFields.length} cloned reference fields`;
      const alGhani = isAlGhaniSheet(captureSource);
      sourceFields.forEach((field, index) => {
        const replacement = alGhani
          ? createAlGhaniExportOverlay(field, captureRect, index)
          : createExportTextOverlay(field, captureRect);
        field.replaceWith(replacement);
      });

      step = "wait for fonts";
      await waitForFonts();
      step = "wait for images";
      await waitForImages(captureSource);

      step = "render canvas with html2canvas";
      const canvas = await html2canvas(captureSource, {
        backgroundColor: "#ffffff",
        useCORS: true,
        scale: 2,
        width: originalWidth || BILL_WIDTH,
        height: originalHeight || BILL_HEIGHT,
        windowWidth: originalWidth || BILL_WIDTH,
        windowHeight: originalHeight || BILL_HEIGHT,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        imageTimeout: 15000,
        ignoreElements: (node) => {
          if (!(node instanceof HTMLElement)) return false;
          return node.classList.contains("no-print");
        },
      });

      step = "create jsPDF document";
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const { widthMm, heightMm } = computePdfImageDimensions();

      step = "convert canvas to JPEG data URL";
      const imageData = canvas.toDataURL("image/jpeg", 0.96);
      step = "add image to PDF";
      pdf.addImage(imageData, "JPEG", 0, 0, widthMm, heightMm, undefined, "FAST");
      return pdf;
    } finally {
      step = "restore preview dimensions";
      restoreBillDimensions(element, previous);
      captureSource?.remove();
    }
  } catch (error) {
    logExportError(step, error);
    throw error;
  }
}

export async function downloadBillPdf(element: HTMLElement, filename: string) {
  let step = "create PDF";
  try {
    const pdf = await createBillPdf(element);
    step = "save PDF with jsPDF";
    pdf.save(filename);
  } catch (error) {
    logExportError(step, error);
    throw error;
  }
}