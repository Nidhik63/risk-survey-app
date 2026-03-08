import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportReportToPDF(
  elementId: string,
  filename: string = "risk-survey-report.pdf"
) {
  const element = document.getElementById(elementId);
  if (!element) throw new Error("Report element not found");

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = pdfWidth / imgWidth;
  const totalPdfHeight = imgHeight * ratio;

  let heightLeft = totalPdfHeight;
  let position = 0;

  // First page
  pdf.addImage(imgData, "PNG", 0, position, pdfWidth, totalPdfHeight);
  heightLeft -= pdfHeight;

  // Additional pages
  while (heightLeft > 0) {
    position -= pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, totalPdfHeight);
    heightLeft -= pdfHeight;
  }

  pdf.save(filename);
}
