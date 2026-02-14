import { getServerClient } from "@/lib/supabase/client";
import { createPublicTempoClient } from "@/lib/tempo/client";
import { decodeMemo } from "@/lib/tempo/memo";
import { DEFAULT_TOKEN, TOKEN_DECIMALS } from "@/lib/tempo/tokens";
import { NextResponse } from "next/server";
import { formatUnits, parseAbiItem } from "viem";

const TRANSFER_WITH_MEMO_EVENT = parseAbiItem(
  "event TransferWithMemo(address indexed from, address indexed to, uint256 value, bytes32 indexed memo)"
);

/**
 * Background agent that polls for TransferWithMemo events and processes them.
 * Called periodically via cron or manual trigger.
 */
export async function POST() {
  try {
    const supabase = getServerClient();
    const client = createPublicTempoClient();

    const currentBlock = await client.getBlockNumber();
    const fromBlock = currentBlock - 100n; // Look back ~100 blocks

    const logs = await client.getLogs({
      address: DEFAULT_TOKEN,
      event: TRANSFER_WITH_MEMO_EVENT,
      fromBlock: fromBlock > 0n ? fromBlock : 0n,
      toBlock: currentBlock,
    });

    let processed = 0;

    for (const log of logs) {
      const { from, to, value, memo } = log.args as any;
      if (!memo) continue;

      const decoded = decodeMemo(memo);
      if (!decoded) continue;

      const amount = parseFloat(formatUnits(value, TOKEN_DECIMALS));
      const txHash = log.transactionHash;

      switch (decoded.type) {
        case "INV": {
          // Auto-reconcile invoice
          const { data: invoice } = await supabase
            .from("invoices")
            .select("*")
            .eq("memo_hash", decoded.payload)
            .eq("status", "pending")
            .single();

          if (invoice) {
            await supabase
              .from("invoices")
              .update({
                status: "paid",
                paid_tx_hash: txHash,
                paid_at: new Date().toISOString(),
              })
              .eq("id", invoice.id);

            // Record expense for both parties
            await supabase.from("expenses").insert([
              {
                user_wallet: from,
                tx_hash: txHash,
                amount,
                token: DEFAULT_TOKEN,
                category: "Bills",
                memo_raw: `INV:${decoded.payload}`,
                description: invoice.description,
                direction: "out",
                counterparty: to,
              },
              {
                user_wallet: to,
                tx_hash: txHash,
                amount,
                token: DEFAULT_TOKEN,
                category: "Bills",
                memo_raw: `INV:${decoded.payload}`,
                description: invoice.description,
                direction: "in",
                counterparty: from,
              },
            ]);

            processed++;
          }
          break;
        }

        case "EXP": {
          // Record categorized expense
          const category = categorizeFromMemo(decoded.payload);
          await supabase.from("expenses").insert({
            user_wallet: from,
            tx_hash: txHash,
            amount,
            token: DEFAULT_TOKEN,
            category,
            memo_raw: `EXP:${decoded.payload}`,
            description: decoded.payload,
            direction: "out",
            counterparty: to,
          });
          processed++;
          break;
        }

        case "SPL": {
          // Record split payment
          const { data: member } = await supabase
            .from("split_members")
            .select("*, splits:split_id(*)")
            .eq("wallet", from)
            .eq("paid", false)
            .single();

          if (member) {
            await supabase
              .from("split_members")
              .update({ paid: true, tx_hash: txHash })
              .eq("id", member.id);

            // Check if all members paid
            const { data: allMembers } = await supabase
              .from("split_members")
              .select("*")
              .eq("split_id", member.split_id);

            const allPaid = (allMembers || []).every((m) => m.paid);
            if (allPaid) {
              await supabase
                .from("splits")
                .update({ status: "settled" })
                .eq("id", member.split_id);
            }

            processed++;
          }
          break;
        }

        case "BET": {
          // Record prediction market bet
          const marketId = decoded.payload.slice(0, -1);
          const position = decoded.payload.slice(-1) === "Y" ? 0 : 1;

          await supabase.from("market_bets").insert({
            market_id: marketId,
            user_wallet: from,
            position,
            amount,
            tx_hash: txHash,
          });

          // Update market total pool
          const { data: market } = await supabase
            .from("markets")
            .select("total_pool")
            .eq("market_id", marketId)
            .single();

          if (market) {
            await supabase
              .from("markets")
              .update({ total_pool: market.total_pool + amount })
              .eq("market_id", marketId);
          }

          processed++;
          break;
        }

        case "PAY": {
          // Simple payment - record as expense
          await supabase.from("expenses").insert([
            {
              user_wallet: from,
              tx_hash: txHash,
              amount,
              token: DEFAULT_TOKEN,
              category: categorizeFromMemo(decoded.payload),
              memo_raw: decoded.payload,
              description: decoded.payload,
              direction: "out",
              counterparty: to,
            },
            {
              user_wallet: to,
              tx_hash: txHash,
              amount,
              token: DEFAULT_TOKEN,
              category: "Other",
              memo_raw: decoded.payload,
              description: decoded.payload,
              direction: "in",
              counterparty: from,
            },
          ]);
          processed++;
          break;
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      logsFound: logs.length,
      blockRange: { from: fromBlock.toString(), to: currentBlock.toString() },
    });
  } catch (error) {
    console.error("Agent watch error:", error);
    return NextResponse.json(
      { error: "Failed to process events" },
      { status: 500 }
    );
  }
}

function categorizeFromMemo(memo: string): string {
  const lower = memo.toLowerCase();
  if (/food|dinner|lunch|breakfast|coffee|restaurant|eat/i.test(lower)) return "Food";
  if (/uber|taxi|gas|parking|transit|bus|train/i.test(lower)) return "Transport";
  if (/shop|buy|purchase|amazon|store/i.test(lower)) return "Shopping";
  if (/movie|game|spotify|netflix|concert|fun/i.test(lower)) return "Entertainment";
  if (/rent|electric|water|internet|phone|bill/i.test(lower)) return "Bills";
  if (/doctor|pharmacy|health|gym|medical/i.test(lower)) return "Health";
  if (/school|book|course|tutor|education/i.test(lower)) return "Education";
  if (/hotel|flight|travel|trip|vacation/i.test(lower)) return "Travel";
  return "Other";
}
