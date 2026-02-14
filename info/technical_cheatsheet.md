# Technical Cheatsheet

---

[Tempo](https://tempo.xyz/) is a purpose-built Layer 1 blockchain optimized for payments.

It enshrines features like [token management](https://docs.tempo.xyz/protocol/tip20/overview), [Fee AMM](https://docs.tempo.xyz/protocol/fees), and a [stablecoin DEX](https://docs.tempo.xyz/protocol/exchange) directly into the protocol, as well as a [Tempo transaction type](https://docs.tempo.xyz/protocol/transactions) with support for batch calls, fee sponsorship, configurable fee tokens, concurrent transactions, access keys, and scheduled execution.

## Setup & Prerequisites

### Network Connection

[See more here](https://docs.tempo.xyz/quickstart/connection-details#direct-connection-details)

| Property | Value |
| --- | --- |
| **Network Name** | Tempo Testnet (Moderato) |
| **Chain ID** | **42431** |
| **Currency** | `USD` |
| **RPC URL** | `https://rpc.moderato.tempo.xyz` |
| **Block Explorer** | [explore.tempo.xyz](https://explore.tempo.xyz/) |

### Installation

```bash
npm install tempo.ts viem @privy-io/react-auth @tanstack/react-query

```

### Testnet Tokens

| Token | Address |
| --- | --- |
| AlphaUSD | `0x20c0000000000000000000000000000000000001` |
| BetaUSD | `0x20c0000000000000000000000000000000000002` |
| pathUSD (DEX quote) | `0x20c0000000000000000000000000000000000000` |

## Chains

The following Tempo chains are available:

```jsx
import {
  tempoDevnet, 
  tempoLocalnet, 
  tempoModerato, 
} from 'viem/chains'
```

### Client Setup ([Viem](https://www.notion.so/Canteen-x-Tempo-Hackathon-2e298ea5579181898744c726fca2d48b?pvs=21))

```tsx
import { createClient, http, publicActions, walletActions } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { tempoModerato } from 'viem/chains'
import { tempoActions } from 'viem/tempo'
 
export const client = createClient({
  account: privateKeyToAccount('0x...'),
  chain: tempoModerato,
  transport: http(),
})
  .extend(publicActions)
  .extend(walletActions)
  .extend(tempoActions())
```

### Client Setup ([Wagmi](https://wagmi.sh/tempo/getting-started#use-wagmi-hooks))

```tsx
import { createConfig, http } from 'wagmi'
import { tempo } from 'wagmi/chains'
import { KeyManager, webAuthn } from 'wagmi/tempo'

export const config = createConfig({
  connectors: [
    webAuthn({
      keyManager: KeyManager.localStorage(),
    }),
  ],
  chains: [tempo],
  multiInjectedProviderDiscovery: false,
  transports: {
    [tempo.id]: http(),
  },
})
```

### Get Testnet Funds

Head over to the [Tempo Faucet](https://www.notion.so/Canteen-x-Tempo-Hackathon-2e298ea5579181898744c726fca2d48b?pvs=21) and get test stablecoins on Tempo testnet.

### Test Wallets

<aside>
💡

These are a community resource, so please do not abuse. You can always spin up your own wallets.

</aside>

Each of these wallets have 1,000,000 of BetaUSD, AlphaUSD, ThetaUSD and PathUSD.

```jsx
--- Wallet 1 ---
Address: 0x031891A61200FedDd622EbACC10734BC90093B2A
Private Key: 0x2b9e3b8a095940cf3461e27bfb2bebb498df9a6381b76b9f9c48c9bbdc3c8192
```

```jsx
--- Wallet 2 ---
Address: 0xAcF8dBD0352a9D47135DA146EA5DbEfAD58340C4
Private Key: 0xf3c009932cfe5e0b20db6c959e28e3546047cf70309d0f2ac5d38ee14527739a
```

```jsx
—- Wallet 3 ---
Address: 0x41A75fc9817AF9F2DB0c0e58C71Bc826339b3Acb
Private Key: 0xf804bb2ff55194ce6a62de31219d08fff6fd67fbaa68170e3dc8234035cad108
```

```jsx
--- Wallet 4 ---
Address: 0x88FB1167B01EcE2CAEe65c4E193Ba942D6F73d70
Private Key: 0xb0803108bb5ce052f7f50655d0078af5c8edfe48a6ffa7b3e8b2add0292cffc9
```

```jsx
--- Wallet 5 ---
Address: 0xe945797ebC84F1953Ff8131bC29277e567b881D4
Private Key: 0x097761d893afc5d6669c0b99c8d6ca9ce1c2fa88bd84de5a58d28713cd6a7121
```

---

## Track 1: Consumer Payments

### Privy: Server-Side User Lookup

Look up or create a user by email/phone. Creates an embedded wallet automatically.

```tsx
// /api/find/route.ts
import { PrivyClient } from "@privy-io/node";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const privy = new PrivyClient({
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  appSecret: process.env.PRIVY_APP_SECRET,
});

const findSchema = z.object({
  identifier: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = findSchema.parse(body);
    const { identifier } = payload;

    // Get or create user
    const user = await getUser(identifier);

    // Get user's wallet
    const wallet = user.linked_accounts?.find(
      (account) =>
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
      userId: user.id,
    });
  } catch (error) {
    console.error("Error in /api/find:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get a user by phone number or email by querying Privy's user management API
// If a user doesn't exist, a new user will be created.
async function getUser(identifier: string) {
  if (!identifier.includes("@")) {
    const user = await privy
      .users()
      .getByPhoneNumber({ number: identifier })
      .catch(() => null);
    if (user) return user;

    return privy.users().create({
      linked_accounts: [{ type: "phone", number: identifier }],
      wallets: [{ chain_type: "ethereum" }],
    });
  } else {
    const user = await privy
      .users()
      .getByEmailAddress({ address: identifier })
      .catch(() => null);
    if (user) return user;

    return privy.users().create({
      linked_accounts: [{ type: "email", address: identifier }],
      wallets: [{ chain_type: "ethereum" }],
    });
  }
}
```

### Privy: Client-Side Send Hook

```tsx
// hooks/useSend.ts
import { alphaUsd } from "@/constants";
import { toViemAccount, useWallets } from "@privy-io/react-auth";
import { useState } from "react";
import { tempo } from "tempo.ts/chains";
import { tempoActions } from "tempo.ts/viem";
import {
  createWalletClient,
  custom,
  parseUnits,
  stringToHex,
  walletActions,
  type Address,
} from "viem";

export function useSend() {
  const { wallets } = useWallets();
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const send = async (to: string, amount: string, memo: string = "") => {
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
        chain: tempo({ feeToken: alphaUsd }),
        transport: custom(provider),
      })
        .extend(walletActions)
        .extend(tempoActions());

      const metadata = await client.token.getMetadata({
        token: alphaUsd,
      });
      const recipient = await getAddress(to);
      const { receipt } = await client.token.transferSync({
        to: recipient,
        amount: parseUnits(amount, metadata.decimals),
        memo: stringToHex(memo || to),
        token: alphaUsd,
      });

      setTxHash(receipt.transactionHash);
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

async function getAddress(to: string): Promise<Address> {
  const res = await fetch("/api/find", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ identifier: to }),
  });

  if (!res.ok) {
    throw new Error("Failed to find user");
  }

  const data = (await res.json()) as { address: Address };
  return data.address;
}
```

### React: Payment Form Component

```tsx
import { Hooks } from "tempo.ts/wagmi"
import { parseUnits, stringToHex, pad } from "viem"

function SendPayment() {
  const sendPayment = Hooks.token.useTransferSync()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    sendPayment.mutate({
      amount: parseUnits(formData.get("amount") as string, 6),
      to: formData.get("recipient") as `0x${string}`,
      token: "0x20c0000000000000000000000000000000000001",
      memo: pad(stringToHex(formData.get("memo") as string || ""), { size: 32 }),
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="recipient" placeholder="Email, phone, or 0x..." required />
      <input name="amount" type="number" step="0.01" placeholder="100.00" required />
      <input name="memo" placeholder="Dinner last night - thanks!" />

      <button type="submit" disabled={sendPayment.isPending}>
        {sendPayment.isPending ? "Sending..." : "Send Payment"}
      </button>

      {sendPayment.data && (
        <a href={`https://explore.tempo.xyz/tx/${sendPayment.data.receipt.transactionHash}`}>
          View on Explorer
        </a>
      )}

      {sendPayment.error && (
        <div className="error">{sendPayment.error.message}</div>
      )}
    </form>
  )
}

```

<aside>
💡

Checkout the full example NextJS project implementation [here](https://github.com/aashidham/privy-next-tempo).

</aside>

### Basic Transfer with Memo

```tsx
import { parseUnits, stringToHex, pad } from 'viem'

// Simple transfer
const { receipt } = await client.token.transferSync({
  amount: parseUnits('100', 6),
  to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbb',
  token: '0x20c0000000000000000000000000000000000001',
})

// Transfer with memo (for reconciliation)
const invoiceId = pad(stringToHex('INV-12345'), { size: 32 })

const { receipt } = await client.token.transferSync({
  amount: parseUnits('100', 6),
  to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbb',
  token: '0x20c0000000000000000000000000000000000001',
  memo: invoiceId,
})

```

### Fee Sponsorship (Gasless Transactions)

```tsx
// Option 1: Use configured fee payer service
const { receipt } = await client.token.transferSync({
  amount: parseUnits("100", 6),
  to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbb",
  token: "0x20c0000000000000000000000000000000000001",
  feePayer: true, // Uses <https://sponsor.testnet.tempo.xyz>
})

// Option 2: Sponsor with specific account
import { privateKeyToAccount } from "viem/accounts"

const sponsorAccount = privateKeyToAccount("0x...")

const { receipt } = await client.token.transferSync({
  amount: parseUnits("100", 6),
  to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbb",
  token: "0x20c0000000000000000000000000000000000001",
  feePayer: sponsorAccount,
})

```

### Parallel Transactions (2D Nonces)

```tsx
import { Actions } from "tempo.ts/wagmi"
import { parseUnits } from "viem"

const alphaUsd = "0x20c0000000000000000000000000000000000001"

// Option 1: Random nonce keys (simple, slightly more gas)
const [hash1, hash2, hash3] = await Promise.all([
  Actions.token.transfer(config, {
    amount: parseUnits("100", 6),
    to: "0xRecipient1...",
    token: alphaUsd,
    nonceKey: "random",
  }),
  Actions.token.transfer(config, {
    amount: parseUnits("50", 6),
    to: "0xRecipient2...",
    token: alphaUsd,
    nonceKey: "random",
  }),
  Actions.token.transfer(config, {
    amount: parseUnits("75", 6),
    to: "0xRecipient3...",
    token: alphaUsd,
    nonceKey: "random",
  }),
])

// Option 2: Explicit nonce keys (more gas efficient for high-throughput)
const account = "0x..."

const [nonce1, nonce2] = await Promise.all([
  Actions.nonce.getNonce(config, { account, nonceKey: 1n }),
  Actions.nonce.getNonce(config, { account, nonceKey: 2n }),
])

const [hash1, hash2] = await Promise.all([
  Actions.token.transfer(config, {
    amount: parseUnits("100", 6),
    to: "0xRecipient1...",
    token: alphaUsd,
    nonceKey: 1n,
    nonce: Number(nonce1),
  }),
  Actions.token.transfer(config, {
    amount: parseUnits("50", 6),
    to: "0xRecipient2...",
    token: alphaUsd,
    nonceKey: 2n,
    nonce: Number(nonce2),
  }),
])

```

### Batch Transactions (Atomic)

```tsx
import { encodeFunctionData, parseUnits } from "viem"
import { Abis } from "viem/tempo"

const tokenABI = Abis.tip20
const alphaUsd = "0x20c0000000000000000000000000000000000001"

// All transfers succeed or all fail together
const hash = await client.sendTransaction({
  calls: [
    {
      to: alphaUsd,
      data: encodeFunctionData({
        abi: tokenABI,
        functionName: "transfer",
        args: ["0xRecipient1...", parseUnits("100", 6)],
      }),
    },
    {
      to: alphaUsd,
      data: encodeFunctionData({
        abi: tokenABI,
        functionName: "transfer",
        args: ["0xRecipient2...", parseUnits("50", 6)],
      }),
    },
    {
      to: alphaUsd,
      data: encodeFunctionData({
        abi: tokenABI,
        functionName: "transfer",
        args: ["0xRecipient3...", parseUnits("75", 6)],
      }),
    },
  ],
})

```

### Watch Incoming Payments

```tsx
import { parseEventLogs } from "viem"
import { Abis } from "viem/tempo"

// Watch for payments with memo (for reconciliation)
const unwatch = client.watchEvent({
  address: "0x20c0000000000000000000000000000000000001",
  event: {
    type: "event",
    name: "TransferWithMemo",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256" },
      { name: "memo", type: "bytes32", indexed: true },
    ],
  },
  onLogs: (logs) => {
    logs.forEach((log) => {
      if (log.args.to === myAddress) {
        const invoiceId = log.args.memo
        const amount = log.args.value
        markInvoiceAsPaid(invoiceId, amount)
      }
    })
  },
})

