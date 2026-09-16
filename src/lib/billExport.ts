import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function createBillPdf(element: HTMLElement) {
  const renderHost = document.createElement("div");
  renderHost.className = "bill-pdf-renderer";
  const clone = element.cloneNode(true) as HTMLElement;
  renderHost.appendChild(clone);
  document.body.appendChild(renderHost);

  try {
    // Give the DOM a tiny moment to ensure the cloned node is fully styled
    await new Promise((resolve) => setTimeout(resolve, 50));

    const canvas = await html2canvas(clone, {
      scale: 2,
      width: 794,
      height: 1123,
      windowWidth: 794,
      windowHeight: 1123,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
    });
    
    // Create exactly one A4 page
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Fit the canvas perfectly onto the 210x297mm A4 page
    // This completely eliminates multi-page blank issues and layout shifting.
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, pageWidth, pageHeight);

    return pdf;
  } finally {
    renderHost.remove();
  }
}

export async function downloadBillPdf(element: HTMLElement, filename: string) {
  const pdf = await createBillPdf(element);
  pdf.save(filename);
}