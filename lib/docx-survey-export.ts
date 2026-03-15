import {
  Document,
  Packer,
  Paragraph,
  TextRun,
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
} from "docx";
import { saveAs } from "file-saver";
import type { SurveyDataV2 } from "./survey-types";

const PURPLE = "3D1556";
const GRAY = "64748B";
const GRAY_LIGHT = "F1F5F9";
const WHITE = "FFFFFF";

function headerCell(text: string, width?: number): TableCell {
  return new TableCell({
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    shading: { type: ShadingType.SOLID, color: PURPLE, fill: PURPLE },
    children: [
      new Paragraph({
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text, bold: true, color: WHITE, size: 18, font: "Calibri" })],
      }),
    ],
  });
}

function bodyCell(text: string, width?: number): TableCell {
  return new TableCell({
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    children: [
      new Paragraph({
        spacing: { before: 30, after: 30 },
        children: [new TextRun({ text: text || "—", size: 18, font: "Calibri", color: "0F172A" })],
      }),
    ],
  });
}

function labelCell(text: string, width?: number): TableCell {
  return new TableCell({
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    shading: { type: ShadingType.SOLID, color: GRAY_LIGHT, fill: GRAY_LIGHT },
    children: [
      new Paragraph({
        spacing: { before: 30, after: 30 },
        children: [new TextRun({ text, bold: true, size: 18, font: "Calibri", color: GRAY })],
      }),
    ],
  });
}

function sectionTable(fields: { label: string; value: string }[]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
    },
    rows: fields.map(
      (f) =>
        new TableRow({
          children: [labelCell(f.label, 40), bodyCell(f.value, 60)],
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
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
    },
    rows: [
      new TableRow({ children: [headerCell("Field", 35), headerCell("Details", 65)] }),
      new TableRow({ children: [labelCell("Insured Name", 35), bodyCell(a.insuredName, 65)] }),
      new TableRow({ children: [labelCell("Address", 35), bodyCell(a.address, 65)] }),
      new TableRow({ children: [labelCell("Date of Survey", 35), bodyCell(a.dateOfSurvey, 65)] }),
      new TableRow({ children: [labelCell("Surveyor", 35), bodyCell(a.surveyorName, 65)] }),
      new TableRow({ children: [labelCell("Reference", 35), bodyCell(reportRef, 65)] }),
      new TableRow({ children: [labelCell("Photos", 35), bodyCell(`${surveyData.photos.length} photos uploaded`, 65)] }),
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

          // Photo Summary
          new Paragraph({ children: [new PageBreak()] }),
          sectionHeading("Photo Summary"),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: `Total photos uploaded: ${surveyData.photos.length}`,
                size: 20,
                font: "Calibri",
              }),
            ],
          }),
          ...(surveyData.photos.length > 0
            ? [
                sectionTable(
                  ["A", "B", "C", "D", "E", "general"].map((section) => {
                    const count = surveyData.photos.filter((p) => p.section === section).length;
                    const captions = surveyData.photos
                      .filter((p) => p.section === section && p.caption)
                      .map((p) => p.caption)
                      .slice(0, 5)
                      .join("; ");
                    return {
                      label: section === "general" ? "General" : `Section ${section}`,
                      value: `${count} photo${count !== 1 ? "s" : ""}${captions ? ` — ${captions}` : ""}`,
                    };
                  })
                ),
              ]
            : []),

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
  saveAs(blob, filename);
}