// Cleanup
unwatch()

```

---

## Track 2: Stablecoin Infrastructure

### Tick System Basics

Prices are specified using ticks with 0.1 basis point (0.001%) precision:

**Tick Formula:** **`tick = (price - 1) × 100_000`**

**Price Formula:** **`price = 1 + (tick / 100_000)`**

Where **`price`** is the token price in quote token units.

### **Example Tick Calculations**

| **Price** | **Tick** | **Calculation** |
| --- | --- | --- |
| **$0.9990** | -100 | (0.9990 - 1) × 100_000 = -100 |
| **$0.9998** | -20 | (0.9998 - 1) × 100_000 = -20 |
| **$1.0000** | 0 | (1.0000 - 1) × 100_000 = 0 |
| **$1.0002** | 20 | (1.0002 - 1) × 100_000 = 20 |
| **$1.0010** | 100 | (1.0010 - 1) × 100_000 = 100 |

### Get Tick Level

```jsx
import { client } from './viem.config'
import { Tick } from 'viem/tempo'
 
const level = await client.dex.getTickLevel({
  base: '0x20c0000000000000000000000000000000000001',
  tick: Tick.fromPrice('1.001'),
  isBid: true,
})
 
console.log('Tick level:', level)
```

### Execute Swap (Buy)

```tsx
import { Actions, Addresses } from 'viem/tempo'
import { Hooks } from 'wagmi/tempo'
import { formatUnits, parseUnits } from 'viem'
import { useSendCallsSync } from 'wagmi'
 
