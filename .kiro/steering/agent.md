# FourIQ Tech — Complete Project Knowledge Base

> This document gives the AI IDE full context about the project architecture, modules, data flow, and conventions so it always knows what's happening.

---

## 1. Project Identity

- **Name:** FourIQ Tech (FouriqTech)
- **Domain:** https://www.fouriqtech.com
- **What it is:** A web design agency website + fully autonomous AI-powered SEO agency that runs 24/7 without human intervention.
- **Owner:** Karm Joshi
- **Tech Stack:** React 19 + TypeScript + Vite 7 + Tailwind CSS 4 + Framer Motion + GSAP + Three.js
- **Backend:** Express.js API (Node.js) + Prisma ORM + PostgreSQL (Supabase) + GitHub API for auto-publishing
- **Hosting:** Frontend on Vercel (auto-deploy from GitHub), Backend API on Render (https://fouriqtech.onrender.com)
- **AI Provider:** Google Gemini (gemini-3.5-flash, gemini-2.5-flash, gemini-2.0-flash)

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React SPA)                          │
│  Vite → src/main.tsx → App.tsx → React Router → Pages           │
│  Port: 8080 (dev)                                               │
└─────────────────────────┬───────────────────────────────────────┘
                          │ API calls
┌─────────────────────────▼───────────────────────────────────────┐
│                    BACKEND (Express API)                         │
│  .github/scripts/agency-api.mjs → Port 3848 (local) / Render   │
│  Endpoints: /api/status, /api/staging, /api/dispatch, etc.      │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Prisma ORM
┌─────────────────────────▼───────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                         │
│  Supabase | Schema: prisma/schema.prisma                        │
│  4-Layer Memory: Working → Short-Term → Long-Term → Institutional│
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Frontend Architecture

### Entry Flow
```
src/main.tsx → App.tsx → Providers → Router → Pages
```

### Providers (wrapping order in App.tsx)
1. `HelmetProvider` — SEO meta tags
2. `QueryClientProvider` — React Query (async state)
3. `TooltipProvider` — Radix UI tooltips
4. `SmoothScroll` — Lenis smooth scrolling wrapper
5. `BrowserRouter` — React Router v6

### Routes (src/App.tsx)
| Route | Component | Type |
|-------|-----------|------|
| `/` | Index | Homepage (hero + sections) |
| `/blog` | Blog | Blog listing (fetches from DB) |
| `/blog/:slug` | BlogPost | Individual post |
| `/about` | About | Static page |
| `/contact` | Contact | Contact form |
| `/services` | Services | Services listing |
| `/services/website-development` | WebsiteDevelopment | Static service page |
| `/services/app-development` | AppDevelopment | Static service page |
| `/services/ui-ux-design` | UiUxDesign | Static service page |
| `/services/seo-digital-marketing` | SeoDigitalMarketing | Static service page |
| `/services/consulting` | Consulting | Static service page |
| `/services/multi-tenant-saas-development` | MultiTenantSaasDevelopment | Static service page |
| `/services/legacy-application-modernization` | LegacyApplicationModernization | Static service page |
| `/services/:slug` | DynamicServicePage | DB-powered catch-all |
| `/agent-manager` | AgentManager | Internal admin dashboard |
| `*` | NotFound | 404 page |

### Key Components (src/components/)
- **Navbar.tsx** — Navigation bar (visibility controlled by hero animation)
- **HeroSection.tsx** — Animated landing hero with Three.js/GSAP
- **ServicesSection.tsx** — Service cards from `src/data/services.ts`
- **FeaturedInsights.tsx** — Blog highlights
- **TechStack.tsx** — Technology showcase
- **ProcessSection.tsx** — Work process visualization
- **AboutSection.tsx** — Company info
- **ContactSection.tsx** — Contact form
- **Footer.tsx** — Site footer
- **AiChat.tsx** — Floating AI chatbot (Gemini-powered, client-side)
- **SEO.tsx** — Helmet-based meta/OG/schema injection per page
- **SmoothScroll.tsx** — Lenis wrapper with scroll lock
- **Scene3D.tsx** — Three.js 3D scene component

### UI Library (src/components/ui/)
- Full shadcn/ui component set (50+ components)
- Built on Radix UI primitives + Tailwind + class-variance-authority

