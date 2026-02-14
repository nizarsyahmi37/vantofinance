import { getServerClient } from "@/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = getServerClient();
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");
  const direction = searchParams.get("direction") || "sent";
  const status = searchParams.get("status");

  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
  }

  let query = supabase.from("invoices").select("*");

  if (direction === "sent") {
    query = query.eq("creator_wallet", wallet);
  } else {
    query = query.eq("recipient_wallet", wallet);
  }

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ invoices: data });
}

export async function POST(request: NextRequest) {
  const supabase = getServerClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("invoices")
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ invoice: data });
}
