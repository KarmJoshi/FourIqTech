# FourIQ Tech — Autonomous SEO Agency System

## What This Is

You are working on an **autonomous AI-powered SEO agency** that runs with zero human intervention. It researches keywords, writes blog posts, builds landing pages, audits technical SEO, publishes content, and learns from Google Search Console data — all automatically on a daily schedule.

The system is built for **FourIQ Tech** (fouriqtech.com), a premium web design & development agency based in India serving global clients. The goal is to grow organic search traffic and generate 20-40 qualified leads/month through content marketing, technical SEO, and landing page generation.

This is currently a personal tool but the plan is to **productize it** — turn it into a sellable SaaS product where other businesses can plug in their domain and get an autonomous SEO agent working for them.

---

## Architecture Overview

The system has two main parts:

### 1. Frontend — React Dashboard (`/agent-manager`)
- **Stack:** React 19, Vite 7, TypeScript, Tailwind CSS 4, Radix UI, Framer Motion
- **Purpose:** Protected dashboard to monitor, control, and review the agency's work
- **Layout:** Sidebar navigation with 6 departments (Director, Content, Tech SEO, Landing Pages, Social, Outreach)
- **Features:**
  - Real-time activity feed
  - Staging queue with approve/reject workflow
  - Auto-pilot toggle with schedule configuration
  - Model selection matrix (assign Gemini models to agent roles)
  - AI chat interface (direct Gemini conversation)
  - Lead management and email sending (outreach — personal use only)

### 2. Backend — Multi-Agent System
- **Stack:** Node.js (ESM), Express.js, Prisma ORM, PostgreSQL (Supabase), Google Gemini API
- **Deployment:** Render (API server), GitHub Actions (scheduled agent cycles), Vercel (frontend)
- **AI Models:** Google Gemini free tier — gemini-2.5-pro (5 RPM), gemini-2.5-flash (10 RPM), gemini-2.5-flash-lite (15 RPM)

---

## Agent Hierarchy

```
┌─────────────────────────────────────────────────┐
│              AGENCY DIRECTOR                      │
│   "The 20-Year Expert" — Strategic Brain         │
│   Decides which department runs each cycle       │
└──────────────┬──────────────────────────────────┘
               │
    ┌──────────┼──────────────┐
    │          │              │
    ▼          ▼              ▼
┌────────┐ ┌──────────┐ ┌──────────┐
│CONTENT │ │STRUCTURAL│ │TECHNICAL │
│  TEAM  │ │   TEAM   │ │   TEAM   │
└────────┘ └──────────┘ └──────────┘
```

### Director Agent (`agency-director.mjs`)
- Runs once per day (configurable)
- Gathers a **Situation Report** from all departments (DB queries)
- Consults the **Opportunity Engine** for scored recommendations
- Uses Gemini 2.5 Pro to make a strategic decision
- Dispatches ONE department per cycle
- Optionally runs a **Quality Audit** (random inspection of published content)
- Auto-reviews pending staging items
- Logs every decision to a journal for accountability
- Triggers the **Learning Engine** to evaluate past outcomes

### Content Team (`seo-auto-poster.mjs`)
Multi-agent pipeline:
1. **Researcher** — Finds keywords via Google Search grounding, analyzes SERP, builds semantic clusters
2. **AI Manager** — Reads all data (GSC, RAG memory, cluster map, competitors), creates a dynamic strategy brief. Picks the article structure type (case_study / strategic_guide / deep_explainer)
3. **Writer** — Executes the Manager's brief with adaptive structure. Produces 800-1100 word articles in semantic HTML
4. **QA Inspector** — 3-check validation (human tone, brief compliance, technical depth). Scores 1-100
5. **Publisher** — Submits to staging queue for review

Content features:
- Internal link spider (forward + reverse linking to existing pages)
- Schema markup injection (FAQ, Article)
- Sitemap regeneration
- RAG memory system (tracks winning/failed content patterns)
- Cluster map for topical authority building
- SERP strategy with featured snippet targeting

### Structural Team (`seo-dev-agent.mjs`)
- Market Scanner → Page Architect → Task Writer pipeline
- Finds commercial/buyer-intent keywords
- Designs full landing page architecture
- Generates task specs (or full React/TSX components)
- Auto-injects routes into App.tsx

