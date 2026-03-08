import Anthropic from "@anthropic-ai/sdk";
import type { RiskAnalysis, SiteDetails } from "./risk-scoring";

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
    model: "claude-sonnet-4-6-20250514",
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

  const parsed = JSON.parse(textBlock.text);

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