const alphaUsd = '0x20c0000000000000000000000000000000000001'
const betaUsd = '0x20c0000000000000000000000000000000000002'
 
function Buy() {
  const amount = parseUnits('10', 6)
 
  // How much AlphaUSD do I need to spend to receive 10 BetaUSD?
  const { data: quote } = Hooks.dex.useBuyQuote({
    tokenIn: alphaUsd,
    tokenOut: betaUsd,
    amountOut: amount,
  })
 
  // Calculate 0.5% slippage tolerance
  const slippageTolerance = 0.005
  const maxAmountIn = quote
    ? quote * BigInt(Math.floor((1 + slippageTolerance) * 1000)) / 1000n
    : 0n
 
  const sendCalls = useSendCallsSync()
 
  return (
    <div>
      <div>Quote: {formatUnits(quote, 6)}</div>
      <div>Max input (0.5% slippage): {formatUnits(maxAmountIn, 6)}</div>
      <button type="button" onClick={() => {
        const calls = [
          Actions.token.approve.call({
            amount: maxAmountIn, // Approve the max amount with slippage
            spender: Addresses.stablecoinDex,
            token: alphaUsd,
          }),
          Actions.dex.buy.call({ 
            amountOut: amount, 
            maxAmountIn, 
            tokenIn: alphaUsd, 
            tokenOut: betaUsd, 
          }), 
        ]
        sendCalls.sendCallsSync({ calls })
      }}>
        Execute Swap
      </button>
    </div>
  )
}
```

### Execute Swap (Sell)

```tsx
import { Actions, Addresses } from 'viem/tempo'
import { Hooks } from 'wagmi/tempo'
import { formatUnits, parseUnits } from 'viem'
import { useSendCallsSync } from 'wagmi'
 