### Data Layer (src/data/)
- **services.ts** — Static service entries (title, desc, icon, path, badge)
- **blogPosts.ts** — Static blog array (currently empty; posts now come from DB via API)

### Hooks (src/hooks/)
- **use-mobile.tsx** — Responsive breakpoint detection
- **use-toast.ts** — Toast notification hook

### Path Alias
- `@/` → `src/` (configured in vite.config.ts + tsconfig.json)

---

## 4. Backend Architecture (Agency API)

### Server: `.github/scripts/agency-api.mjs`
- **Framework:** Express.js
- **Port:** 3848 (local) or env PORT (Render)
- **Start command:** `npm start` or `npm run agency`

### Key Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Health check for Render |
| GET | `/api/status` | Agency dashboard status |
| GET | `/api/staging` | Staging queue (pending/approved/rejected) |
| POST | `/api/staging` | Submit work to queue |
| POST | `/api/staging/:id/review` | Approve/reject staging item |
| GET | `/api/staging/:id/content` | Read draft content |
| POST | `/api/dispatch/:department` | Non-blocking department dispatch |
| POST | `/api/director/cycle` | Full strategic director cycle |
| GET | `/api/director/cycle` | Cron-triggered director cycle |
| GET | `/api/journal` | Director decision history |
| GET | `/api/activity` | Real-time activity feed |
| GET | `/api/tasks` | Running tasks status |
| GET | `/api/intelligence` | SEO memory snapshot |
| POST | `/api/run-task` | Execute named task scripts |
| POST | `/api/send-email` | Send email via Resend/SMTP |
| GET | `/api/leads` | Outreach leads database |
| PATCH | `/api/leads/:id` | Update a lead |
| POST | `/api/leads/sync-scraper` | Sync scraped leads to DB |
| GET | `/api/backlinks` | Link opportunities |
| GET/POST | `/api/settings` | Agency config (autopilot, model selection) |
| POST | `/api/publish` | Trigger publisher |
| GET | `/api/services/:slug` | Fetch dynamic service page from DB |

---

## 5. AI Agency System (The "Brain")

### Department Architecture
```
                    ┌──────────────┐
                    │   DIRECTOR   │  (agency-director.mjs)
                    │ Strategic AI │
                    └──────┬───────┘
           ┌───────────────┼───────────────┐───────────────┐
     ┌─────▼──────┐ ┌─────▼──────┐ ┌──────▼─────┐ ┌──────▼─────┐
     │  CONTENT   │ │ STRUCTURAL │ │ TECHNICAL  │ │ BACKLINKS  │
     │   Team     │ │    Team    │ │    Team    │ │    Team    │
     └────────────┘ └────────────┘ └────────────┘ └────────────┘
```

### Director (agency-director.mjs)
- **Role:** Top-level strategic decision maker
- **Phases:**
  1. SITREP — Gathers full memory context (4 layers)
  2. DECISION — AI chooses which department to run + specific orders
  3. QUALITY AUDIT — Random inspection of published content (~30%)
  4. DISPATCH — Executes chosen department script
  5. AUTO-REVIEW — Checks staging queue, approves/rejects
  6. RECORD — Writes to journal, updates memory
- **Triggers:** Manual (API), Cron (scheduled), Chat mode (`--chat`)

### Content Team (seo-auto-poster.mjs)
- **Role:** Researches keywords → writes SEO blog posts → generates images → submits to staging
- **Pipeline:** Researcher → AI Manager (brief) → Writer → QA Inspector → Staging
- **Image generation:** Uses Imagen 4 via blog-image-generator.mjs
- **Output:** Blog posts stored in PostgreSQL (BlogPost model), not static files

### Structural Team (seo-dev-agent.mjs)
- **Role:** Builds new service landing pages from scratch
- **Pipeline:** Memory Load → Market Scanner → Page Strategist → Page Builder → Build Verify → Staging
- **Output:** React/TSX components pushed to GitHub via publisher

### Technical Team (technical-seo-agent.mjs)
- **Role:** Audits performance, fixes Core Web Vitals, manages technical SEO
- **Pipeline:** Performance Audit (PageSpeed API) → Developer AI (writes fixes) → QA → Loop
- **Safety:** Can only modify allowed files, cannot touch visual/animation code

### Backlinks Team (backlink-agent.mjs)
- **Role:** Finds link-building opportunities, generates pitch emails

