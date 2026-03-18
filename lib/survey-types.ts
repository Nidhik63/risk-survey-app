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

// --- Surveyor identity (internal only — not shown in reports) ---
export interface SurveyorIdentity {
  fieldSurveyorName: string;
  fieldSurveyorCompany: string;
}

// --- Complete V2 Survey Data ---
export interface SurveyDataV2 {
  sectionA: SectionA;
  sectionB: SectionB;
  sectionC: SectionC;
  sectionD: SectionD;
  sectionE: SectionE;
  photos: TaggedPhoto[];
  _meta?: SurveyorIdentity;
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

// ============================================================
// Guided Photo Categories (from Survey Photo Requirements)
// ============================================================

export interface PhotoCategoryDef {
  code: string;
  label: string;
  description: string;
  section: "A" | "B" | "C" | "D" | "E";
  maxPhotos: number;
  cameraTip: string;
}

export interface PhotoCategoryGroup {
  id: string;
  title: string;
  icon: string;
  categories: PhotoCategoryDef[];
}

export const PHOTO_CATEGORY_GROUPS: PhotoCategoryGroup[] = [
  {
    id: "external",
    title: "External & Structural",
    icon: "Building2",
    categories: [
      {
        code: "1a",
        label: "Four Corners Shot",
        description: "Wide-angle shots of all four elevations to identify third-party exposure (how close the neighbours are).",
        section: "B",
        maxPhotos: 4,
        cameraTip: "Stand back far enough to capture the full building elevation. Include neighbouring structures in the frame to show exposure distance.",
      },
      {
        code: "1b",
        label: "Wall Panel / Insulation",
        description: "Near a door or repair area, take a close-up of the insulation core. Yellow/White = Foam (Combustible); Grey/Fibrous = Mineral Wool (Non-Combustible).",
        section: "B",
        maxPhotos: 2,
        cameraTip: "Get a close-up macro shot of the exposed insulation core. Focus on the colour and texture of the material.",
      },
      {
        code: "1c",
        label: "Roof Condition",
        description: "Photos of the roof surface, gutters, and downpipes. Look for sand blockage or signs of ponding water.",
        section: "B",
        maxPhotos: 2,
        cameraTip: "Capture the roof surface, drainage points, and any visible water pooling or debris. Include gutter condition.",
      },
      {
        code: "1d",
        label: "Boundary Walls",
        description: "Photos of the perimeter boundary walls around the property.",
        section: "B",
        maxPhotos: 2,
        cameraTip: "Walk the perimeter and capture boundary walls from different angles, showing height and condition.",
      },
    ],
  },
  {
    id: "fire",
    title: "Fire Protection Systems",
    icon: "Flame",
    categories: [
      {
        code: "2a",
        label: "Fire Pump Room",
        description: "The main diesel pump showing it is in 'Auto' mode.",
        section: "C",
        maxPhotos: 2,
        cameraTip: "Capture the pump clearly showing the Auto/Manual switch position. Include the pump nameplate if visible.",
      },
      {
        code: "2b",
        label: "Pressure Gauges",
        description: "Pressure gauges to prove the fire protection system is pressurized.",
        section: "C",
        maxPhotos: 2,
        cameraTip: "Get a clear, straight-on shot of the gauge face so the pressure reading is legible.",
      },
      {
        code: "2c",
        label: "Fuel Tank Level",
        description: "The fuel tank level for the backup generator.",
        section: "C",
        maxPhotos: 2,
        cameraTip: "Capture the fuel gauge or sight glass showing the current fuel level clearly.",
      },
      {
        code: "2d",
        label: "Hose Reel",
        description: "Fire hose reels and their condition.",
        section: "C",
        maxPhotos: 2,
        cameraTip: "Show the hose reel in full, including the nozzle condition and any instruction signage.",
      },
      {
        code: "2e",
        label: "Sprinkler Heads",
        description: "Looking straight up at the ceiling to check for obstructions (e.g., pallets or mezzanines blocking the spray pattern).",
        section: "C",
        maxPhotos: 2,
        cameraTip: "Point the camera straight up at the ceiling. Capture the sprinkler heads and any objects that might obstruct the spray.",
      },
      {
        code: "2f",
        label: "Fire Alarm Panel",
        description: "A clear shot of the fire alarm panel LCD screen. Look for 'System Normal' (green) vs 'Fault' or 'Disable' status.",
        section: "C",
        maxPhotos: 2,
        cameraTip: "Get a close-up of the LCD display so the status text is readable. Avoid flash glare on the screen.",
      },
      {
        code: "2g",
        label: "Civil Defence Connection",
        description: "Photo of the Hassantuk or equivalent remote monitoring device installed on the wall.",
        section: "C",
        maxPhotos: 2,
        cameraTip: "Capture the full device including any status lights and labels.",
      },
    ],
  },
  {
    id: "internal",
    title: "Internal Logistics & Housekeeping",
    icon: "Package",
    categories: [
      {
        code: "3a",
        label: "Aisle & Rack",
        description: "A photo looking down the main aisle to show the height of the racking and overall storage arrangement.",
        section: "D",
        maxPhotos: 2,
        cameraTip: "Stand at the end of the main aisle and photograph along its length, showing full rack height.",
      },
      {
        code: "3b",
        label: "Flue Spaces",
        description: "Photos showing the vertical gap between pallets on the racks — essential for sprinkler efficacy.",
        section: "D",
        maxPhotos: 2,
        cameraTip: "Focus on the gaps between stacked pallets/goods. These vertical gaps must be clear for sprinklers to work.",
      },
      {
        code: "3c",
        label: "Commodity Identification",
        description: "Close-up photos of labels on boxes and stored materials to identify what is stored.",
        section: "D",
        maxPhotos: 2,
        cameraTip: "Get close enough to read the text on product labels, hazard symbols, and packaging markings.",
      },
      {
        code: "3d",
        label: "Roof to Rack Distance",
        description: "Photos showing the distance from the top of the rack to the roof/ceiling.",
        section: "D",
        maxPhotos: 2,
        cameraTip: "Capture the gap between the top of storage racks and the roof structure above.",
      },
    ],
  },
  {
    id: "utilities",
    title: "Utilities & Maintenance",
    icon: "Wrench",
    categories: [
      {
        code: "4a",
        label: "Main Electrical Board (LVP)",
        description: "A photo of the main electrical panel with the door open.",
        section: "E",
        maxPhotos: 2,
        cameraTip: "Open the panel door and capture the internal wiring and breaker layout. Include any labels.",
      },
      {
        code: "4b",
        label: "AC Condensate Pipes",
        description: "Photos of AC condensate drain pipes and their condition.",
        section: "E",
        maxPhotos: 2,
        cameraTip: "Show the condensate pipes, connection points, and any signs of leakage or blockage.",
      },
      {
        code: "4c",
        label: "External Drainage",
        description: "Photos of external ACU units and surrounding interlock paving to check for flood-prone low spots.",
        section: "E",
        maxPhotos: 2,
        cameraTip: "Capture drainage points, paving condition, and any visible water pooling areas around the building exterior.",
      },
    ],
  },
];
