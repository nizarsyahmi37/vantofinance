import type { Address } from "viem";

export const TOKENS = {
  alphaUsd: "0x20c0000000000000000000000000000000000001" as Address,
  betaUsd: "0x20c0000000000000000000000000000000000002" as Address,
  pathUsd: "0x20c0000000000000000000000000000000000000" as Address,
} as const;

export const TOKEN_NAMES: Record<string, string> = {
  [TOKENS.alphaUsd]: "AlphaUSD",
  [TOKENS.betaUsd]: "BetaUSD",
  [TOKENS.pathUsd]: "PathUSD",
};

export const DEFAULT_TOKEN = TOKENS.alphaUsd;
export const TOKEN_DECIMALS = 6;
