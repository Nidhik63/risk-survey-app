import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  ShadingType,
  PageBreak,
  Header,
  Footer,
  TabStopType,
  TabStopPosition,
  TableLayoutType,
  VerticalAlign,
} from "docx";
import { saveAs } from "file-saver";
import type { SurveyDataV2, TaggedPhoto } from "./survey-types";

const PURPLE = "3D1556";
const GRAY = "64748B";
const GRAY_LIGHT = "F1F5F9";
const WHITE = "FFFFFF";

// Page width in DXA (twips) for A4 with 1-inch margins ≈ 9026
const PAGE_WIDTH = 9026;

const TABLE_BORDERS = {
  top: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
  left: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
  right: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
  insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
};

/** Convert a data-URL (data:image/…;base64,…) to a Uint8Array for ImageRun */
function dataUrlToUint8(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] || "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Build paragraphs for a single photo: image + caption */
function photoBlock(photo: TaggedPhoto): Paragraph[] {
  const items: Paragraph[] = [];
  try {
    const imageData = dataUrlToUint8(photo.dataUrl);
    items.push(
      new Paragraph({
        spacing: { before: 200, after: 80 },
        children: [
          new ImageRun({
            data: imageData,
            transformation: { width: 450, height: 300 },
            type: "jpg",
          }),
        ],
      })
    );
  } catch {
    items.push(
      new Paragraph({
        spacing: { before: 200, after: 80 },
        children: [new TextRun({ text: "[Photo could not be embedded]", italics: true, color: GRAY, size: 18, font: "Calibri" })],
      })
    );
  }
  if (photo.caption) {
    items.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({ text: photo.caption, size: 18, font: "Calibri", color: GRAY, italics: true }),
        ],
      })
    );
  }
  return items;
}

function headerCell(text: string, widthDxa: number): TableCell {
  return new TableCell({
    width: { size: widthDxa, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    shading: { type: ShadingType.SOLID, color: PURPLE, fill: PURPLE },
    children: [
      new Paragraph({
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text, bold: true, color: WHITE, size: 18, font: "Calibri" })],
      }),
    ],
  });
}

function bodyCell(text: string, widthDxa: number): TableCell {
  return new TableCell({
    width: { size: widthDxa, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        spacing: { before: 30, after: 30 },
        children: [new TextRun({ text: text || "—", size: 18, font: "Calibri", color: "0F172A" })],
      }),
    ],
  });
}

function labelCell(text: string, widthDxa: number): TableCell {
  return new TableCell({
    width: { size: widthDxa, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    shading: { type: ShadingType.SOLID, color: GRAY_LIGHT, fill: GRAY_LIGHT },
    children: [
      new Paragraph({
        spacing: { before: 30, after: 30 },
        children: [new TextRun({ text, bold: true, size: 18, font: "Calibri", color: GRAY })],
      }),
    ],
  });
}

const LABEL_W = Math.round(PAGE_WIDTH * 0.38);
const VALUE_W = PAGE_WIDTH - LABEL_W;

function sectionTable(fields: { label: string; value: string }[]): Table {
  return new Table({
    width: { size: PAGE_WIDTH, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths: [LABEL_W, VALUE_W],
    borders: TABLE_BORDERS,
    rows: fields.map(
      (f) =>
        new TableRow({
          children: [labelCell(f.label, LABEL_W), bodyCell(f.value, VALUE_W)],
        })
    ),
  });
}

function sectionHeading(title: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 400, after: 200 },
    children: [new TextRun({ text: title, bold: true, size: 26, font: "Calibri", color: PURPLE })],
  });
}

const COVER_LABEL_W = Math.round(PAGE_WIDTH * 0.32);
const COVER_VALUE_W = PAGE_WIDTH - COVER_LABEL_W;

