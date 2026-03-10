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

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = pdfWidth / imgWidth;
    const totalPdfHeight = imgHeight * ratio;

    let heightLeft = totalPdfHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, totalPdfHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, totalPdfHeight);
      heightLeft -= pdfHeight;
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
