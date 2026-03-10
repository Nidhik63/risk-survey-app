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

  const prompt = `You are a certified property risk engineer. Analyze the site photos AND checklist data to produce an RI Report as JSON.

=== CHECKLIST DATA ===
A) General: Insured=${sectionA.insuredName}, Addr=${sectionA.address}, Contact=${sectionA.contactPerson}(${sectionA.contactPhone}), Date=${sectionA.dateOfSurvey}, Surveyor=${sectionA.surveyorName}, Occupancy=${sectionA.occupancy === "Other" ? sectionA.occupancyOther : sectionA.occupancy}(${sectionA.occupancyDetails}), Age=${sectionA.buildingAge}yr, PlotArea=${sectionA.plotArea}sqm, BuiltArea=${sectionA.constructedArea}sqm, GEO=${sectionA.latitude},${sectionA.longitude}, FloodRisk=${sectionA.floodRiskLevel || "Unknown"}, Floors=${sectionA.numberOfFloors}(B:${sectionA.numberOfBasements}), Exposures=${sectionA.surroundingExposures}
B) Construction: Frame=${sectionB.structuralFrame}, Walls=${sectionB.externalWalls}, Roof=${sectionB.roofStructure}/${sectionB.roofCovering}, Floor=${sectionB.floorType}, Ceiling=${sectionB.ceilingType}, Insulation=${sectionB.insulationType}, Mezzanine=${sectionB.mezzanineFloors}, Condition=${sectionB.buildingCondition}, Concerns=${sectionB.structuralConcerns}
C) Fire: Detection=${sectionC.fireDetectionSystem}(${sectionC.detectionType}), Sprinklers=${sectionC.sprinklerSystem}(${sectionC.sprinklerType},${sectionC.sprinklerCoverage}), Extinguishers=${sectionC.fireExtinguishers}(${sectionC.extinguisherTypes}), HoseReels=${sectionC.fireHoseReels}, Hydrants=${sectionC.externalHydrants}, AlarmPanel=${sectionC.fireAlarmPanel}, Exits=${sectionC.emergencyExits}, Brigade=${sectionC.fireBrigade}, LastDrill=${sectionC.lastFireDrillDate}, HotWork=${sectionC.hotWorkProcedures}
D) EHS: HazMat=${sectionD.hazardousStorage}(${sectionD.hazardousMaterials}), Storage=${sectionD.storageArrangement}, Electrical=${sectionD.electricalInstallation}(maint:${sectionD.electricalMaintDate}), Lightning=${sectionD.lightningProtection}, EmergLight=${sectionD.emergencyLighting}, Smoking=${sectionD.smokingPolicy}, FlammLiquid=${sectionD.flammableLiquidStorage}, LPG=${sectionD.lpgStorage}, Dust=${sectionD.dustHazard}, Process=${sectionD.processHazards}
E) Housekeeping: HK=${sectionE.generalHousekeeping}, Waste=${sectionE.wasteManagement}, Maint=${sectionE.maintenanceProgram}, RoofMaint=${sectionE.roofMaintenance}, ElecMaint=${sectionE.electricalMaintenance}, FireMaint=${sectionE.fireSafetyMaintenance}, Security=${sectionE.securityArrangements}, Fence=${sectionE.perimeterFencing}, Access=${sectionE.accessControl}, Flood=${sectionE.floodExposure}, NatCat=${sectionE.naturalCatExposure}, BCP=${sectionE.businessContinuityPlan}

=== PHOTOS ===
${photoDescriptions.length > 0 ? photoDescriptions.join("; ") : "None"}

=== OUTPUT FORMAT ===
Respond ONLY with valid JSON (no markdown). Keep narratives to ONE concise paragraph each. Keep finding descriptions to 1-2 sentences. Keep recommendation descriptions to 1 sentence. Keep compliance remarks to a few words.

Scoring: 1-25=Low, 26-50=Moderate, 51-75=High, 76-100=Critical.

{
  "executiveSummary": "2-3 sentence summary for underwriters",
  "overallRiskScore": <1-100>,
  "overallRiskGrade": "Low|Moderate|High|Critical",
  "sections": [
    {
      "sectionId": "A|B|C|D|E",
      "title": "Section title",
      "riskScore": <1-100>,
      "riskGrade": "Low|Moderate|High|Critical",
      "narrative": "One concise paragraph referencing checklist data and photos.",
      "findings": [{"title":"...","severity":"Critical|High|Medium|Low","description":"1-2 sentences","recommendation":"actionable fix","estimatedCost":"Low|Medium|High","timeframe":"Immediate|30 days|90 days|12 months"}],
      "positives": ["positive 1"]
    }
  ],
  "recommendations": [{"priority":1,"title":"...","description":"1 sentence","section":"A|B|C|D|E","timeframe":"Immediate|30 days|90 days|12 months"}],
  "complianceItems": [{"category":"Fire Protection|Electrical|Safety|Security|Management","item":"item name","status":"Compliant|Non-Compliant|Partially Compliant|N/A","remarks":"few words"}]
}

REQUIREMENTS:
- 5 sections (A through E), each with 1-2 findings and 1 positive
- 5 recommendations sorted by priority
- 8 compliance items covering: Fire Detection, Sprinklers, Extinguishers, Exits, Electrical, HazMat, Access Control, BCP
- Be concise but professional. Reference actual checklist values and photo observations.`;

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

  // If response was truncated (hit max_tokens), try to repair the JSON
  if (response.stop_reason === "max_tokens") {
    jsonText = repairTruncatedJson(jsonText);
  }

  const parsed: RIReportAnalysis = JSON.parse(jsonText);
  return parsed;
}