const alphaUsd = '0x20c0000000000000000000000000000000000001'
const betaUsd = '0x20c0000000000000000000000000000000000002'
 
function Sell() {
  const amount = parseUnits('10', 6)
 
  // How much BetaUSD will I receive for 10 AlphaUSD?
  const { data: quote } = Hooks.dex.useSellQuote({
    tokenIn: alphaUsd,
    tokenOut: betaUsd,
    amountIn: amount,
  })
 
  // Calculate 0.5% slippage tolerance
  const slippageTolerance = 0.005
  const minAmountOut = quote
    ? quote * BigInt(Math.floor((1 - slippageTolerance) * 1000)) / 1000n
    : 0n
 
  const sendCalls = useSendCallsSync()
 
  return (
    <div>
      <div>Quote: {formatUnits(quote, 6)}</div>
      <div>Min output (0.5% slippage): {formatUnits(minAmountOut, 6)}</div>
      <button type="button" onClick={() => {
        const calls = [
          Actions.token.approve.call({
            amount, // Approve the exact amount being sold
            spender: Addresses.stablecoinDex,
            token: alphaUsd,
          }),
          Actions.dex.sell.call({ 
            amountIn: amount, 
            minAmountOut, 
            tokenIn: alphaUsd, 
            tokenOut: betaUsd, 
          }), 
        ]
        sendCalls.sendCallsSync({ calls })
      }}>
        Execute Swap
      </button>
    </div>
  )
}

