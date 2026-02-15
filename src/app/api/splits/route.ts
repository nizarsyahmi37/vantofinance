import { getServerClient } from "@/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = getServerClient();
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
  }

  const walletLower = wallet.toLowerCase();
  const { data: createdSplits } = await supabase
    .from("splits")
    .select("*, split_members(*)")
    .ilike("creator_wallet", walletLower)
    .order("created_at", { ascending: false });

  const { data: memberSplits } = await supabase
    .from("split_members")
    .select("*, splits:split_id(*)")
    .ilike("wallet", walletLower);

  const allSplitIds = new Set<string>();
  const splits: any[] = [];

  (createdSplits || []).forEach((s) => {
    if (!allSplitIds.has(s.id)) {
      allSplitIds.add(s.id);
      splits.push(s);
    }
  });

  (memberSplits || []).forEach((m: any) => {
    if (m.splits && !allSplitIds.has(m.splits.id)) {
      allSplitIds.add(m.splits.id);
      splits.push(m.splits);
    }
  });

  return NextResponse.json({ splits });
}