export async function exportSurveyToDocx(
  surveyData: SurveyDataV2,
  reportRef: string,
  filename: string
) {
  const a = surveyData.sectionA;
  const b = surveyData.sectionB;
  const c = surveyData.sectionC;
  const d = surveyData.sectionD;
  const e = surveyData.sectionE;

  const coverTable = new Table({
    width: { size: PAGE_WIDTH, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths: [COVER_LABEL_W, COVER_VALUE_W],
    borders: TABLE_BORDERS,
    rows: [
      new TableRow({ children: [headerCell("Field", COVER_LABEL_W), headerCell("Details", COVER_VALUE_W)] }),
      new TableRow({ children: [labelCell("Insured Name", COVER_LABEL_W), bodyCell(a.insuredName, COVER_VALUE_W)] }),
      new TableRow({ children: [labelCell("Address", COVER_LABEL_W), bodyCell(a.address, COVER_VALUE_W)] }),
      new TableRow({ children: [labelCell("Date of Survey", COVER_LABEL_W), bodyCell(a.dateOfSurvey, COVER_VALUE_W)] }),
      new TableRow({ children: [labelCell("Surveyor", COVER_LABEL_W), bodyCell(a.surveyorName, COVER_VALUE_W)] }),
      new TableRow({ children: [labelCell("Reference", COVER_LABEL_W), bodyCell(reportRef, COVER_VALUE_W)] }),
      new TableRow({ children: [labelCell("Photos", COVER_LABEL_W), bodyCell(`${surveyData.photos.length} photos uploaded`, COVER_VALUE_W)] }),
    ],
  });

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 20 } },
      },
    },
    sections: [
      // ═══ Cover Page ═══
      {
        properties: {},
        children: [
          new Paragraph({ spacing: { before: 600 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [new TextRun({ text: "NTRU", bold: true, size: 48, font: "Calibri", color: PURPLE })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [new TextRun({ text: "NewTech Reinsurance & Underwriting Limited", size: 20, font: "Calibri", color: GRAY })],
          }),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [new TextRun({ text: "PROPERTY SURVEY DATA", bold: true, size: 36, font: "Calibri", color: PURPLE })],
          }),
          coverTable,
          new Paragraph({ children: [new PageBreak()] }),
        ],
      },
      // ═══ Report Body ═══
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: `NTRU · ${reportRef}`, size: 14, font: "Calibri", color: GRAY })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                children: [
                  new TextRun({ text: "NTRU Property Survey Data", size: 14, font: "Calibri", color: GRAY }),
                  new TextRun({ text: "\t" }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Section A
          sectionHeading("Section A: General Information"),
          sectionTable([
            { label: "Insured Name", value: a.insuredName },
            { label: "Address", value: a.address },
            { label: "Contact Person", value: a.contactPerson },
            { label: "Contact Phone", value: a.contactPhone },
            { label: "Date of Survey", value: a.dateOfSurvey },
            { label: "Surveyor Name", value: a.surveyorName },
            { label: "Occupancy", value: a.occupancy },
            { label: "Occupancy (Other)", value: a.occupancyOther },
            { label: "Occupancy Details", value: a.occupancyDetails },
            { label: "Building Age", value: a.buildingAge },
            { label: "Plot Area (sqm)", value: a.plotArea },
            { label: "Constructed Area (sqm)", value: a.constructedArea },
            { label: "Number of Floors", value: a.numberOfFloors },
            { label: "Number of Basements", value: a.numberOfBasements },
            { label: "Surrounding Exposures", value: a.surroundingExposures },
            { label: "Latitude", value: a.latitude },
            { label: "Longitude", value: a.longitude },
            { label: "Flood Risk Level", value: a.floodRiskLevel },
            { label: "Flood Risk Details", value: a.floodRiskDetails },
          ]),

          // Section B
          new Paragraph({ children: [new PageBreak()] }),
          sectionHeading("Section B: Construction Details"),
          sectionTable([
            { label: "Structural Frame", value: b.structuralFrame },
            { label: "External Walls", value: b.externalWalls },
            { label: "Roof Structure", value: b.roofStructure },
            { label: "Roof Covering", value: b.roofCovering },
            { label: "Floor Type", value: b.floorType },
            { label: "Ceiling Type", value: b.ceilingType },
            { label: "Insulation Type", value: b.insulationType },
            { label: "Mezzanine Floors", value: b.mezzanineFloors },
            { label: "Building Condition", value: b.buildingCondition },
            { label: "Structural Concerns", value: b.structuralConcerns },
          ]),

          // Section C
          new Paragraph({ children: [new PageBreak()] }),
          sectionHeading("Section C: Fire Protection"),
          sectionTable([
            { label: "Fire Detection System", value: c.fireDetectionSystem },
            { label: "Detection Type", value: c.detectionType },
            { label: "Sprinkler System", value: c.sprinklerSystem },
            { label: "Sprinkler Type", value: c.sprinklerType },
            { label: "Sprinkler Coverage", value: c.sprinklerCoverage },
            { label: "Fire Extinguishers", value: c.fireExtinguishers },
            { label: "Extinguisher Types", value: c.extinguisherTypes },
            { label: "Fire Hose Reels", value: c.fireHoseReels },
            { label: "External Hydrants", value: c.externalHydrants },
            { label: "Fire Alarm Panel", value: c.fireAlarmPanel },
            { label: "Emergency Exits", value: c.emergencyExits },
            { label: "Fire Brigade", value: c.fireBrigade },
            { label: "Last Fire Drill Date", value: c.lastFireDrillDate },
            { label: "Hot Work Procedures", value: c.hotWorkProcedures },
          ]),

          // Section D
          new Paragraph({ children: [new PageBreak()] }),
          sectionHeading("Section D: EHS / Hazards"),
          sectionTable([
            { label: "Hazardous Storage", value: d.hazardousStorage },
            { label: "Hazardous Materials", value: d.hazardousMaterials },
            { label: "Storage Arrangement", value: d.storageArrangement },
            { label: "Electrical Installation", value: d.electricalInstallation },
            { label: "Electrical Maint. Date", value: d.electricalMaintDate },
            { label: "Lightning Protection", value: d.lightningProtection },
            { label: "Emergency Lighting", value: d.emergencyLighting },
            { label: "Smoking Policy", value: d.smokingPolicy },
            { label: "Flammable Liquid Storage", value: d.flammableLiquidStorage },
            { label: "LPG Storage", value: d.lpgStorage },
            { label: "Dust Hazard", value: d.dustHazard },
            { label: "Process Hazards", value: d.processHazards },
          ]),

          // Section E
          new Paragraph({ children: [new PageBreak()] }),
          sectionHeading("Section E: Housekeeping & Maintenance"),
          sectionTable([
            { label: "General Housekeeping", value: e.generalHousekeeping },
            { label: "Waste Management", value: e.wasteManagement },
            { label: "Maintenance Program", value: e.maintenanceProgram },
            { label: "Roof Maintenance", value: e.roofMaintenance },
            { label: "Electrical Maintenance", value: e.electricalMaintenance },
            { label: "Fire Safety Maintenance", value: e.fireSafetyMaintenance },
            { label: "Security Arrangements", value: e.securityArrangements },
            { label: "Perimeter Fencing", value: e.perimeterFencing },
            { label: "Access Control", value: e.accessControl },
            { label: "Flood Exposure", value: e.floodExposure },
            { label: "Natural Cat Exposure", value: e.naturalCatExposure },
            { label: "Business Continuity Plan", value: e.businessContinuityPlan },
          ]),

          // Photo Pages
          new Paragraph({ children: [new PageBreak()] }),
          sectionHeading("Site Photos"),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: `Total photos: ${surveyData.photos.length}`,
                size: 20,
                font: "Calibri",
              }),
            ],
          }),
          ...surveyData.photos.flatMap((photo) => photoBlock(photo)),

          // Disclaimer
          new Paragraph({ spacing: { before: 600 } }),
          new Paragraph({
            spacing: { after: 100 },
            shading: { type: ShadingType.SOLID, color: GRAY_LIGHT, fill: GRAY_LIGHT },
            children: [
              new TextRun({
                text: "This document contains raw survey data collected by the surveyor. It has not been analyzed or assessed. Risk scores, recommendations, and compliance evaluations are not included. For a complete Risk Inspection Report, this data must be submitted to the NTRU analyst team.",
                size: 16,
                font: "Calibri",
                color: GRAY,
                italics: true,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);

  // Embed the raw survey JSON inside the .docx (which is a ZIP)
  // so analysts can import the Word file directly.
  // We store it as a custom XML part with proper Content_Types declaration
  // to avoid Word "repair" warnings.
  try {
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(blob);

    // Compress photos for embedding (smaller than display versions)
    // to keep the .docx file size manageable for import
    const embeddableData: SurveyDataV2 = {
      ...surveyData,
      photos: await Promise.all(
        surveyData.photos.map(async (p) => ({
          ...p,
          dataUrl: await compressForEmbed(p.dataUrl),
        }))
      ),
    };

    // Add survey data as a custom XML part (Word ignores unknown parts gracefully)
    const surveyJson = JSON.stringify(embeddableData);
    zip.file("customXml/ntruSurveyData.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<ntruData>${encodeXml(surveyJson)}</ntruData>`);

    // Update [Content_Types].xml to declare the custom part
    const ctFile = zip.file("[Content_Types].xml");
    if (ctFile) {
      let ct = await ctFile.async("string");
      // Add Override for our custom XML before closing </Types>
      ct = ct.replace(
        "</Types>",
        `<Override PartName="/customXml/ntruSurveyData.xml" ContentType="application/xml"/></Types>`
      );
      zip.file("[Content_Types].xml", ct);
    }

    const finalBlob = await zip.generateAsync({ type: "blob", mimeType: blob.type });
    saveAs(finalBlob, filename);
  } catch {
    // Fallback: save without embedded data
    saveAs(blob, filename);
  }
}

/** Escape special XML characters */
function encodeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Compress a photo for embedding in the Word file (smaller for transfer) */
function compressForEmbed(dataUrl: string, maxW = 800, quality = 0.5): Promise<string> {
  return new Promise((resolve) => {
    // Skip if not a data URL (safety check)
    if (!dataUrl.startsWith("data:image")) {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > maxW) { height = (height * maxW) / width; width = maxW; }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(dataUrl); return; }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
