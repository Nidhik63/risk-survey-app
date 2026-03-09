import { NextRequest, NextResponse } from "next/server";
import { analyzeRiskImages } from "@/lib/claude";
import { analyzeRiskImagesV2 } from "@/lib/claude";
import type { SiteDetails } from "@/lib/risk-scoring";
import type { SurveyDataV2 } from "@/lib/survey-types";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured. Please add ANTHROPIC_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    // V2 survey data
    if (body.version === 2) {
      const surveyData = body.surveyData as SurveyDataV2;

      if (!surveyData?.sectionA?.address) {
        return NextResponse.json(
          { error: "Property address is required" },
          { status: 400 }
        );
      }

      if (!surveyData?.sectionA?.surveyorName) {
        return NextResponse.json(
          { error: "Surveyor name is required" },
          { status: 400 }
        );
      }

      const analysis = await analyzeRiskImagesV2(surveyData);
      return NextResponse.json({ version: 2, analysis });
    }

    // V1 fallback
    const { images, siteDetails } = body as {
      images: string[];
      siteDetails: SiteDetails;
    };

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    if (images.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 images allowed" },
        { status: 400 }
      );
    }

    if (!siteDetails?.address) {
      return NextResponse.json(
        { error: "Property address is required" },
        { status: 400 }
      );
    }

    const analysis = await analyzeRiskImages(images, siteDetails);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analysis error:", error);
    const message =
      error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
