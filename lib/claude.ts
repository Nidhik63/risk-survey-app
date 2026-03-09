import Anthropic from "@anthropic-ai/sdk";
import type { RiskAnalysis, SiteDetails } from "./risk-scoring";
import type { SurveyDataV2, RIReportAnalysis, TaggedPhoto, AutoFillResult } from "./survey-types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeRiskImages(
  images: string[],
  siteDetails: SiteDetails
): Promise<RiskAnalysis> {
  const imageContent: Anthropic.Messages.ContentBlockParam[] = images.map(
    (base64Image, index) => {
      const match = base64Image.match(/^data:(image\/\w+);base64,(.+)$/);
      const mediaType = (match?.[1] as "image/jpeg" | "image/png" | "image/gif" | "image/webp") || "image/jpeg";
      const data = match?.[2] || base64Image;

      return {
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: mediaType,
          data: data,
        },
      };
    }
  );

  const prompt = `You are an expert insurance risk surveyor and building inspector. Analyze the provided images of a property and generate a comprehensive risk assessment.

PROPERTY DETAILS:
- Address: ${siteDetails.address}
- Building Type: ${siteDetails.buildingType}
- Year Built: ${siteDetails.yearBuilt}
- Number of Floors: ${siteDetails.floors}
- Occupancy Type: ${siteDetails.occupancy}

Analyze every image carefully for risks across these 6 categories. Score each 1-10 (1=excellent condition, 10=critical risk):

1. **Structural Integrity** (Weight: 25%) - Look for: cracks in walls/foundation, sagging roofs, deteriorating materials, water damage to structure, settling issues, poor construction quality
2. **Fire Safety** (Weight: 20%) - Look for: exposed wiring, flammable material storage, blocked exits, missing fire extinguishers, combustible cladding, poor compartmentation
3. **Water & Flood Risk** (Weight: 15%) - Look for: water stains, poor drainage, proximity to water bodies, dampness, damaged guttering, basement flooding signs
4. **Electrical Safety** (Weight: 15%) - Look for: exposed cables, overloaded sockets, outdated wiring, damaged switch plates, missing covers, DIY electrical work
5. **Environmental Hazards** (Weight: 15%) - Look for: mold/mildew, potential asbestos materials, poor ventilation, chemical storage, contamination signs, pest evidence
6. **Security & Access** (Weight: 10%) - Look for: broken locks, poor lighting, unsecured entry points, missing CCTV, damaged fencing, inadequate access control

For each category, provide specific findings referencing what you see in the images.

You MUST respond with ONLY valid JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "executiveSummary": "A 2-3 sentence overview of the property's risk profile",
  "categories": [
    {
      "name": "Structural Integrity",
      "score": <1-10>,
      "weight": 0.25,
      "icon": "building",
      "summary": "Brief summary of structural findings",
      "findings": [
        {
          "id": "s1",
          "category": "Structural Integrity",
          "title": "Finding title",
          "description": "Detailed description of what was observed",
          "severity": "low|moderate|high|critical",
          "recommendation": "Specific actionable recommendation",
          "imageIndex": <0-based index of the most relevant image, or null>
        }
      ]
    },
    {
      "name": "Fire Safety",
      "score": <1-10>,
      "weight": 0.20,
      "icon": "flame",
      "summary": "...",
      "findings": [...]
    },
    {
      "name": "Water & Flood Risk",
      "score": <1-10>,
      "weight": 0.15,
      "icon": "droplets",
      "summary": "...",
      "findings": [...]
    },
    {
      "name": "Electrical Safety",
      "score": <1-10>,
      "weight": 0.15,
      "icon": "zap",
      "summary": "...",
      "findings": [...]
    },
    {
      "name": "Environmental Hazards",
      "score": <1-10>,
      "weight": 0.15,
      "icon": "leaf",
      "summary": "...",
      "findings": [...]
    },
    {
      "name": "Security & Access",
      "score": <1-10>,
      "weight": 0.10,
      "icon": "shield",
      "summary": "...",
      "findings": [...]
    }
  ],
  "recommendations": [
    "Top priority recommendation 1",
    "Top priority recommendation 2",
    "Top priority recommendation 3",
    "Top priority recommendation 4",
    "Top priority recommendation 5"
  ]
}

Be thorough and specific. Reference actual visual evidence from the images. Each category should have at least 1-3 findings. Provide actionable, professional recommendations.`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [...imageContent, { type: "text", text: prompt }],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Strip markdown code blocks if present
  let jsonText = textBlock.text.trim();
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  const parsed = JSON.parse(jsonText);

  // Calculate overall score
  let weightedSum = 0;
  let totalWeight = 0;
  for (const cat of parsed.categories) {
    weightedSum += cat.score * cat.weight * 10;
    totalWeight += cat.weight;
  }
  const overallScore = Math.round(weightedSum / totalWeight);

  let riskLevel: "low" | "moderate" | "high" | "critical";
  if (overallScore <= 25) riskLevel = "low";
  else if (overallScore <= 50) riskLevel = "moderate";
  else if (overallScore <= 75) riskLevel = "high";
  else riskLevel = "critical";

  return {
    overallScore,
    riskLevel,
    executiveSummary: parsed.executiveSummary,
    categories: parsed.categories,
    recommendations: parsed.recommendations,
  };
}