### Shared Core (agency-core.mjs)
- **API Key Rotation:** Multi-key round-robin with auto-rotate on 429
- **Smart Model Calls:** Fallback chains per role, rate-limit handling, 503 retry
- **Staging System:** Central queue for manager review (DB-backed)
- **Activity Logger:** Real-time feed stored in PostgreSQL
- **Browser Toolbox:** Registry of pre-built crawlers

### Memory System (memory-compiler.mjs)
- **4-Layer Architecture:**
  - Layer 1: Working Memory (current cycle state, pending reviews)
  - Layer 2: Short-Term Memory (last 30 days actions, outcomes, insights)
  - Layer 3: Long-Term Memory (patterns, playbook stats, blacklists, keywords)
  - Layer 4: Institutional Knowledge (company context, topic clusters)
- **Usage:** Every agent calls `compileMemory('department')` before running
- **Learning:** Records actions, patterns, outcomes for future decisions

### Publisher (publisher.mjs)
- **Role:** Deploys approved staging items to production
- **Methods:**
  - Blog posts → DB only (isLive: true)
  - Landing pages → DB + push .tsx via GitHub API + update App.tsx routes
  - Technical patches → Push file changes via GitHub API
- **Post-publish:** Syncs live_posts.json, submits URLs to Google Search Console

---

## 6. Database Schema (Prisma/PostgreSQL)

### Key Models
| Model | Purpose |
|-------|---------|
| AgencyConfig | Global settings (autopilot, API mode, schedule) |
| AgentState | Current cycle state (working memory) |
| StagingItem | Content queue (pending → approved → published) |
| ActivityLog | Real-time activity feed |
| AgentAction | Actions taken by departments (for learning) |
| ActionOutcome | Results of actions (positive/negative/neutral) |
| JournalEntry | Director's decision log |
| GscDailySnapshot | Google Search Console daily metrics |
| GscPageMetric | Per-page GSC data |
| GscQueryMetric | Per-query GSC data |
| GscInsight | AI-generated insights from GSC data |
| PlaybookStat | Strategy performance tracking |
| LearnedPattern | What works/fails (long-term learning) |
| KeywordMemory | Keyword tracking (status, position, history) |
| MonthlySummary | Monthly performance summaries |
| Blacklist | Things to never attempt again |
| CompanyContext | Static brand/company info |
| TopicCluster | Content cluster management |
| BlogPost | Published blog articles |
| ServicePage | AI-generated service pages |
| TechAuditReport | Performance audit history |
| Lead | Outreach leads (business intelligence) |
| DraftEmail | Outreach email drafts |
| SocialPost | Social media content |

---

## 7. Agent Manager (Internal Dashboard)

- **Route:** `/agent-manager`
- **Auth:** Login required (VITE_ADMIN_ID / VITE_ADMIN_PASS)
- **Location:** `src/pages/AgentManager/`
- **Features:**
  - Director command center (dispatch cycles, view journal)
  - Department-specific views (content, tech SEO, landing pages, backlinks, outreach, social)
  - Staging queue with approve/reject workflow
  - Real-time activity feed (polls every 5s)
  - Chat with Agency Manager AI (context-aware, uses live data)
  - Lead management (hunt, edit, send emails, export CSV)
  - Model selection matrix (assign AI models to roles)
  - Auto-pilot toggle + scheduling config
- **API Base:** VITE_API_URL or auto-detect (localhost:3848 vs Render)

---

## 8. Key Scripts (.github/scripts/)

| Script | Purpose |
|--------|---------|
| agency-api.mjs | Express API server (the backbone) |
| agency-core.mjs | Shared utilities (AI calls, staging, logging) |
| agency-director.mjs | Strategic brain (decision making) |
| seo-auto-poster.mjs | Content team (blog generation) |
| seo-dev-agent.mjs | Structural team (service page builder) |
| technical-seo-agent.mjs | Tech team (performance fixes) |
| backlink-agent.mjs | Backlink team (link building) |
| publisher.mjs | Deployment (GitHub API + DB publish) |
| memory-compiler.mjs | 4-layer memory system |
| github-api.mjs | GitHub REST API wrapper |
| gsc-url-manager.mjs | Google Search Console URL submission |
| gsc-ingestion.mjs | GSC data ingestion |
| lead-hunter.mjs | Lead scraping |
| outreach-engine.mjs | Email campaign automation |
| blog-image-generator.mjs | Imagen 4 cover image generation |
| instagram-agent.mjs | Social media content |
| seo-competitor-intelligence.mjs | Competitor analysis |
| seo-opportunity-engine.mjs | Opportunity scoring |
| seo-learning-engine.mjs | Outcome evaluation + learning |

