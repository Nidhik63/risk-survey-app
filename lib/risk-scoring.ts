export interface RiskFinding {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: "low" | "moderate" | "high" | "critical";
  recommendation: string;
  imageIndex?: number;
}

export interface RiskCategory {
  name: string;
  score: number;
  weight: number;
  icon: string;
  findings: RiskFinding[];
  summary: string;
}

export interface RiskAnalysis {
  overallScore: number;
  riskLevel: "low" | "moderate" | "high" | "critical";
  executiveSummary: string;
  categories: RiskCategory[];
  recommendations: string[];
}

export interface SiteDetails {
  address: string;
  buildingType: string;
  yearBuilt: string;
  floors: string;
  occupancy: string;
  surveyorName: string;
}

export const RISK_CATEGORIES = [
  { name: "Structural Integrity", weight: 0.25, icon: "building" },
  { name: "Fire Safety", weight: 0.2, icon: "flame" },
  { name: "Water & Flood Risk", weight: 0.15, icon: "droplets" },
  { name: "Electrical Safety", weight: 0.15, icon: "zap" },
  { name: "Environmental Hazards", weight: 0.15, icon: "leaf" },
  { name: "Security & Access", weight: 0.1, icon: "shield" },
] as const;

export function getRiskLevel(score: number): "low" | "moderate" | "high" | "critical" {
  if (score <= 25) return "low";
  if (score <= 50) return "moderate";
  if (score <= 75) return "high";
  return "critical";
}

export function getRiskColor(level: string): string {
  switch (level) {
    case "low": return "#22c55e";
    case "moderate": return "#eab308";
    case "high": return "#f97316";
    case "critical": return "#ef4444";
    default: return "#6b7280";
  }
}

export function getRiskBgClass(level: string): string {
  switch (level) {
    case "low": return "bg-green-100 text-green-800";
    case "moderate": return "bg-yellow-100 text-yellow-800";
    case "high": return "bg-orange-100 text-orange-800";
    case "critical": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

export function calculateOverallScore(categories: RiskCategory[]): number {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const cat of categories) {
    weightedSum += cat.score * cat.weight * 10;
    totalWeight += cat.weight;
  }

  return Math.round(weightedSum / totalWeight);
}
