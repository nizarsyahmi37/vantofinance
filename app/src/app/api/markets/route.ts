import { getServerClient } from "@/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = getServerClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "open";

  let query = supabase
    .from("markets")
    .select("*, market_bets(*)")
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ markets: data });
}

export async function POST(request: NextRequest) {
  const supabase = getServerClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("markets")
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ market: data });
}