---

## 9. Environment Variables

| Variable | Purpose |
|----------|---------|
| GEMINI_API_MODE | "free" or "paid" |
| GEMINI_FREE_KEY | Free tier Gemini API key |
| GEMINI_PAID_KEY | Paid tier Gemini API key |
| VITE_GEMINI_FREE_KEY | Frontend Gemini key (chat widget) |
| DATABASE_URL | Supabase PostgreSQL (pooled via PgBouncer) |
| DIRECT_DATABASE_URL | Direct Supabase connection (migrations) |
| GITHUB_TOKEN | GitHub PAT for auto-publishing |
| RESEND_API_KEY | Resend email API |
| SMTP_HOST/PORT/USER/PASS | Hostinger SMTP fallback |
| GOOGLE_CLIENT_ID/SECRET | OAuth for GSC |
| GSC_REFRESH_TOKEN | Google Search Console access |
| IMGBB_API_KEY | Blog image hosting |
| APOLLO_API_KEY | Lead intelligence (verified emails) |
| VITE_API_URL | Backend API URL |
| VITE_API_SECRET | API auth secret |
| VITE_ADMIN_ID/PASS | Agent Manager login |

---

## 10. Build & Run Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server (port 8080) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm start` | Start Express API server |
| `npm run agency` | Start API with .env loaded |
| `npm run lint` | ESLint |
| `npx prisma generate` | Generate Prisma client |
| `npx prisma db push` | Push schema to DB |
| `node --env-file=.env .github/scripts/agency-director.mjs` | Run director cycle |
| `node --env-file=.env .github/scripts/seo-auto-poster.mjs` | Run content team |
| `node --env-file=.env .github/scripts/seo-dev-agent.mjs` | Run structural team |
| `node --env-file=.env .github/scripts/technical-seo-agent.mjs` | Run tech team |

---

## 11. Conventions & Patterns

### Code Style
- React functional components with hooks
- TypeScript for all frontend code
- `.mjs` extension for backend scripts (ES modules)
- Tailwind for all styling (no CSS modules)
- Path alias: `@/` → `src/`
- shadcn/ui components in `src/components/ui/`

### Data Flow
- Blog posts: DB (BlogPost model) → API (`/api/services/:slug` or fetched in BlogPost page) → Frontend renders
- Service pages: Static .tsx files OR DynamicServicePage (DB-powered catch-all)
- The `blogPosts.ts` static array is empty; all posts come from PostgreSQL

### AI Integration Pattern
```javascript
import { smartCall, getModelsForRole } from './agency-core.mjs';
const models = await getModelsForRole('writer');
const result = await smartCall(models, prompt, 'AgentName', { json: true });
```

### Staging Workflow
```
Agent generates work → submitToStaging() → Pending Review
  → Director/Manager reviews → Approved? → Publisher deploys
  → Rejected? → Feedback stored, revision count incremented
```

### Auto-Commit Mode
When `isAutoCommit: true` in settings, staging items skip review and are auto-approved.

### Publishing Flow
```
Approved item → Publisher reads content → 
  Blog? → DB only (isLive: true)
  Page? → DB + GitHub API push (.tsx + App.tsx route)
  Patch? → GitHub API push
  → Sync live_posts.json → Submit URLs to GSC
```

---

## 12. Important Notes

- The frontend is a SPA; all routing is client-side (react-router-dom v6)
- DynamicServicePage is the catch-all for `/services/:slug` — it fetches page HTML from the DB and renders with `dangerouslySetInnerHTML`
- The AI Chat widget (AiChat.tsx) calls Gemini directly from the client (no backend proxy)
- The AgentManager is password-protected and only accessible at `/agent-manager`
- All agent scripts share `agency-core.mjs` for AI calls, staging, and logging
- The memory system (`memory-compiler.mjs`) provides full context to every agent before it runs
- GSAP ScrollTrigger is registered globally in App.tsx
- The build produces a single large JS bundle (~1.5MB); code-splitting is a future optimization
- `/noise.png` is a runtime reference (exists in public/)
- TypeScript 6 shows a `baseUrl` deprecation warning — not a real error