```

### Place [Limit Order](https://viem.sh/tempo/actions/dex.place)

```tsx
import { parseUnits } from 'viem'
import { Tick } from 'viem/tempo'
import { client } from './viem.config'
 
const { orderId, receipt } = await client.dex.placeSync({
  amount: parseUnits('100', 6),
  tick: Tick.fromPrice('0.99'),
  token: '0x20c0000000000000000000000000000000000001',
  type: 'buy',
})
 
console.log('Order ID:', orderId)
```

### Place Flip Order ([Market Making](https://viem.sh/tempo/actions/dex.placeFlip))

```tsx
import { parseUnits } from 'viem'
import { Tick } from 'viem/tempo'
import { client } from './viem.config'
 
const { orderId, receipt } = await client.dex.placeFlipSync({
  amount: parseUnits('100', 6),
  flipTick: Tick.fromPrice('1.01'),
  tick: Tick.fromPrice('0.99'),
  token: '0x20c0000000000000000000000000000000000001',
  type: 'buy',
})
 
console.log('Flip order ID:', orderId)
```

### Query [Orderbook](https://viem.sh/tempo/actions/dex.getOrder)

```tsx
import { client } from './viem.config'
 
const order = await client.dex.getOrder({
  orderId: 123n,
})
 
console.log('Order details:', order)

```

### Watch DEX Events

```tsx
import { client } from './viem.config'

// Watch order fills
const unwatch = client.dex.watchOrderFilled({
  onOrderFilled: (args, log) => {
    console.log('Order filled:', args.orderId)
    console.log('Maker:', args.maker)
    console.log('Amount filled:', args.amountFilled)
    console.log('Partial fill:', args.partialFill)
  },
})
 
// Later, stop watching
unwatch()

// Watch new orders
 const unwatch = client.dex.watchOrderPlaced({
  onOrderPlaced: (args, log) => {
    console.log('Order placed:', args.orderId)
    console.log('Maker:', args.maker)
    console.log('Token:', args.token)
    console.log('Amount:', args.amount)
  },
})
 
// Later, stop watching
unwatch()

// Watch flip orders
const unwatch = client.dex.watchFlipOrderPlaced({
  onFlipOrderPlaced: (args, log) => {
    console.log('Flip order placed:', args.orderId)
    console.log('Maker:', args.maker)
    console.log('Amount:', args.amount)
  },
})
 
// Later, stop watching
unwatch()
```

### Create TIP-20 Stablecoin

```tsx
import { client } from './viem.config'
 
const { admin, receipt, token, tokenId } = await client.token.createSync({
  admin: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbb',
  currency: 'USD',
  name: 'My Company USD',
  symbol: 'CUSD',
})
 
console.log('Address:', token)
console.log('Admin:', admin)console.log('ID:', tokenId)

