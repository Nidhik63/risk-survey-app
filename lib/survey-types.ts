// ============================================================
// RiskLens V2 — Survey & Report Type Definitions
// ============================================================

// --- Section A: General Information ---
export interface SectionA {
  insuredName: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  dateOfSurvey: string;
  surveyorName: string;
  occupancy: string;
  occupancyOther: string;
  occupancyDetails: string;
  buildingAge: string;
  plotArea: string;
  constructedArea: string;
  numberOfFloors: string;
  numberOfBasements: string;
  surroundingExposures: string;
  // Geocode + Flood fields (auto-populated)
  latitude: string;
  longitude: string;
  floodRiskLevel: string;
  floodRiskDetails: string;
}

// --- Section B: Construction Details ---
export interface SectionB {
  structuralFrame: string;
  externalWalls: string;
  roofStructure: string;
  roofCovering: string;
  floorType: string;
  ceilingType: string;
  insulationType: string;
  mezzanineFloors: string;
  buildingCondition: string;
  structuralConcerns: string;
}

// --- Section C: Fire Protection ---
export interface SectionC {
  fireDetectionSystem: string;
  detectionType: string;
  sprinklerSystem: string;
  sprinklerType: string;
  sprinklerCoverage: string;
  fireExtinguishers: string;
  extinguisherTypes: string;
  fireHoseReels: string;
  externalHydrants: string;
  fireAlarmPanel: string;
  emergencyExits: string;
  fireBrigade: string;
  lastFireDrillDate: string;
  hotWorkProcedures: string;
}

// --- Section D: EHS / Hazard Information ---
export interface SectionD {
  hazardousStorage: string;
  hazardousMaterials: string;
  storageArrangement: string;
  electricalInstallation: string;
  electricalMaintDate: string;
  lightningProtection: string;
  emergencyLighting: string;
  smokingPolicy: string;
  flammableLiquidStorage: string;
  lpgStorage: string;
  dustHazard: string;
  processHazards: string;
}

// --- Section E: Housekeeping & Maintenance ---
export interface SectionE {
  generalHousekeeping: string;
  wasteManagement: string;
  maintenanceProgram: string;
  roofMaintenance: string;
  electricalMaintenance: string;
  fireSafetyMaintenance: string;
  securityArrangements: string;
  perimeterFencing: string;
  accessControl: string;
  floodExposure: string;
  naturalCatExposure: string;
  businessContinuityPlan: string;
}

// --- Photo with section tag ---
export interface TaggedPhoto {
  dataUrl: string;
  section: "A" | "B" | "C" | "D" | "E" | "general";
  caption: string;
}

// --- Complete V2 Survey Data ---
export interface SurveyDataV2 {
  sectionA: SectionA;
  sectionB: SectionB;
  sectionC: SectionC;
  sectionD: SectionD;
  sectionE: SectionE;
  photos: TaggedPhoto[];
}

// ============================================================
// V2 Report Output (returned from Claude)
// ============================================================

export interface RIReportAnalysis {
  executiveSummary: string;
  overallRiskScore: number;
  overallRiskGrade: "Low" | "Moderate" | "High" | "Critical";
  sections: RIReportSection[];
  recommendations: RIRecommendation[];
  complianceItems: ComplianceItem[];
}

export interface RIReportSection {
  sectionId: "A" | "B" | "C" | "D" | "E";
  title: string;
  riskScore: number;
  riskGrade: "Low" | "Moderate" | "High" | "Critical";
  narrative: string;
  findings: RIFinding[];
  positives: string[];
}

export interface RIFinding {
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  description: string;
  recommendation: string;
  estimatedCost: "Low" | "Medium" | "High";
  timeframe: "Immediate" | "30 days" | "90 days" | "12 months";
}

export interface RIRecommendation {
  priority: number;
  title: string;
  description: string;
  section: string;
  timeframe: "Immediate" | "30 days" | "90 days" | "12 months";
}

export interface ComplianceItem {
  category: string;
  item: string;
  status: "Compliant" | "Non-Compliant" | "Partially Compliant" | "N/A";
  remarks: string;
}

// ============================================================
// Auto-Fill Result (returned from photo pre-analysis)
// ============================================================

export interface PhotoCategory {
  section: "A" | "B" | "C" | "D" | "E" | "general";
  caption: string;   // AI-generated description of what's in the photo
}

export interface AutoFillResult {
  sectionA: Partial<SectionA>;
  sectionB: Partial<SectionB>;
  sectionC: Partial<SectionC>;
  sectionD: Partial<SectionD>;
  sectionE: Partial<SectionE>;
  photoCategories: PhotoCategory[];  // One per uploaded photo, in order
  confidence: string; // "low" | "medium" | "high"
  summary: string;    // Brief description of what was detected
}

// ============================================================
// Section metadata for wizard UI
// ============================================================

export const SECTION_META = [
  { id: "A", title: "General Information", icon: "Building2", description: "Property details, occupancy, and contact information" },
  { id: "B", title: "Construction Details", icon: "HardHat", description: "Structural frame, walls, roof, and building condition" },
  { id: "C", title: "Fire Protection", icon: "Flame", description: "Detection systems, sprinklers, extinguishers, and emergency exits" },
  { id: "D", title: "EHS / Hazards", icon: "AlertTriangle", description: "Hazardous materials, electrical, and environmental risks" },
  { id: "E", title: "Housekeeping & Maintenance", icon: "Wrench", description: "Maintenance programs, security, and natural catastrophe exposure" },
] as const;

export const WIZARD_STEPS = [
  { id: "photos", title: "Site Photos" },
  ...SECTION_META.map(s => ({ id: s.id, title: s.title })),
  { id: "review", title: "Review & Submit" },
] as const;
