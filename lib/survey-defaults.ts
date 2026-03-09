import type {
  SectionA,
  SectionB,
  SectionC,
  SectionD,
  SectionE,
  SurveyDataV2,
} from "./survey-types";

export const defaultSectionA: SectionA = {
  insuredName: "",
  address: "",
  contactPerson: "",
  contactPhone: "",
  dateOfSurvey: new Date().toISOString().split("T")[0],
  surveyorName: "",
  occupancy: "",
  occupancyOther: "",
  occupancyDetails: "",
  buildingAge: "",
  totalArea: "",
  numberOfFloors: "",
  numberOfBasements: "",
  surroundingExposures: "",
};

export const defaultSectionB: SectionB = {
  structuralFrame: "",
  externalWalls: "",
  roofStructure: "",
  roofCovering: "",
  floorType: "",
  ceilingType: "",
  insulationType: "",
  mezzanineFloors: "",
  buildingCondition: "",
  structuralConcerns: "",
};

export const defaultSectionC: SectionC = {
  fireDetectionSystem: "",
  detectionType: "",
  sprinklerSystem: "",
  sprinklerType: "",
  sprinklerCoverage: "",
  fireExtinguishers: "",
  extinguisherTypes: "",
  fireHoseReels: "",
  externalHydrants: "",
  fireAlarmPanel: "",
  emergencyExits: "",
  fireBrigade: "",
  lastFireDrillDate: "",
  hotWorkProcedures: "",
};

export const defaultSectionD: SectionD = {
  hazardousStorage: "",
  hazardousMaterials: "",
  storageArrangement: "",
  electricalInstallation: "",
  electricalMaintDate: "",
  lightningProtection: "",
  emergencyLighting: "",
  smokingPolicy: "",
  flammableLiquidStorage: "",
  lpgStorage: "",
  dustHazard: "",
  processHazards: "",
};

export const defaultSectionE: SectionE = {
  generalHousekeeping: "",
  wasteManagement: "",
  maintenanceProgram: "",
  roofMaintenance: "",
  electricalMaintenance: "",
  fireSafetyMaintenance: "",
  securityArrangements: "",
  perimeterFencing: "",
  accessControl: "",
  floodExposure: "",
  naturalCatExposure: "",
  businessContinuityPlan: "",
};

export const defaultSurveyData: SurveyDataV2 = {
  sectionA: { ...defaultSectionA },
  sectionB: { ...defaultSectionB },
  sectionC: { ...defaultSectionC },
  sectionD: { ...defaultSectionD },
  sectionE: { ...defaultSectionE },
  photos: [],
};
