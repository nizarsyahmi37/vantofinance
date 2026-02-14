import { PrivyClient } from "@privy-io/server-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

const findSchema = z.object({
  identifier: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = findSchema.parse(body);
    const { identifier } = payload;

    const user = await getUser(identifier);

    const wallet = (user as any).linked_accounts?.find(
      (account: any) =>
        account.type === "wallet" && account.chain_type === "ethereum"
    );

    if (!wallet || !wallet.address) {
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      address: wallet.address,
      identifier,
      identifierType: identifier.includes("@") ? "email" : "phone",
      userId: (user as any).id,
    });
  } catch (error) {
    console.error("Error in /api/find:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function getUser(identifier: string) {
  // Try to find existing user first
  try {
    if (identifier.includes("@")) {
      const user = await privy.getUserByEmail(identifier);
      if (user) return user;
    } else {
      const user = await privy.getUserByPhoneNumber(identifier);
      if (user) return user;
    }
  } catch {
    // User not found, will create below
  }

  // Create new user with embedded wallet
  if (identifier.includes("@")) {
    return privy.importUser({
      linkedAccounts: [
        { type: "email", address: identifier },
      ],
      createEthereumWallet: true,
    });
  } else {
    return privy.importUser({
      linkedAccounts: [
        { type: "phone", number: identifier },
      ],
      createEthereumWallet: true,
    });
  }
}
