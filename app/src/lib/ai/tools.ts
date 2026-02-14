import { tool } from "ai";
import { z } from "zod";
import { getServerClient } from "@/lib/supabase/client";
import { encodeMemo, generateInvoiceMemoHash, generateSplitId, generateMarketId } from "@/lib/tempo/memo";
import { DEFAULT_TOKEN, TOKEN_NAMES, TOKEN_DECIMALS } from "@/lib/tempo/tokens";
import { createPublicTempoClient, TEMPO_EXPLORER } from "@/lib/tempo/client";
import { formatUnits } from "viem";

export function createTools(userWallet: string) {
  const supabase = getServerClient();
  return {
    send_payment: tool({
      description: "Send a stablecoin payment to someone via email, phone number, or wallet address. Returns the transaction details for the frontend to execute.",
      parameters: z.object({
        to: z.string().describe("Recipient email, phone number, or 0x wallet address"),
        amount: z.string().describe("Amount in dollars (e.g. '50' or '10.50')"),
        memo: z.string().optional().describe("Optional note for the payment"),
      }),
      execute: async ({ to, amount, memo }) => {
        const memoText = memo || to;
        const encodedMemo = encodeMemo("PAY", memoText.slice(0, 28));

        // Resolve recipient address if needed
        let recipientAddress = to;
        let recipientDisplay = to;

        if (!to.startsWith("0x")) {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/find`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ identifier: to }),
            });
            if (res.ok) {
              const data = await res.json();
              recipientAddress = data.address;
              recipientDisplay = to;
            } else {
              return { success: false, error: `Could not find user: ${to}` };
            }
          } catch {
            return { success: false, error: `Failed to look up user: ${to}` };
          }
        }

        // Record as expense
        await supabase.from("expenses").insert({
          user_wallet: userWallet,
          tx_hash: "pending",
          amount: parseFloat(amount),
          token: DEFAULT_TOKEN,
          category: "Other",
          memo_raw: memoText,
          description: memo || `Payment to ${recipientDisplay}`,
          direction: "out",
          counterparty: recipientDisplay,
        });

        return {
          success: true,
          action: "send_payment",
          to: recipientAddress,
          toDisplay: recipientDisplay,
          amount,
          memo: encodedMemo,
          token: DEFAULT_TOKEN,
          message: `Ready to send $${amount} to ${recipientDisplay}`,
        };
      },
    }),

    create_invoice: tool({
      description: "Create an invoice that can be shared with someone for payment. The invoice will be auto-reconciled when paid.",
      parameters: z.object({
        recipient: z.string().describe("Recipient email, phone, or wallet address"),
        amount: z.string().describe("Invoice amount in dollars"),
        description: z.string().describe("What the invoice is for"),
        due_date: z.string().optional().describe("Due date in YYYY-MM-DD format"),
      }),
      execute: async ({ recipient, amount, description, due_date }) => {
        const memoHash = generateInvoiceMemoHash();

        // Resolve recipient wallet
        let recipientWallet = null;
        if (recipient.startsWith("0x")) {
          recipientWallet = recipient;
        } else {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/find`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ identifier: recipient }),
            });
            if (res.ok) {
              const data = await res.json();
              recipientWallet = data.address;
            }
          } catch { /* recipient wallet optional */ }
        }

        const { data, error } = await supabase.from("invoices").insert({
          creator_wallet: userWallet,
          recipient_identifier: recipient,
          recipient_wallet: recipientWallet,
          amount: parseFloat(amount),
          token: DEFAULT_TOKEN,
          memo_hash: memoHash,
          description,
          status: "pending",
          due_date: due_date || null,
        }).select().single();

        if (error) {
          return { success: false, error: "Failed to create invoice" };
        }

        return {
          success: true,
          invoice: data,
          memoHash,
          paymentMemo: encodeMemo("INV", memoHash),
          message: `Invoice created for $${amount} to ${recipient}. Memo code: INV:${memoHash}. When they pay with this memo, it will be automatically reconciled.`,
        };
      },
    }),

    check_balance: tool({
      description: "Check the user's token balance on Tempo",
      parameters: z.object({
        token: z.string().optional().describe("Token address (defaults to AlphaUSD)"),
      }),
      execute: async ({ token }) => {
        try {
          const client = createPublicTempoClient();
          const tokenAddr = (token || DEFAULT_TOKEN) as `0x${string}`;
          const balance = await client.token.getBalance({
            token: tokenAddr,
            account: userWallet as `0x${string}`,
          });

          const tokenName = TOKEN_NAMES[tokenAddr.toLowerCase()] || TOKEN_NAMES[tokenAddr] || "Unknown Token";
          const formatted = formatUnits(balance, TOKEN_DECIMALS);

          return {
            success: true,
            balance: formatted,
            token: tokenName,
            raw: balance.toString(),
            message: `Your ${tokenName} balance is $${parseFloat(formatted).toFixed(2)}`,
          };
        } catch {
          return { success: false, error: "Failed to fetch balance" };
        }
      },
    }),

    list_invoices: tool({
      description: "List the user's invoices, either sent by them or received",
      parameters: z.object({
        direction: z.enum(["sent", "received"]).describe("Whether to list invoices sent or received"),
        status: z.enum(["pending", "paid", "overdue", "all"]).optional().describe("Filter by status"),
      }),
      execute: async ({ direction, status }) => {
        let query = supabase.from("invoices").select("*");

        if (direction === "sent") {
          query = query.eq("creator_wallet", userWallet);
        } else {
          query = query.eq("recipient_wallet", userWallet);
        }

        if (status && status !== "all") {
          query = query.eq("status", status);
        }

        query = query.order("created_at", { ascending: false }).limit(20);

        const { data, error } = await query;

        if (error) {
          return { success: false, error: "Failed to fetch invoices" };
        }

        return {
          success: true,
          invoices: data || [],
          count: data?.length || 0,
          message: `Found ${data?.length || 0} ${status !== "all" ? status + " " : ""}${direction} invoices.`,
        };
      },
    }),

    list_expenses: tool({
      description: "List the user's expenses, optionally filtered by category or date range",
      parameters: z.object({
        category: z.string().optional().describe("Filter by category (Food, Transport, Shopping, etc.)"),
        days: z.number().optional().describe("Number of past days to include (default 30)"),
      }),
      execute: async ({ category, days }) => {
        let query = supabase
          .from("expenses")
          .select("*")
          .eq("user_wallet", userWallet)
          .order("created_at", { ascending: false });

        if (category) {
          query = query.eq("category", category);
        }

        const daysBack = days || 30;
        const since = new Date();
        since.setDate(since.getDate() - daysBack);
        query = query.gte("created_at", since.toISOString());

        const { data, error } = await query;

        if (error) {
          return { success: false, error: "Failed to fetch expenses" };
        }

        const total = (data || []).reduce((sum, e) => sum + e.amount, 0);
        const byCategory: Record<string, number> = {};
        (data || []).forEach((e) => {
          byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
        });

        return {
          success: true,
          expenses: data || [],
          total: total.toFixed(2),
          byCategory,
          count: data?.length || 0,
          message: `Found ${data?.length || 0} expenses totaling $${total.toFixed(2)} in the last ${daysBack} days.`,
        };
      },
    }),

    split_bill: tool({
      description: "Create a bill split among multiple people. Each person will owe their share.",
      parameters: z.object({
        title: z.string().describe("What the split is for (e.g. 'Dinner at Sushi Place')"),
        total_amount: z.string().describe("Total amount to split in dollars"),
        participants: z.array(z.string()).describe("List of participant emails, phones, or wallet addresses (including yourself if applicable)"),
      }),
      execute: async ({ title, total_amount, participants }) => {
        const splitId = generateSplitId();
        const perPerson = parseFloat(total_amount) / participants.length;

        // Create split record
        const { data: split, error: splitError } = await supabase.from("splits").insert({
          creator_wallet: userWallet,
          title,
          total_amount: parseFloat(total_amount),
          token: DEFAULT_TOKEN,
          split_id: splitId,
          status: "active",
        }).select().single();

        if (splitError) {
          return { success: false, error: "Failed to create split" };
        }

        // Resolve each participant and create member records
        const members = [];
        for (const participant of participants) {
          let wallet = participant;
          if (!participant.startsWith("0x")) {
            try {
              const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/find`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier: participant }),
              });
              if (res.ok) {
                const data = await res.json();
                wallet = data.address;
              }
            } catch { /* continue */ }
          }

          members.push({
            split_id: split.id,
            wallet,
            identifier: participant,
            amount: Math.round(perPerson * 100) / 100,
            paid: wallet.toLowerCase() === userWallet.toLowerCase(),
            tx_hash: null,
          });
        }

        await supabase.from("split_members").insert(members);

        return {
          success: true,
          split,
          splitId,
          perPerson: perPerson.toFixed(2),
          participants: members.map((m) => ({
            identifier: m.identifier,
            amount: m.amount,
            paid: m.paid,
          })),
          paymentMemo: encodeMemo("SPL", splitId),
          message: `Bill split created: "${title}" for $${total_amount} among ${participants.length} people ($${perPerson.toFixed(2)} each). Members can pay with memo SPL:${splitId}.`,
        };
      },
    }),

    create_market: tool({
      description: "Create a binary prediction market where people can bet Yes or No on a question",
      parameters: z.object({
        question: z.string().describe("The yes/no question for the prediction market"),
        end_date: z.string().describe("When the market closes in YYYY-MM-DD format"),
      }),
      execute: async ({ question, end_date }) => {
        const marketId = generateMarketId();

        const { data, error } = await supabase.from("markets").insert({
          creator_wallet: userWallet,
          question,
          market_id: marketId,
          options: ["Yes", "No"],
          end_date,
          status: "open",
          total_pool: 0,
          token: DEFAULT_TOKEN,
        }).select().single();

        if (error) {
          return { success: false, error: "Failed to create market" };
        }

        return {
          success: true,
          market: data,
          marketId,
          message: `Prediction market created: "${question}". Bet with memo BET:${marketId}Y (for Yes) or BET:${marketId}N (for No). Closes on ${end_date}.`,
        };
      },
    }),

    place_bet: tool({
      description: "Place a bet on a prediction market",
      parameters: z.object({
        market_id: z.string().describe("The market ID to bet on"),
        position: z.enum(["yes", "no"]).describe("Whether to bet Yes or No"),
        amount: z.string().describe("Amount to bet in dollars"),
      }),
      execute: async ({ market_id, position, amount }) => {
        // Verify market exists and is open
        const { data: market } = await supabase
          .from("markets")
          .select("*")
          .eq("market_id", market_id)
          .single();

        if (!market || market.status !== "open") {
          return { success: false, error: "Market not found or closed" };
        }

        const posIndex = position === "yes" ? 0 : 1;
        const memoSuffix = position === "yes" ? "Y" : "N";
        const betMemo = encodeMemo("BET", `${market_id}${memoSuffix}`);

        return {
          success: true,
          action: "place_bet",
          market,
          amount,
          position,
          positionIndex: posIndex,
          memo: betMemo,
          token: DEFAULT_TOKEN,
          message: `Ready to place $${amount} bet on "${position.toUpperCase()}" for: "${market.question}"`,
        };
      },
    }),

    get_insights: tool({
      description: "Get AI-generated spending insights and analytics",
      parameters: z.object({
        period: z.enum(["week", "month", "quarter"]).optional().describe("Time period for analysis"),
      }),
      execute: async ({ period }) => {
        const days = period === "week" ? 7 : period === "quarter" ? 90 : 30;
        const since = new Date();
        since.setDate(since.getDate() - days);

        const { data: expenses } = await supabase
          .from("expenses")
          .select("*")
          .eq("user_wallet", userWallet)
          .gte("created_at", since.toISOString())
          .order("created_at", { ascending: false });

        const { data: invoices } = await supabase
          .from("invoices")
          .select("*")
          .eq("creator_wallet", userWallet)
          .gte("created_at", since.toISOString());

        const totalSpent = (expenses || [])
          .filter((e) => e.direction === "out")
          .reduce((sum, e) => sum + e.amount, 0);

        const totalReceived = (expenses || [])
          .filter((e) => e.direction === "in")
          .reduce((sum, e) => sum + e.amount, 0);

        const byCategory: Record<string, number> = {};
        (expenses || [])
          .filter((e) => e.direction === "out")
          .forEach((e) => {
            byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
          });

        const pendingInvoices = (invoices || []).filter((i) => i.status === "pending");

        return {
          success: true,
          period: period || "month",
          totalSpent: totalSpent.toFixed(2),
          totalReceived: totalReceived.toFixed(2),
          netFlow: (totalReceived - totalSpent).toFixed(2),
          byCategory,
          transactionCount: expenses?.length || 0,
          pendingInvoices: pendingInvoices.length,
          topCategory: Object.entries(byCategory).sort(([, a], [, b]) => b - a)[0]?.[0] || "None",
        };
      },
    }),
  };
}