```

### Solidity: Payment Processor Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ITIP20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferWithMemo(address to, uint256 amount, bytes32 memo) external;
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IStablecoinExchange {
    function swapExactAmountIn(
        address tokenIn,
        address tokenOut,
        uint128 amountIn,
        uint128 minAmountOut
    ) external returns (uint128 amountOut);

    function quoteSwapExactAmountIn(
        address tokenIn,
        address tokenOut,
        uint128 amountIn
    ) external view returns (uint128 amountOut);
}

contract PaymentProcessor {
    ITIP20 public immutable token;
    IStablecoinExchange public immutable dex;

    mapping(bytes32 => bool) public paidInvoices;

    event PaymentReceived(
        address indexed payer,
        uint256 amount,
        bytes32 indexed invoiceId
    );

    constructor(address _token, address _dex) {
        token = ITIP20(_token);
        dex = IStablecoinExchange(_dex);
    }

    function payInvoice(bytes32 invoiceId, uint256 amount) external {
        require(!paidInvoices[invoiceId], "Already paid");

        token.transferWithMemo(address(this), amount, invoiceId);
        paidInvoices[invoiceId] = true;

        emit PaymentReceived(msg.sender, amount, invoiceId);
    }

    // Accept any stablecoin, auto-convert to preferred token
    function payInvoiceAnyToken(
        bytes32 invoiceId,
        address paymentToken,
        uint128 paymentAmount,
        uint128 minReceived
    ) external {
        require(!paidInvoices[invoiceId], "Already paid");

        ITIP20(paymentToken).transferFrom(msg.sender, address(this), paymentAmount);

        uint128 received = dex.swapExactAmountIn(
            paymentToken,
            address(token),
            paymentAmount,
            minReceived
        );

        paidInvoices[invoiceId] = true;
        emit PaymentReceived(msg.sender, received, invoiceId);
    }
}

```

---

## Track 3: AI Agents & Automation

### Create Agent Wallet

```tsx
import { createClient, http } from "viem"
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts"
import { tempoTestnet } from "viem/chains"
import { tempoActions } from "viem/tempo"

function createAgentWallet() {
  const privateKey = generatePrivateKey()
  const account = privateKeyToAccount(privateKey)

  const client = createClient({
    account,
    chain: tempoTestnet,
    transport: http(),
  }).extend(tempoActions())

  return { client, account, privateKey }
}

const agent = createAgentWallet()
console.log("Agent address:", agent.account.address)

```

### Agent-to-Agent Payments

```tsx
import { parseUnits, stringToHex, pad } from "viem"

interface AgentServiceRequest {
  serviceAgent: `0x${string}`
  service: string
  requestId: string
  price: bigint
}

async function payForAgentService(
  client: ReturnType<typeof createClient>,
  request: AgentServiceRequest
) {
  const memo = pad(
    stringToHex(`agent:${request.service}:${request.requestId}`),
    { size: 32 }
  )

  const { receipt } = await client.token.transferSync({
    to: request.serviceAgent,
    amount: request.price,
    token: "0x20c0000000000000000000000000000000000001",
    memo,
  })

  return {
    txHash: receipt.transactionHash,
    requestId: request.requestId,
  }
}

// Example: Pay data provider $0.10 per request
await payForAgentService(agentClient, {
  serviceAgent: "0xDataProviderAgent...",
  service: "weather-forecast-7day",
  requestId: "req_abc123",
  price: parseUnits("0.10", 6),
})

```

### Autonomous Trading Agent

```tsx
import { Actions, Tick } from "tempo.ts/viem"
import { parseUnits } from "viem"

interface TradingSignal {
  action: "buy" | "sell" | "hold"
  token: `0x${string}`
  amount: bigint
  confidence: number
  reasoning: string
}

async function executeTradingAgent(
  client: ReturnType<typeof createClient>,
  signal: TradingSignal
) {
  if (signal.confidence < 0.8 || signal.action === "hold") {
    return { executed: false, reason: "Low confidence or hold" }
  }

  const quote = "0x20c0000000000000000000000000000000000000"

  if (signal.action === "buy") {
    const amountIn = await Actions.dex.getBuyQuote(client, {
      tokenIn: quote,
      tokenOut: signal.token,
      amountOut: signal.amount,
    })

    const maxAmountIn = (amountIn * 1005n) / 1000n

    const { receipt } = await Actions.dex.buySync(client, {
      tokenIn: quote,
      tokenOut: signal.token,
      amountOut: signal.amount,
      maxAmountIn,
    })

    return {
      executed: true,
      action: "buy",
      txHash: receipt.transactionHash,
      reasoning: signal.reasoning,
    }
  }

  if (signal.action === "sell") {
    const amountOut = await Actions.dex.getSellQuote(client, {
      tokenIn: signal.token,
      tokenOut: quote,
      amountIn: signal.amount,
    })

    const minAmountOut = (amountOut * 995n) / 1000n

    const { receipt } = await Actions.dex.sellSync(client, {
      tokenIn: signal.token,
      tokenOut: quote,
      amountIn: signal.amount,
      minAmountOut,
    })

    return {
      executed: true,
      action: "sell",
      txHash: receipt.transactionHash,
      reasoning: signal.reasoning,
    }
  }
}

// Trading loop
async function runTradingLoop() {
  while (true) {
    const signal = await getAITradingSignal()
    const result = await executeTradingAgent(agentClient, signal)

    await logAgentDecision({
      timestamp: Date.now(),
      signal,
      result,
    })

    await sleep(60_000)
  }
}

```

