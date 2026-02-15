import { PrivyClient } from "@privy-io/server-auth";

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

/**
 * Resolve an email, phone, or wallet address to a wallet address.
 * If the user doesn't exist in Privy, creates one with an embedded wallet.
 * Returns the wallet address or null if resolution fails.
 */
export async function resolveWallet(
  identifier: string
): Promise<string | null> {
  if (identifier.startsWith("0x")) return identifier;

  try {
    const user = await findOrCreateUser(identifier);

    const wallet = (user as any).linkedAccounts?.find(
      (account: any) =>
        account.type === "wallet" && account.chainType === "ethereum"
    );

    return wallet?.address || null;
  } catch (error) {
    console.error("[privy] resolveWallet error:", error);
    return null;
  }
}

async function findOrCreateUser(identifier: string) {
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
      linkedAccounts: [{ type: "email", address: identifier }],
      createEthereumWallet: true,
    });
  } else {
    return privy.importUser({
      linkedAccounts: [{ type: "phone", number: identifier }],
      createEthereumWallet: true,
    });
  }
}

export { privy };
