-- Pulse - AI Financial Agent on Tempo
-- Supabase Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Invoices table
create table if not exists invoices (
  id uuid default uuid_generate_v4() primary key,
  creator_wallet text not null,
  recipient_identifier text not null,
  recipient_wallet text,
  amount decimal(18, 6) not null,
  token text not null,
  memo_hash text not null unique,
  description text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'overdue')),
  paid_tx_hash text,
  paid_at timestamptz,
  due_date date,
  created_at timestamptz default now()
);

create index idx_invoices_creator on invoices(creator_wallet);
create index idx_invoices_recipient on invoices(recipient_wallet);
create index idx_invoices_memo on invoices(memo_hash);
create index idx_invoices_status on invoices(status);

-- Expenses table
create table if not exists expenses (
  id uuid default uuid_generate_v4() primary key,
  user_wallet text not null,
  tx_hash text,
  amount decimal(18, 6) not null,
  token text not null,
  category text not null default 'Other',
  memo_raw text,
  description text,
  direction text not null check (direction in ('in', 'out')),
  counterparty text,
  created_at timestamptz default now()
);

create index idx_expenses_wallet on expenses(user_wallet);
create index idx_expenses_category on expenses(category);
create index idx_expenses_created on expenses(created_at);

-- Splits table
create table if not exists splits (
  id uuid default uuid_generate_v4() primary key,
  creator_wallet text not null,
  title text not null,
  total_amount decimal(18, 6) not null,
  token text not null,
  split_id text not null unique,
  status text not null default 'active' check (status in ('active', 'settled', 'cancelled')),
  created_at timestamptz default now()
);

create index idx_splits_creator on splits(creator_wallet);
create index idx_splits_split_id on splits(split_id);

-- Split members table
create table if not exists split_members (
  id uuid default uuid_generate_v4() primary key,
  split_id uuid not null references splits(id) on delete cascade,
  wallet text not null,
  identifier text,
  amount decimal(18, 6) not null,
  paid boolean not null default false,
  tx_hash text,
  created_at timestamptz default now()
);

create index idx_split_members_split on split_members(split_id);
create index idx_split_members_wallet on split_members(wallet);

-- Prediction Markets table
create table if not exists markets (
  id uuid default uuid_generate_v4() primary key,
  creator_wallet text not null,
  question text not null,
  market_id text not null unique,
  options text[] not null default '{"Yes","No"}',
  end_date date not null,
  status text not null default 'open' check (status in ('open', 'resolved', 'cancelled')),
  resolution integer,
  total_pool decimal(18, 6) not null default 0,
  token text not null,
  created_at timestamptz default now()
);

create index idx_markets_market_id on markets(market_id);
create index idx_markets_status on markets(status);

-- Market Bets table
create table if not exists market_bets (
  id uuid default uuid_generate_v4() primary key,
  market_id text not null,
  user_wallet text not null,
  position integer not null,
  amount decimal(18, 6) not null,
  tx_hash text,
  created_at timestamptz default now()
);

create index idx_bets_market on market_bets(market_id);
create index idx_bets_wallet on market_bets(user_wallet);

-- Enable Row Level Security (optional, can be configured later)
-- alter table invoices enable row level security;
-- alter table expenses enable row level security;
-- alter table splits enable row level security;
-- alter table split_members enable row level security;
-- alter table markets enable row level security;
-- alter table market_bets enable row level security;
