 Pulse - AI Financial Agent on Tempo

 Context

 Building a hackathon project for the Canteen x Tempo Blockchain Hackathon. The goal is to maximize scores across Technical Implementation (30%), Innovation (25%), UX (20%), Ecosystem
 Impact (15%), and Presentation (10%) by creating a hybrid AI Agents + Consumer Payments platform.

 Core Insight: Tempo's 32-byte transaction memos can be used as a structured protocol layer. By encoding type prefixes (INV:, EXP:, SPL:, BET:, PAY:), an AI agent can watch raw
 blockchain events and autonomously understand context — auto-reconciling invoices, categorizing expenses, tracking splits, and resolving bets. This is the key innovation.

 ---
 Product: Pulse

 "Your AI financial agent on Tempo — invoicing, expenses, payments, and predictions in one conversational interface."

 A chat-first AI agent that handles all financial operations through natural language, backed by a dashboard for visual insights. Users log in with email phone (Privy), never see crypto complexity, and all transactions are gasless.

 ---
 Tech Stack

 ┌────────────────┬───────────────────────────────────────────────────┐
 │     Layer      │                      Choice                       │
 ├────────────────┼───────────────────────────────────────────────────┤
 │ Framework      │ Next.js 14 (App Router)                           │
 ├────────────────┼───────────────────────────────────────────────────┤
 │ Auth + Wallets │ Privy (@privy-io/react-auth)                      │
 ├────────────────┼───────────────────────────────────────────────────┤
 │ Blockchain     │ tempo.ts + viem + wagmi                           │
 ├────────────────┼───────────────────────────────────────────────────┤
 │ AI             │ Vercel AI SDK + OpenAI GPT-4o-mini (tool-calling) │
 ├────────────────┼───────────────────────────────────────────────────┤
 │ Database       │ Supabase (Postgres + Realtime)                    │
 ├────────────────┼───────────────────────────────────────────────────┤
 │ Styling        │ Tailwind CSS + shadcn/ui                          │
 ├────────────────┼───────────────────────────────────────────────────┤
 │ Charts         │ Recharts                                          │
 └────────────────┴───────────────────────────────────────────────────┘

 ---
 Architecture

 Frontend (Next.js 14)
 ├── Chat Panel (AI agent with tool-calling)
 ├── Dashboard (balances, cash flow, insights)
 ├── Invoice Manager
 ├── Expense Tracker
 ├── Split Manager
 └── Prediction Markets

 API Layer (Next.js API Routes)
 ├── /api/chat          → AI chat with streaming + tools
 ├── /api/find          → Privy user lookup (email/phone → wallet)
 ├── /api/invoices      → Invoice CRUD
 ├── /api/expenses      → Expense listing + categorization
 ├── /api/splits        → Bill split management
 ├── /api/markets       → Prediction market CRUD
 └── /api/agent/watch   → Background memo event watcher

 Blockchain (Tempo via tempo.ts + viem)
 ├── Transfers with structured memos
 ├── Fee sponsorship (gasless)
 ├── Batch transactions (atomic splits)
 ├── Parallel transactions (simultaneous sends)
 └── TransferWithMemo event watching

 ---
 Memo Protocol (Key Innovation)

 Bytes 0-3:  Type prefix
 Bytes 4-31: Payload (28 bytes)

 INV:<invoiceId>     → Invoice payment
 EXP:<category+ref>  → Tagged expense
 SPL:<splitGroupId>  → Bill split payment
 BET:<marketId+pos>  → Prediction market bet
 PAY:<freetext>      → Simple payment note

 The background agent watches TransferWithMemo events, decodes the prefix, and autonomously processes each type.

 ---
 AI Tools (Vercel AI SDK tool-calling)

 ┌────────────────┬───────────────────────────────────────────────────┐
 │      Tool      │                    Description                    │
 ├────────────────┼───────────────────────────────────────────────────┤
 │ send_payment   │ Send stablecoins to email/phone/address with memo │
 ├────────────────┼───────────────────────────────────────────────────┤
 │ create_invoice │ Generate invoice with unique memo hash            │
 ├────────────────┼───────────────────────────────────────────────────┤
 │ check_balance  │ Query token balances                              │
 ├────────────────┼───────────────────────────────────────────────────┤
 │ list_invoices  │ List sent/received invoices by status             │
 ├────────────────┼───────────────────────────────────────────────────┤
 │ list_expenses  │ List expenses filtered by category/date           │
 ├────────────────┼───────────────────────────────────────────────────┤
 │ split_bill     │ Create bill split among participants              │
 ├────────────────┼───────────────────────────────────────────────────┤
 │ create_market  │ Create binary prediction market                   │
 ├────────────────┼───────────────────────────────────────────────────┤
 │ place_bet      │ Bet on a prediction market                        │
 ├────────────────┼───────────────────────────────────────────────────┤
 │ get_insights   │ AI-generated spending insights                    │
 └────────────────┴───────────────────────────────────────────────────┘

 ---
 Feature Priority (MVP vs Stretch)

 MVP — Days 1-3 (Must ship)

 1. Privy auth (email/phone login)
 2. AI Chat interface with tool-calling (streaming)
 3. Send payment via NL ("send $50 to john@email.com for dinner")
 4. Create/view invoices via NL + dashboard
 5. Auto-reconcile invoices via memo watching
 6. Expense tracking with AI categorization
 7. Bill splitting via NL with batch transactions
 8. Basic dashboard (balances, recent txns, cash flow chart)

 Stretch — Days 4-5

 9. Prediction markets (binary yes/no)
 10. Payment reminders
 11. Cash flow analytics charts
 12. AI spending insights ("you spent 40% more on food this week")
 13. Landing page + demo polish

 ---
 Day-by-Day Plan

 Day 1: Foundation + Core Chat

 - Scaffold from privy-next-tempo starter
 - Set up Supabase with schema (invoices, expenses, splits, markets tables)
 - Configure Privy auth (email + phone)
 - Build layout: sidebar nav + main content + chat drawer
 - Implement AI chat endpoint (/api/chat) with Vercel AI SDK
 - Wire up send_payment tool → actual on-chain transfer with memo
 - Milestone: Login with email, chat "send $10 to [wallet] for coffee", see on-chain tx

 Day 2: Invoicing + Expenses

 - Invoice creation via AI chat + manual form
 - Invoice dashboard page (list, status badges, filters)
 - Invoice payment flow with INV: memo encoding
 - Background memo watcher (/api/agent/watch) — polls TransferWithMemo events
 - Auto-reconcile: detect INV: memo → mark invoice paid in Supabase
 - Expense tracking: unrecognized memos → AI categorization
 - Expense dashboard with category breakdown
 - Milestone: Create invoice via chat, pay it, see it auto-reconcile

 Day 3: Bill Splitting + Polish

 - Bill split via chat ("split $120 between 3 people")
 - Resolve participants via Privy /api/find
 - Batch transactions for atomic split settlements
 - Split dashboard (active splits, who paid, settle button)
 - Error handling, loading states, mobile responsiveness
 - Toast notifications for tx success/failure
 - Milestone: Full split flow working end-to-end

 Day 4: Prediction Markets + Analytics

 - Prediction market creation via chat
 - Market page (active markets, join flow, bet placement)
 - Market resolution + payout via batch transaction
 - Analytics dashboard: spending pie chart, cash flow trend, insights panel
 - AI insights ("How much did I spend on food this week?")
 - Milestone: Create bet, friends join, resolve, auto-payout

 Day 5: Demo Prep + Polish

 - Landing page with hero + feature cards
 - Demo script with exact chat prompts
 - Pre-seed test data for smooth demo
 - UI animations (typing indicator, tool execution spinners)
 - README + architecture diagram
 - Edge case hardening (insufficient balance, user not found, etc.)

 ---
 Key Files to Create/Modify

 src/
   app/
     page.tsx                          — Landing page
     layout.tsx                        — Root layout (Privy + QueryClient providers)
     dashboard/
       layout.tsx                      — Auth layout (sidebar + chat drawer)
       page.tsx                        — Main dashboard
       invoices/page.tsx               — Invoice list
       expenses/page.tsx               — Expense tracker
       splits/page.tsx                 — Bill splits
       markets/page.tsx                — Prediction markets
     api/
       chat/route.ts                   — AI chat endpoint (CRITICAL)
       find/route.ts                   — Privy user lookup (from starter)
       invoices/route.ts               — Invoice CRUD
       expenses/route.ts               — Expense operations
       splits/route.ts                 — Split operations
       markets/route.ts                — Market operations
       agent/watch/route.ts            — Background memo watcher (CRITICAL)
   components/
     chat/ChatPanel.tsx                — Sliding chat drawer
     chat/ChatMessage.tsx              — Message bubble
     chat/ChatInput.tsx                — Input with send
     layout/Sidebar.tsx                — Navigation
     layout/Header.tsx                 — Top bar with wallet
     invoices/InvoiceCard.tsx
     expenses/ExpenseList.tsx
     expenses/CategoryChart.tsx
     splits/SplitCard.tsx
     markets/MarketCard.tsx
     dashboard/CashFlowChart.tsx
     dashboard/BalanceCard.tsx
   lib/
     ai/tools.ts                       — AI tool definitions (CRITICAL)
     ai/system-prompt.ts               — Agent personality + context
     tempo/client.ts                   — Viem client with tempoActions
     tempo/memo.ts                     — Memo encode/decode (CRITICAL)
     tempo/tokens.ts                   — Token addresses
     supabase/client.ts                — Supabase client
   hooks/
     useSend.ts                        — Extended payment hook

 ---
 Tempo Features Leveraged

 ┌──────────────────────────────┬──────────────────────────────────────────────────┐
 │           Feature            │                      Usage                       │
 ├──────────────────────────────┼──────────────────────────────────────────────────┤
 │ Transaction Memos (32 bytes) │ Structured memo protocol for auto-reconciliation │
 ├──────────────────────────────┼──────────────────────────────────────────────────┤
 │ Fee Sponsorship              │ feePayer: true on all transfers — gasless UX     │
 ├──────────────────────────────┼──────────────────────────────────────────────────┤
 │ Parallel Transactions        │ Simultaneous sends to multiple split members     │
 ├──────────────────────────────┼──────────────────────────────────────────────────┤
 │ Batch Transactions           │ Atomic group payments (all succeed or all fail)  │
 ├──────────────────────────────┼──────────────────────────────────────────────────┤
 │ TransferWithMemo Events      │ Background agent watches for payments            │
 ├──────────────────────────────┼──────────────────────────────────────────────────┤
 │ Privy Integration            │ Email/phone → wallet mapping, no seed phrases    │
 ├──────────────────────────────┼──────────────────────────────────────────────────┤
 │ DEX (stretch)                │ Multi-token swap before payment                  │
 └──────────────────────────────┴──────────────────────────────────────────────────┘

 ---
 Database Schema (Supabase)

 Tables: invoices, expenses, splits, split_members, markets, market_bets

 Key columns on invoices: creator_wallet, recipient_identifier, amount, token, memo_hash, status (pending/paid/overdue), paid_tx_hash

 Key columns on expenses: user_wallet, tx_hash, amount, category (AI-assigned), memo_raw, direction (in/out)

 ---
 Verification Plan

 1. Auth flow: Login with email → Privy creates wallet → dashboard loads with balance
 2. Send payment: Chat "send $10 to [test email]" → confirm → tx on Tempo explorer
 3. Invoice lifecycle: Create via chat → share link → pay with memo → auto-reconcile marks paid
 4. Bill split: Chat "split $90 between 3 people" → batch tx created → members settle → split marked complete
 5. Expense tracking: Send tagged payment → background agent categorizes → appears in expense dashboard
 6. Prediction market: Create via chat → friends bet → resolve → payouts distributed
 7. Cross-feature: Chat "how much did I spend this week?" → AI queries Supabase → returns insights with chart

 ---
 Scoring Strategy

 ┌────────────────────┬────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │      Criteria      │                                                          Our Edge                                                          │
 ├────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ Technical (30%)    │ All core Tempo features used: memos, fee sponsorship, batch/parallel txns, event watching, Privy. Working AI tool-calling. │
 ├────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ Innovation (25%)   │ Memo-as-protocol is novel. Conversational finance across 4 verticals in one agent. Autonomous reconciliation.              │
 ├────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ UX (20%)           │ Chat-first (familiar like ChatGPT). No crypto jargon. Email/phone login. Gasless. Dashboard for visuals.                   │
 ├────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ Ecosystem (15%)    │ Shows Tempo as a fintech platform. Demonstrates memos enable application-layer protocols.                                  │
 ├────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ Presentation (10%) │ Live demo: login → chat → send → invoice → split → reconcile. Compelling narrative.                                        │
 └────────────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