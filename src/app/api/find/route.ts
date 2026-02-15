import { resolveWallet } from "@/lib/privy";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const findSchema = z.object({
  identifier: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = findSchema.parse(body);
    const { identifier } = payload;

    const address = await resolveWallet(identifier);

    if (!address) {
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      address,
      identifier,
      identifierType: identifier.includes("@") ? "email" : "phone",
    });
  } catch (error) {
    console.error("Error in /api/find:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