// ============================================================
// V2: Professional RI Report Analysis
// ============================================================

export async function analyzeRiskImagesV2(
  surveyData: SurveyDataV2
): Promise<RIReportAnalysis> {
  const { sectionA, sectionB, sectionC, sectionD, sectionE, photos } = surveyData;

  // Build image content blocks with section tags
  const imageContent: Anthropic.Messages.ContentBlockParam[] = [];
  const photoDescriptions: string[] = [];

  photos.forEach((photo, index) => {
    const match = photo.dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
    const mediaType = (match?.[1] as "image/jpeg" | "image/png" | "image/gif" | "image/webp") || "image/jpeg";
    const data = match?.[2] || photo.dataUrl;

    imageContent.push({
      type: "text" as const,
      text: `[Photo ${index + 1} — Section: ${photo.section.toUpperCase()}${photo.caption ? ` — Caption: ${photo.caption}` : ""}]`,
    });
    imageContent.push({
      type: "image" as const,
      source: {
        type: "base64" as const,
        media_type: mediaType,
        data: data,
      },
    });
    photoDescriptions.push(
      `Photo ${index + 1}: Section ${photo.section.toUpperCase()}${photo.caption ? ` (${photo.caption})` : ""}`
    );
  });

  const prompt = `You are a certified property risk engineer conducting a professional Risk Inspection (RI) survey for insurance underwriting purposes. Analyze the provided site photos AND the surveyor's checklist data to produce a comprehensive RI Report.

=== SURVEYOR'S CHECKLIST DATA ===

SECTION A — GENERAL INFORMATION:
- Insured Name: ${sectionA.insuredName}
- Address: ${sectionA.address}
- Contact Person: ${sectionA.contactPerson} (${sectionA.contactPhone})
- Date of Survey: ${sectionA.dateOfSurvey}
- Surveyor: ${sectionA.surveyorName}
- Occupancy: ${sectionA.occupancy} (${sectionA.occupancyDetails})
- Building Age: ${sectionA.buildingAge} years
- Total Area: ${sectionA.totalArea} sq m
- Floors: ${sectionA.numberOfFloors} (Basements: ${sectionA.numberOfBasements})
- Surrounding Exposures: ${sectionA.surroundingExposures}

SECTION B — CONSTRUCTION DETAILS:
- Structural Frame: ${sectionB.structuralFrame}
- External Walls: ${sectionB.externalWalls}
- Roof Structure: ${sectionB.roofStructure}
- Roof Covering: ${sectionB.roofCovering}
- Floor Type: ${sectionB.floorType}
- Ceiling Type: ${sectionB.ceilingType}
- Insulation Type: ${sectionB.insulationType}
- Mezzanine Floors: ${sectionB.mezzanineFloors}
- Building Condition: ${sectionB.buildingCondition}
- Structural Concerns: ${sectionB.structuralConcerns}

SECTION C — FIRE PROTECTION:
- Fire Detection System: ${sectionC.fireDetectionSystem} (${sectionC.detectionType})
- Sprinkler System: ${sectionC.sprinklerSystem} (${sectionC.sprinklerType}, Coverage: ${sectionC.sprinklerCoverage})
- Fire Extinguishers: ${sectionC.fireExtinguishers} (${sectionC.extinguisherTypes})
- Fire Hose Reels: ${sectionC.fireHoseReels}
- External Hydrants: ${sectionC.externalHydrants}
- Fire Alarm Panel: ${sectionC.fireAlarmPanel}
- Emergency Exits: ${sectionC.emergencyExits}
- Nearest Fire Brigade: ${sectionC.fireBrigade}
- Last Fire Drill: ${sectionC.lastFireDrillDate}
- Hot Work Procedures: ${sectionC.hotWorkProcedures}

SECTION D — EHS / HAZARD INFORMATION:
- Hazardous Materials Stored: ${sectionD.hazardousStorage} (${sectionD.hazardousMaterials})
- Storage Arrangement: ${sectionD.storageArrangement}
- Electrical Installation: ${sectionD.electricalInstallation}
- Last Electrical Maintenance: ${sectionD.electricalMaintDate}
- Lightning Protection: ${sectionD.lightningProtection}
- Emergency Lighting: ${sectionD.emergencyLighting}
- Smoking Policy: ${sectionD.smokingPolicy}
- Flammable Liquid Storage: ${sectionD.flammableLiquidStorage}
- LPG Storage: ${sectionD.lpgStorage}
- Dust Hazard: ${sectionD.dustHazard}
- Process Hazards: ${sectionD.processHazards}

SECTION E — HOUSEKEEPING & MAINTENANCE:
- General Housekeeping: ${sectionE.generalHousekeeping}
- Waste Management: ${sectionE.wasteManagement}
- Maintenance Program: ${sectionE.maintenanceProgram}
- Roof Maintenance: ${sectionE.roofMaintenance}
- Electrical Maintenance: ${sectionE.electricalMaintenance}
- Fire Safety Maintenance: ${sectionE.fireSafetyMaintenance}
- Security Arrangements: ${sectionE.securityArrangements}
- Perimeter Fencing: ${sectionE.perimeterFencing}
- Access Control: ${sectionE.accessControl}
- Flood Exposure: ${sectionE.floodExposure}
- Natural Cat Exposure: ${sectionE.naturalCatExposure}
- Business Continuity Plan: ${sectionE.businessContinuityPlan}

=== UPLOADED PHOTOS ===
${photoDescriptions.length > 0 ? photoDescriptions.join("\n") : "No photos provided."}

=== YOUR TASK ===

Analyze ALL checklist data AND photos to produce a professional RI Report. Cross-reference checklist answers with visual evidence from photos. Where checklist says one thing but photos show another, note the discrepancy.

Score each section on a 1-100 scale:
- 1-25: Low Risk (well-managed, compliant)
- 26-50: Moderate Risk (minor issues, mostly compliant)
- 51-75: High Risk (significant concerns, multiple deficiencies)
- 76-100: Critical Risk (severe hazards, immediate action needed)

You MUST respond with ONLY valid JSON (no markdown, no code blocks, just raw JSON) in this exact format:
{
  "executiveSummary": "3-4 sentence professional executive summary covering the overall risk profile, key concerns, and recommendation for underwriters",
  "overallRiskScore": <1-100>,
  "overallRiskGrade": "Low|Moderate|High|Critical",
  "sections": [
    {
      "sectionId": "A",
      "title": "General Information & Property Overview",
      "riskScore": <1-100>,
      "riskGrade": "Low|Moderate|High|Critical",
      "narrative": "2-3 paragraph detailed narrative analysis of this section. Reference specific checklist data and photo observations. Write in a professional risk engineering tone.",
      "findings": [
        {
          "title": "Finding title",
          "severity": "Critical|High|Medium|Low",
          "description": "Detailed description of the issue",
          "recommendation": "Specific actionable recommendation",
          "estimatedCost": "Low|Medium|High",
          "timeframe": "Immediate|30 days|90 days|12 months"
        }
      ],
      "positives": ["Positive observation 1", "Positive observation 2"]
    },
    {
      "sectionId": "B",
      "title": "Construction Details",
      "riskScore": <1-100>,
      "riskGrade": "...",
      "narrative": "...",
      "findings": [...],
      "positives": [...]
    },
    {
      "sectionId": "C",
      "title": "Fire Protection",
      "riskScore": <1-100>,
      "riskGrade": "...",
      "narrative": "...",
      "findings": [...],
      "positives": [...]
    },
    {
      "sectionId": "D",
      "title": "EHS / Hazard Information",
      "riskScore": <1-100>,
      "riskGrade": "...",
      "narrative": "...",
      "findings": [...],
      "positives": [...]
    },
    {
      "sectionId": "E",
      "title": "Housekeeping & Maintenance",
      "riskScore": <1-100>,
      "riskGrade": "...",
      "narrative": "...",
      "findings": [...],
      "positives": [...]
    }
  ],
  "recommendations": [
    {
      "priority": 1,
      "title": "Most urgent recommendation title",
      "description": "Detailed description",
      "section": "C",
      "timeframe": "Immediate|30 days|90 days|12 months"
    },
    {
      "priority": 2,
      "title": "...",
      "description": "...",
      "section": "...",
      "timeframe": "..."
    }
  ],
  "complianceItems": [
    {
      "category": "Fire Protection",
      "item": "Fire Detection System",
      "status": "Compliant|Non-Compliant|Partially Compliant|N/A",
      "remarks": "Brief remark about compliance status"
    },
    {
      "category": "Fire Protection",
      "item": "Sprinkler System",
      "status": "...",
      "remarks": "..."
    },
    {
      "category": "Fire Protection",
      "item": "Fire Extinguishers",
      "status": "...",
      "remarks": "..."
    },
    {
      "category": "Fire Protection",
      "item": "Emergency Exits",
      "status": "...",
      "remarks": "..."
    },
    {
      "category": "Electrical",
      "item": "Electrical Installation",
      "status": "...",
      "remarks": "..."
    },
    {
      "category": "Electrical",
      "item": "Lightning Protection",
      "status": "...",
      "remarks": "..."
    },
    {
      "category": "Electrical",
      "item": "Emergency Lighting",
      "status": "...",
      "remarks": "..."
    },
    {
      "category": "Safety",
      "item": "Hazardous Material Storage",
      "status": "...",
      "remarks": "..."
    },
    {
      "category": "Safety",
      "item": "Hot Work Procedures",
      "status": "...",
      "remarks": "..."
    },
    {
      "category": "Security",
      "item": "Access Control",
      "status": "...",
      "remarks": "..."
    },
    {
      "category": "Security",
      "item": "Perimeter Security",
      "status": "...",
      "remarks": "..."
    },
    {
      "category": "Management",
      "item": "Business Continuity Plan",
      "status": "...",
      "remarks": "..."
    },
    {
      "category": "Management",
      "item": "Maintenance Program",
      "status": "...",
      "remarks": "..."
    }
  ]
}

IMPORTANT GUIDELINES:
- Be thorough: every section must have at least 2 findings and 1 positive
- Be professional: write in formal risk engineering language
- Be specific: reference actual checklist values and photo observations
- Provide at least 5 prioritized recommendations
- Provide at least 13 compliance items covering all key areas
- Include at least 5 recommendations sorted by priority
- All scores must be integers between 1 and 100`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: [...imageContent, { type: "text", text: prompt }],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Strip markdown code blocks if present
  let jsonText = textBlock.text.trim();
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }

  const parsed: RIReportAnalysis = JSON.parse(jsonText);
  return parsed;
}