// Attempt to close truncated JSON by balancing brackets
function repairTruncatedJson(text: string): string {
  // Find the last complete value (ends with ", or number, or true/false/null, or ] or })
  // Then close all open brackets/braces
  let trimmed = text.trimEnd();

  // Remove trailing comma if present
  if (trimmed.endsWith(",")) {
    trimmed = trimmed.slice(0, -1);
  }

  // Remove incomplete string (no closing quote)
  const lastQuote = trimmed.lastIndexOf('"');
  if (lastQuote > 0) {
    // Check if the string before lastQuote has an unmatched opening quote
    const afterLast = trimmed.slice(lastQuote + 1).trim();
    // If after the last quote we have a dangling colon or nothing useful,
    // the value was likely being written — back up to the last complete key-value
    if (afterLast === ":" || afterLast === "") {
      // Find the previous complete line
      const lastNewline = trimmed.lastIndexOf("\n", lastQuote);
      if (lastNewline > 0) {
        trimmed = trimmed.slice(0, lastNewline).trimEnd();
        if (trimmed.endsWith(",")) trimmed = trimmed.slice(0, -1);
      }
    }
  }

  // Count open vs close brackets/braces
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escape = false;

  for (const ch of trimmed) {
    if (escape) { escape = false; continue; }
    if (ch === "\\") { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") openBraces++;
    if (ch === "}") openBraces--;
    if (ch === "[") openBrackets++;
    if (ch === "]") openBrackets--;
  }

  // Close all open brackets and braces
  for (let i = 0; i < openBrackets; i++) trimmed += "]";
  for (let i = 0; i < openBraces; i++) trimmed += "}";

  return trimmed;
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

  const prompt = `You are a property risk engineer. Analyze these ${photos.length} site photos and:
1. Extract as many observable facts as possible to pre-fill a property risk survey checklist.
2. Categorize each photo into the most relevant survey section.

Look carefully at every photo for clues about:
- Building type, occupancy, approximate size and floors
- Construction: structural frame type, wall material, roof type, floor type, building condition
- Fire protection: visible detectors, sprinklers, extinguishers, hose reels, hydrants, fire alarm panels, emergency exits
- Hazards: hazardous materials, electrical panels/wiring condition, smoking areas, chemical storage
- Housekeeping: general tidiness, waste management, security cameras, fencing, access gates

ONLY include fields where you can make a reasonable observation from the photos. Leave fields empty ("") if not visible or uncertain. Use the EXACT values from the allowed options when possible.

PHOTO CATEGORIZATION RULES:
- "A" = General / overview shots, building exterior, signage, surroundings, entrance
- "B" = Construction details: walls, roof, structure, floors, ceilings, insulation
- "C" = Fire protection: fire extinguishers, sprinklers, smoke detectors, fire alarm panels, hose reels, hydrants, emergency exits, fire doors
- "D" = Hazards: electrical panels, chemical storage, hazardous materials, LPG tanks, dust, process equipment
- "E" = Housekeeping: cleanliness, waste bins, maintenance areas, security cameras, fencing, gates, CCTV
- "general" = Only if the photo doesn't clearly fit any section above

For each photo, provide a short descriptive caption (5-15 words) explaining what's visible.

You MUST respond with ONLY valid JSON (no markdown, no code blocks):
{
  "sectionA": {
    "occupancy": "Warehouse|Manufacturing|Manufacturing + Warehouse|Manufacturing + Warehouse + Office|Office|Retail|Residential|Mixed Use|Industrial|Cold Storage|Food Processing|Chemical|Logistics|Other",
    "occupancyDetails": "description of what appears to be stored/manufactured",
    "buildingAge": "estimated age if possible, empty if not",
    "plotArea": "estimated total plot/land area in sqm if possible",
    "constructedArea": "estimated built-up/constructed area in sqm if possible",
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
  "photoCategories": [
    {"section": "A", "caption": "Front view of warehouse building with signage"},
    {"section": "C", "caption": "Fire extinguisher mounted near emergency exit"},
    {"section": "B", "caption": "Metal roof structure with steel trusses visible"}
  ],
  "confidence": "low|medium|high",
  "summary": "Brief 1-2 sentence summary of what was detected in the photos"
}

CRITICAL: The "photoCategories" array MUST have exactly ${photos.length} entries — one for each photo, in the same order they were provided (Photo 1 = index 0, Photo 2 = index 1, etc.).

Remember: ONLY fill checklist fields you can actually observe in the photos. Empty string "" for anything not visible. Be accurate, not speculative.`;

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

  let jsonText = textBlock.text.trim();
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }

  const parsed: AutoFillResult = JSON.parse(jsonText);
  return parsed;
}
