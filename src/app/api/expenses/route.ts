import { getServerClient } from "@/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = getServerClient();
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");
  const category = searchParams.get("category");
  const days = parseInt(searchParams.get("days") || "30");

  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
  }

  let query = supabase
    .from("expenses")
    .select("*")
    .eq("user_wallet", wallet)
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const since = new Date();
  since.setDate(since.getDate() - days);
  query = query.gte("created_at", since.toISOString());

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = (data || []).reduce((sum, e) => sum + e.amount, 0);
  const byCategory: Record<string, number> = {};
  (data || []).forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });

  return NextResponse.json({
    expenses: data,
    total,
    byCategory,
  });
}
