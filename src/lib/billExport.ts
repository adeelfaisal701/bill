import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function createBillPdf(element: HTMLElement) {
  const renderHost = document.createElement("div");
  renderHost.className = "bill-pdf-renderer";
  renderHost.appendChild(element.cloneNode(true));
  document.body.appendChild(renderHost);

  try {
    const canvas = await html2canvas(renderHost, {
      scale: 2,
      width: 794,
      windowWidth: 1024,
      backgroundColor: "#ffffff",
      useCORS: true,
    });
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageCanvasHeight = Math.floor(canvas.width * (pageHeight / pageWidth));

    for (let offset = 0; offset < canvas.height; offset += pageCanvasHeight) {
      if (offset > 0) pdf.addPage();
      const sliceHeight = Math.min(pageCanvasHeight, canvas.height - offset);
      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = sliceHeight;
      slice.getContext("2d")?.drawImage(
        canvas,
        0,
        offset,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight,
      );
      pdf.addImage(slice.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, pageWidth, sliceHeight * (pageWidth / canvas.width));
    }

    return pdf;
  } finally {
    renderHost.remove();
  }
}

export async function downloadBillPdf(element: HTMLElement, filename: string) {
  const pdf = await createBillPdf(element);
  pdf.save(filename);
}