import { stringToHex, hexToString, pad, type Hex } from "viem";

export type MemoType = "INV" | "EXP" | "SPL" | "BET" | "PAY";

export interface DecodedMemo {
  type: MemoType;
  payload: string;
  raw: Hex;
}

const MEMO_PREFIXES: MemoType[] = ["INV", "EXP", "SPL", "BET", "PAY"];

/**
 * Encode a structured memo into a 32-byte hex string.
 * Format: TYPE:payload (padded to 32 bytes)
 */
export function encodeMemo(type: MemoType, payload: string): Hex {
  const memoString = `${type}:${payload}`;
  // Truncate to 32 bytes max
  const truncated = memoString.slice(0, 32);
  return pad(stringToHex(truncated), { size: 32 });
}

/**
 * Decode a 32-byte hex memo into its type and payload.
 */
export function decodeMemo(raw: Hex): DecodedMemo | null {
  try {
    const decoded = hexToString(raw, { size: 32 }).replace(/\0+$/, "");

    for (const prefix of MEMO_PREFIXES) {
      if (decoded.startsWith(`${prefix}:`)) {
        return {
          type: prefix,
          payload: decoded.slice(prefix.length + 1),
          raw,
        };
      }
    }

    // Unknown memo format - treat as PAY
    return {
      type: "PAY",
      payload: decoded,
      raw,
    };
  } catch {
    return null;
  }
}

/**
 * Generate a short unique hash for invoice memos.
 */
export function generateInvoiceMemoHash(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a split group ID.
 */
export function generateSplitId(): string {
  return `s${Date.now().toString(36)}`;
}

/**
 * Generate a market ID.
 */
export function generateMarketId(): string {
  return `m${Date.now().toString(36)}`;
}