### Subscription Agent

```tsx
import { parseUnits, stringToHex, pad } from "viem"

interface Subscription {
  id: string
  recipient: `0x${string}`
  amount: bigint
  token: `0x${string}`
  intervalMs: number
  lastPayment: number
  active: boolean
}

class SubscriptionAgent {
  private subscriptions: Map<string, Subscription> = new Map()

  constructor(private client: ReturnType<typeof createClient>) {}

  addSubscription(sub: Omit<Subscription, "lastPayment">) {
    this.subscriptions.set(sub.id, { ...sub, lastPayment: 0 })
  }

  async processPayments() {
    const now = Date.now()

    for (const [id, sub] of this.subscriptions) {
      if (!sub.active) continue
      if (now - sub.lastPayment < sub.intervalMs) continue

      try {
        const { receipt } = await this.client.token.transferSync({
          to: sub.recipient,
          amount: sub.amount,
          token: sub.token,
          memo: pad(stringToHex(`subscription:${id}`), { size: 32 }),
        })

        sub.lastPayment = now
        console.log(`Subscription ${id} paid:`, receipt.transactionHash)
      } catch (error) {
        console.error(`Failed: ${id}`, error)
      }
    }
  }

  async runLoop(checkIntervalMs = 60_000) {
    while (true) {
      await this.processPayments()
      await sleep(checkIntervalMs)
    }
  }
}

// Usage
const subAgent = new SubscriptionAgent(agentClient)

subAgent.addSubscription({
  id: "netflix",
  recipient: "0xNetflix...",
  amount: parseUnits("15.99", 6),
  token: "0x20c0000000000000000000000000000000000001",
  intervalMs: 30 * 24 * 60 * 60 * 1000, // Monthly
  active: true,
})

subAgent.runLoop()

```

### Pay-per-API-Call Service

```tsx
import { parseUnits, stringToHex, pad, parseEventLogs } from "viem"
import { Abis } from "viem/tempo"

const API_WALLET = "0x..."
const PRICE_PER_CALL = parseUnits("0.001", 6) // $0.001

// Server: Verify payment before processing
async function handlePaidAPIRequest(req: Request) {
  const { paymentTx, query } = await req.json()

  const receipt = await client.getTransactionReceipt({ hash: paymentTx })

  const logs = parseEventLogs({
    abi: Abis.tip20,
    logs: receipt.logs,
    eventName: "TransferWithMemo",
  })

  const payment = logs[0]
  if (!payment || payment.args.to !== API_WALLET) {
    throw new Error("Invalid payment")
  }

  if (payment.args.value < PRICE_PER_CALL) {
    throw new Error("Insufficient payment")
  }

  const result = await processQuery(query)
  return Response.json({ result })
}

// Client: Pay then call
async function callPaidAPI(query: string) {
  const requestId = crypto.randomUUID()

  const { receipt } = await client.token.transferSync({
    to: API_WALLET,
    amount: PRICE_PER_CALL,
    token: "0x20c0000000000000000000000000000000000001",
    memo: pad(stringToHex(`api:${requestId}`), { size: 32 }),
  })

  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({
      paymentTx: receipt.transactionHash,
      query,
    }),
  })

  return response.json()
}
```

---

### Token Addresses (Testnet)

```tsx
const TOKENS = {
  alphaUsd: "0x20c0000000000000000000000000000000000001",
  betaUsd: "0x20c0000000000000000000000000000000000002",
  thetaUsd: "0x20c0000000000000000000000000000000000003",
  pathUsd: "0x20c0000000000000000000000000000000000000",
}
```

### Contract Addresses (Testnet)

```tsx
import { Addresses } from "viem/tempo"

Addresses.stablecoinExchange  // DEX
Addresses.tip20Factory        // Token factory
Addresses.tip403Registry      // Policy registry
```