### Technical Team (`technical-seo-agent.mjs`)
- Audits `index.html` and `src/components/SEO.tsx`
- Identifies performance/speed issues, meta tag problems, Core Web Vitals
- Generates code patches (sandboxed to specific files only)
- Submits patches to staging for review

---

## Intelligence Layer

### Opportunity Engine (`seo-opportunity-engine.mjs`)
- Scores and ranks SEO opportunities from Google Search Console data
- Uses ICE framework: Impact × Confidence × Business Value / Effort + Urgency
- Categorizes opportunities into departments (content, structural, technical)
- Infers playbooks (ctr_optimization, cluster_support, content_refresh, etc.)
- Recommends which department should run next

### Learning Engine (`seo-learning-engine.mjs`)
- Records every Director action with baseline metrics
- Evaluates outcomes by comparing current GSC data to baselines
- Calculates success scores per action
- Builds playbook performance rankings (which strategies actually work)
- Feeds back into the Opportunity Engine for smarter decisions

### Competitor Intelligence (`seo-competitor-intelligence.mjs`)
- SERP competitor analysis
- Gap signal detection

---

## Infrastructure

### Staging/Review System
- All agent output goes to a **staging queue** (PostgreSQL `StagingItem` table)
- Director auto-reviews pending items OR human reviews via dashboard
- Approved items get published by the Publisher script
- Supports **auto-commit mode** (bypasses review, pushes to GitHub)

### Publisher (`publisher.mjs`)
- Reads approved items from DB
- Blog posts → `BlogPost` table (isLive: true)
- Landing pages → `ServicePage` table + .tsx file + route injection
- Technical patches → writes code file
- Content validation (rejects malformed/too-short content)
- Auto-commits to GitHub with proper git safety

### API Server (`agency-api.mjs`)
- Express.js hosted on Render
- **Authentication:** Bearer token required for all mutations
- **Rate limiting:** 30 req/min per IP
- REST endpoints for: staging, activity feed, journal, settings, dispatch, leads, blogs, services
- Non-blocking department dispatch (spawn child processes)
- Strategic scheduler (auto-pilot with configurable timing)
- Graceful shutdown handling

### Scheduling
- **GitHub Actions:** Daily at 9:30 AM IST — Full Director cycle
- **API Scheduler:** Configurable auto-pilot (1-24 cycles/day)
- **Render keep-alive:** Prevents API server from sleeping

---

## Database Schema (PostgreSQL via Prisma)

| Table | Purpose |
|-------|---------|
| `BlogPost` | Published blog articles (slug, title, content, isLive) |
| `ServicePage` | Generated landing pages (slug, component code, route) |
| `StagingItem` | Review queue for all agent output |
| `ActivityLog` | Real-time activity feed |
| `JournalEntry` | Director decision history |
| `AgencyConfig` | Auto-pilot settings, model assignments |
| `SearchPerformance` | GSC analytics snapshots |
| `Lead` / `DraftEmail` | Outreach leads and email drafts (personal use) |
| `SocialPost` | Instagram/social content (newer, less developed) |

---

## Key Configuration

### `fouriqtech-seo-config.yaml`
- Company info, services, target clients
- Keyword tiers (local, marketing, longtail, services, auto-discovered)
- Content specs (frequency, word count, topic clusters)
- On-page SEO settings
- Technical SEO targets (Core Web Vitals)
- Backlink strategies
- Conversion goals

### `agency-core.mjs` — Shared Utilities
- API key rotation (multi-key round-robin)
- Smart model calling with fallback chains and rate-limit handling
- Model presets per role (manager, writer, researcher, qa, scanner, builder, etc.)
- Staging system (submit, review, approve/reject)
- Activity logger
- Knowledge base loader
- Director orders system

---

## Model Assignment (Free Tier)

