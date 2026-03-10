import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportReportToPDF(
  elementId: string,
  filename: string = "risk-survey-report.pdf"
): Promise<boolean> {
  try {
    const element = document.getElementById(elementId);
    if (!element) throw new Error("Report element not found");

    // Wait for all images to fully load before capture
    const images = element.querySelectorAll("img");
    await Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete && img.naturalHeight > 0) return resolve();
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
      )
    );

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#f8fafc",
      windowWidth: 1024,
      imageTimeout: 30000,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();   // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight();  // 297mm
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = pdfWidth / imgWidth;
    const totalPdfHeight = imgHeight * ratio;

    // Margins for pages 2+ (cover page gets full bleed)
    const marginTop = 12;    // mm
    const marginBottom = 10; // mm
    const contentHeight = pdfHeight - marginTop - marginBottom; // usable per page

    // Calculate total page count for "Page X of Y"
    const remaining = Math.max(0, totalPdfHeight - pdfHeight);
    const totalPages = 1 + (remaining > 0 ? Math.ceil(remaining / contentHeight) : 0);

    // --- Page 1: Cover page (full bleed, no margins) ---
    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, totalPdfHeight);

    let heightLeft = totalPdfHeight - pdfHeight;
    let currentY = pdfHeight; // tracks position in the image
    let pageNum = 1;

    // --- Pages 2+: With margins, header line, and page numbers ---
    while (heightLeft > 0) {
      pdf.addPage();
      pageNum++;

      // Place the image so content at currentY appears at marginTop
      const yPos = marginTop - currentY;
      pdf.addImage(imgData, "JPEG", 0, yPos, pdfWidth, totalPdfHeight);

      // White-out bars to create clean margins
      pdf.setFillColor(248, 250, 252); // #f8fafc — matches report background
      pdf.rect(0, 0, pdfWidth, marginTop, "F");           // top margin
      pdf.rect(0, pdfHeight - marginBottom, pdfWidth, marginBottom, "F"); // bottom margin

      // Top accent line (NTRU purple)
      pdf.setDrawColor(93, 45, 142);
      pdf.setLineWidth(0.4);
      pdf.line(10, 3, pdfWidth - 10, 3);

      // Header text: "NTRU | Confidential" on left, page number on right
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(156, 163, 175); // gray-400
      pdf.text("NTRU  \u00B7  Confidential", 10, 7.5);
      pdf.text(`Page ${pageNum} of ${totalPages}`, pdfWidth - 10, 7.5, { align: "right" });

      // Bottom: subtle page number centered
      pdf.setFontSize(6.5);
      pdf.setTextColor(180, 180, 180);
      pdf.text(`\u2014 ${pageNum} \u2014`, pdfWidth / 2, pdfHeight - 4, { align: "center" });

      currentY += contentHeight;
      heightLeft -= contentHeight;
    }

    // On mobile, try blob URL approach for better compatibility
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 1000);
    } else {
      pdf.save(filename);
    }

    return true;
  } catch (err) {
    console.error("PDF export failed:", err);
    return false;
  }
}

export function printReport() {
  window.print();
}

export async function shareReport(
  title: string,
  text: string
): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url: window.location.href });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
