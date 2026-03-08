import { NextRequest, NextResponse } from "next/server";
import { analyzeRiskImages } from "@/lib/claude";
import type { SiteDetails } from "@/lib/risk-scoring";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured. Please add ANTHROPIC_API_KEY to .env.local" },
        { status: 500 }
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
