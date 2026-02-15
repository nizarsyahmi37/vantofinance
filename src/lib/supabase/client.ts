import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Browser client (uses anon key)
export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Server client (uses service role key for admin operations) - lazily initialized
let _serverClient: SupabaseClient | null = null;

export function getServerClient(): SupabaseClient {
  if (!_serverClient) {
    _serverClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _serverClient;
}

// Alias for backward compatibility
export const createServerClient = getServerClient;

// Types for database tables
export interface Invoice {
  id: string;
  creator_wallet: string;
  recipient_identifier: string;
  recipient_wallet: string | null;
  amount: number;
  token: string;
  memo_hash: string;
  description: string;
  status: "pending" | "paid" | "overdue";
  paid_tx_hash: string | null;
  paid_at: string | null;
  due_date: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  user_wallet: string;
  tx_hash: string;
  amount: number;
  token: string;
  category: string;
  memo_raw: string;
  description: string;
  direction: "in" | "out";
  counterparty: string;
  created_at: string;
}

export interface Split {
  id: string;
  creator_wallet: string;
  title: string;
  total_amount: number;
  token: string;
  split_id: string;
  status: "active" | "settled" | "cancelled";
  created_at: string;
}

export interface SplitMember {
  id: string;
  split_id: string;
  wallet: string;
  identifier: string;
  amount: number;
  paid: boolean;
  tx_hash: string | null;
  created_at: string;
}

export interface Market {
  id: string;
  creator_wallet: string;
  question: string;
  market_id: string;
  options: string[];
  end_date: string;
  status: "open" | "resolved" | "cancelled";
  resolution: number | null;
  total_pool: number;
  token: string;
  market_type: "binary" | "price";
  created_at: string;
}

export interface MarketBet {
  id: string;
  market_id: string;
  user_wallet: string;
  position: number;
  amount: number;
  tx_hash: string;
  created_at: string;
}
