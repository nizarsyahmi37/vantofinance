import { createClient, http, publicActions, walletActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { tempoModerato } from "viem/chains";
import { tempoActions } from "viem/tempo";

/**
 * Create a server-side Tempo client for the agent wallet.
 * Used for background memo watching and server-side operations.
 */
export function createAgentClient() {
  const privateKey = process.env.AGENT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("AGENT_PRIVATE_KEY is not set");
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);

  return createClient({
    account,
    chain: tempoModerato,
    transport: http(),
  })
    .extend(publicActions)
    .extend(walletActions)
    .extend(tempoActions());
}

/**
 * Create a read-only public client for querying the chain.
 */
export function createPublicTempoClient() {
  return createClient({
    chain: tempoModerato,
    transport: http(),
  })
    .extend(publicActions)
    .extend(tempoActions());
}

export const TEMPO_CHAIN_ID = 42431;
export const TEMPO_RPC_URL = "https://rpc.moderato.tempo.xyz";
export const TEMPO_EXPLORER = "https://explore.tempo.xyz";
