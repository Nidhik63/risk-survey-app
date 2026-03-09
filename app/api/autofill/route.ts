import { NextRequest, NextResponse } from "next/server";
import { autoFillFromPhotos } from "@/lib/claude";
import type { TaggedPhoto } from "@/lib/survey-types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const photos = body.photos as TaggedPhoto[];

    if (!photos || photos.length === 0) {
      return NextResponse.json(
        { error: "At least one photo is required" },
        { status: 400 }
      );
    }

    if (photos.length > 20) {
      return NextResponse.json(
        { error: "Maximum 20 photos allowed" },
        { status: 400 }
      );
    }

    const result = await autoFillFromPhotos(photos);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Auto-fill error:", error);
    const message =
      error instanceof Error ? error.message : "Auto-fill failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
