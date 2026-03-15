import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { pin } = await req.json();
  const correctPin = process.env.ANALYST_PIN;

  if (!correctPin) {
    return NextResponse.json(
      { valid: false, error: "PIN not configured" },
      { status: 500 }
    );
  }

  if (pin === correctPin) {
    return NextResponse.json({ valid: true });
  }

  return NextResponse.json({ valid: false, error: "Invalid PIN" });
}
