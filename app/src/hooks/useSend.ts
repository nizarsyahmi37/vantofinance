"use client";

import { DEFAULT_TOKEN } from "@/lib/tempo/tokens";
import { useWallets } from "@privy-io/react-auth";
import { useState } from "react";
import { tempoModerato } from "viem/chains";
import { tempoActions } from "viem/tempo";
import {
  createWalletClient,
  custom,
  parseUnits,
  type Address,
  type Hex,
} from "viem";

export function useSend() {
  const { wallets } = useWallets();
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const send = async (to: string, amount: string, memo: Hex) => {
    if (isSending) return;
    setIsSending(true);
    setError(null);
    setTxHash(null);

    const wallet = wallets[0];
    if (!wallet?.address) {
      const errMsg = "No active wallet";
      setError(errMsg);
      setIsSending(false);
      throw new Error(errMsg);
    }

    try {
      const provider = await wallet.getEthereumProvider();
      const client = createWalletClient({
        account: wallet.address as Address,
        chain: tempoModerato,
        transport: custom(provider),
      }).extend(tempoActions());

      const metadata = await client.token.getMetadata({
        token: DEFAULT_TOKEN,
      });

      // Resolve recipient address
      const recipient = await resolveAddress(to);

      const { receipt } = await client.token.transferSync({
        to: recipient,
        amount: parseUnits(amount, metadata.decimals),
        memo,
        token: DEFAULT_TOKEN,
        feePayer: true,
      });

      setTxHash(receipt.transactionHash);
      return receipt.transactionHash;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send";
      setError(errorMessage);
      throw err;
    } finally {
      setIsSending(false);
    }
  };

  return {
    send,
    isSending,
    error,
    txHash,
    reset: () => {
      setError(null);
      setTxHash(null);
    },
  };
}

async function resolveAddress(to: string): Promise<Address> {
  if (to.startsWith("0x")) return to as Address;

  const res = await fetch("/api/find", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: to }),
  });

  if (!res.ok) {
    throw new Error("Failed to find user");
  }

  const data = (await res.json()) as { address: Address };
  return data.address;
}