| Role | Primary Model | Fallbacks |
|------|--------------|-----------|
| Manager/Director | gemini-2.5-pro | gemini-2.5-flash, gemini-1.5-pro |
| Writer | gemini-2.5-flash | gemini-2.5-pro, gemini-1.5-flash |
| Researcher | gemini-2.5-flash-lite | gemini-2.5-flash, gemini-1.5-flash |
| QA | gemini-2.5-flash | gemini-2.5-pro, gemini-1.5-flash |
| Builder | gemini-2.5-pro | gemini-2.5-flash, gemini-1.5-pro |

Rate limits: 6 second gap between calls. Keys rotate on 429 errors.

---

## File Structure (Key Files)

```
.github/
  scripts/
    agency-core.mjs          — Shared utilities (API keys, smartCall, staging)
    agency-api.mjs           — Express API server
    agency-director.mjs      — Director agent (strategic brain)
    seo-auto-poster.mjs      — Content team (research → write → QA → publish)
    seo-dev-agent.mjs        — Structural team (landing page generator)
    technical-seo-agent.mjs  — Technical team (site health auditor)
    seo-opportunity-engine.mjs — Opportunity scoring
    seo-learning-engine.mjs  — Outcome tracking & playbook scoring
    seo-competitor-intelligence.mjs — SERP competitor analysis
    publisher.mjs            — Deploys approved items to production
  seo-memory/
    latest-opportunities.json
    action-history.json
    outcome-history.json
    playbook-scores.json
  workflows/
    agency-cycle.yml         — GitHub Actions daily trigger

src/
  pages/AgentManager/
    index.tsx                — Main dashboard (sidebar layout)
    api.ts                   — Centralized API client with auth
    components/
      Sidebar.tsx            — Navigation sidebar
      TopBar.tsx             — Page header with status
      StatsBar.tsx           — Key metrics display
      ControlHub.tsx         — Dispatch buttons
      ActivityFeed.tsx       — Real-time log
      StagingQueue.tsx       — Review queue
      ChatPanel.tsx          — AI chat overlay
      ModelSelectionMatrix.tsx — Model assignment UI
      ContentHubDepartment.tsx
      TechSeoDepartment.tsx
      LandingPagesDepartment.tsx
      InstagramDepartment.tsx
      OutreachDepartment.tsx

prisma/
  schema.prisma             — Database schema

fouriqtech-seo-config.yaml  — SEO strategy configuration
.env                        — API keys, DB URL, secrets
```

---

## Current State

- **Operational:** System runs daily, publishes content, tracks performance
- **Self-learning:** RAG memory + playbook scoring tracks what works
- **Auto-commit:** Can push changes to GitHub autonomously
- **Dashboard:** Full management UI with approve/reject workflow
- **Free tier:** Running on Gemini free tier (3 API keys rotating)
- **Security:** API auth, rate limiting, input validation added

---

## Product Vision (Future)

To turn this into a sellable SaaS product:
1. **Multi-tenancy** — Per-customer config, isolated data, onboarding flow
2. **Auth & Billing** — Proper auth (not client-side), Stripe subscriptions
3. **White-label dashboard** — Customer-facing UI, onboarding wizard
4. **GSC OAuth** — Customers connect their own Search Console
5. **Queue system** — BullMQ/Redis instead of direct script spawning
6. **Monitoring** — Sentry, proper error handling, alerting

---

## Important Notes for Any AI Working on This

1. **All agent scripts are ESM** (import/export, not require)
2. **Prisma uses pg-adapter** for Supabase compatibility (`@prisma/adapter-pg`)
3. **The content pipeline produces semantic HTML** (not markdown) — `<h1>`, `<h2>`, `<p>`, `<ul>`, `<pre><code>`
4. **Blog content is stored in PostgreSQL** (not files) — the `src/data/blogPosts.ts` file is legacy
5. **The staging system is the safety gate** — nothing goes live without approval (unless auto-commit is on)
6. **Rate limits matter** — free tier has 5-15 RPM, 100-1000 RPD. The 6-second gap between calls is intentional
7. **The Director is the boss** — it decides everything. Individual agents don't run independently
8. **Outreach/email system is personal use only** — ignore it for product development
9. **The frontend uses Tailwind CSS 4** with custom theme tokens (ai-primary, ai-secondary, etc.)
10. **Google Search grounding** is enabled in API calls (`tools: [{ googleSearch: {} }]`) — this gives agents access to live search results