// ============================================================
// Auto-Fill: Extract checklist data from photos
// ============================================================

export async function autoFillFromPhotos(
  photos: TaggedPhoto[]
): Promise<AutoFillResult> {
  if (photos.length === 0) {
    throw new Error("At least one photo is required for auto-fill");
  }

  // Build image content
  const imageContent: Anthropic.Messages.ContentBlockParam[] = [];
  photos.forEach((photo, index) => {
    const match = photo.dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
    const mediaType = (match?.[1] as "image/jpeg" | "image/png" | "image/gif" | "image/webp") || "image/jpeg";
    const data = match?.[2] || photo.dataUrl;

    imageContent.push({
      type: "text" as const,
      text: `[Photo ${index + 1}${photo.caption ? ` — ${photo.caption}` : ""}]`,
    });
    imageContent.push({
      type: "image" as const,
      source: {
        type: "base64" as const,
        media_type: mediaType,
        data: data,
      },
    });
  });

  const prompt = `You are a property risk engineer. Analyze these site photos and extract as many observable facts as possible to pre-fill a property risk survey checklist.

Look carefully at every photo for clues about:
- Building type, occupancy, approximate size and floors
- Construction: structural frame type, wall material, roof type, floor type, building condition
- Fire protection: visible detectors, sprinklers, extinguishers, hose reels, hydrants, fire alarm panels, emergency exits
- Hazards: hazardous materials, electrical panels/wiring condition, smoking areas, chemical storage
- Housekeeping: general tidiness, waste management, security cameras, fencing, access gates

ONLY include fields where you can make a reasonable observation from the photos. Leave fields empty ("") if not visible or uncertain. Use the EXACT values from the allowed options when possible.

You MUST respond with ONLY valid JSON (no markdown, no code blocks):
{
  "sectionA": {
    "occupancy": "Warehouse|Manufacturing|Office|Retail|Residential|Mixed Use|Industrial|Cold Storage|Food Processing|Chemical|Logistics|Other",
    "occupancyDetails": "description of what appears to be stored/manufactured",
    "buildingAge": "estimated age if possible, empty if not",
    "totalArea": "estimated area in sqm if possible",
    "numberOfFloors": "number visible",
    "numberOfBasements": "",
    "surroundingExposures": "describe visible surroundings"
  },
  "sectionB": {
    "structuralFrame": "RCC|Steel Frame|Load Bearing|Pre-Engineered|Composite|Timber|Other",
    "externalWalls": "Concrete Block|Sandwich Panel|Metal Cladding|Brick|Precast Concrete|Curtain Wall|Other",
    "roofStructure": "RCC Slab|Metal Deck|Metal Truss|Portal Frame|Timber Truss|Other",
    "roofCovering": "Metal Sheet|Built-up|Single Ply|Concrete Tile|Sandwich Panel|Other",
    "floorType": "Concrete|Raised Floor|Tiled|Epoxy Coated|Other",
    "ceilingType": "description",
    "insulationType": "Non-Combustible|Combustible|None",
    "mezzanineFloors": "Yes - description|No",
    "buildingCondition": "Good|Fair|Poor",
    "structuralConcerns": "description of any visible issues"
  },
  "sectionC": {
    "fireDetectionSystem": "Yes|No",
    "detectionType": "Smoke Detectors|Heat Detectors|Beam Detectors|VESDA|Multi-Sensor|Other",
    "sprinklerSystem": "Yes|No",
    "sprinklerType": "Wet Pipe|Dry Pipe|Deluge|Pre-Action|Foam|Other",
    "sprinklerCoverage": "Full|Partial",
    "fireExtinguishers": "Yes|No",
    "extinguisherTypes": "CO2|DCP|Foam|Water|Mixed Types",
    "fireHoseReels": "Yes|No",
    "externalHydrants": "Yes|No",
    "fireAlarmPanel": "Yes|No",
    "emergencyExits": "Adequate|Inadequate",
    "hotWorkProcedures": "Yes|No"
  },
  "sectionD": {
    "hazardousStorage": "Yes|No",
    "hazardousMaterials": "description if visible",
    "storageArrangement": "Segregated|Mixed|N/A",
    "electricalInstallation": "Good|Fair|Poor",
    "lightningProtection": "Yes|No",
    "emergencyLighting": "Yes|No",
    "smokingPolicy": "Prohibited|Designated Areas|Unrestricted",
    "flammableLiquidStorage": "description if visible",
    "lpgStorage": "description if visible",
    "dustHazard": "Yes|No",
    "processHazards": "description if visible"
  },
  "sectionE": {
    "generalHousekeeping": "Good|Fair|Poor",
    "wasteManagement": "Good|Fair|Poor",
    "maintenanceProgram": "Planned|Reactive|None",
    "securityArrangements": "Security Guards|Guards + CCTV|CCTV Only|Alarm System|Minimal",
    "perimeterFencing": "Yes|No",
    "accessControl": "Yes|No",
    "floodExposure": "Yes|No",
    "naturalCatExposure": "None|Earthquake|Cyclone|Flood|Sandstorm|Multiple"
  },
  "confidence": "low|medium|high",
  "summary": "Brief 1-2 sentence summary of what was detected in the photos"
}

Remember: ONLY fill fields you can actually observe in the photos. Empty string "" for anything not visible. Be accurate, not speculative.`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [...imageContent, { type: "text", text: prompt }],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  let jsonText = textBlock.text.trim();
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }

  const parsed: AutoFillResult = JSON.parse(jsonText);
  return parsed;
}
