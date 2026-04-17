import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Layers, ExternalLink, Globe, Calendar,
  Sparkles, ArrowUpRight, Layout, FileText
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://fouriqtech.onrender.com"
    : "http://localhost:3848");

const SITE_URL = "https://fouriqtech.com";

// Static known service pages from App.tsx routes
const STATIC_PAGES = [
  {
    slug: "enterprise-react-performance-optimization",
    title: "Enterprise React Performance Optimization",
    route: "/services/enterprise-react-performance-optimization",
    source: "static"
  },
  {
    slug: "enterprise-revenue-acceleration",
    title: "Enterprise Revenue Acceleration",
    route: "/services/enterprise-revenue-acceleration",
    source: "static"
  },
  {
    slug: "custom-saas-platform-development",
    title: "Custom SaaS Platform Development",
    route: "/services/custom-saas-platform-development",
    source: "static"
  },
  {
    slug: "legacy-web-application-modernization",
    title: "Legacy Web Application Modernization",
    route: "/services/legacy-web-application-modernization",
    source: "static"
  },
  {
    slug: "enterprise-headless-commerce-development",
    title: "Enterprise Headless Commerce Development",
    route: "/services/enterprise-headless-commerce-development",
    source: "static"
  },
  {
    slug: "enterprise-ui-ux-design-services",
    title: "Enterprise UI/UX Design Services",
    route: "/services/enterprise-ui-ux-design-services",
    source: "static"
  },
];

interface LandingPagesProps {
  intelligence: any;
  activityFeed: any[];
  stagingQueue: any[];
}

export function LandingPagesDepartment({ intelligence, activityFeed, stagingQueue }: LandingPagesProps) {
  const [dbPages, setDbPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const linkPlan = intelligence?.opportunities?.internal_link_plan || [];

  // Landing pages from staging queue
  const pendingLandingPages = stagingQueue.filter(
    (item) => (item.type === "landing_page" || item.type === "structural_page") && item.status === "pending_review"
  );

  useEffect(() => {
    async function loadPages() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/services`);
        if (res.ok) {
          const data = await res.json();
          setDbPages(data.pages || []);
        }
      } catch {
        /* API unavailable */
      } finally {
        setLoading(false);
      }
    }
    loadPages();

    // Auto-refresh every 30s for new pages
    const interval = setInterval(loadPages, 30000);
    return () => clearInterval(interval);
  }, []);

  // Merge static + DB pages, deduplicate by slug
  const allPages = [...dbPages.map(p => ({ ...p, source: "database" })), ...STATIC_PAGES];
  const uniquePages = allPages.filter(
    (page, index, self) => index === self.findIndex((p) => p.slug === page.slug)
  );

  const structuralActivity = activityFeed
    .filter((item) => String(item.source || "").toLowerCase().includes("structural"))
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="aether-card border-ai-blue/20 bg-ai-blue/[0.03] rounded-[20px]">
          <CardContent className="p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-ai-blue">
              <Globe className="h-4 w-4" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Total Pages</span>
            </div>
            <span className="text-3xl font-display font-extrabold text-white">{uniquePages.length}</span>
          </CardContent>
        </Card>
        <Card className="aether-card border-ai-primary/20 bg-ai-primary/[0.03] rounded-[20px]">
          <CardContent className="p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-ai-primary">
              <Layers className="h-4 w-4" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Link Opportunities</span>
            </div>
            <span className="text-3xl font-display font-extrabold text-white">{linkPlan.length}</span>
          </CardContent>
        </Card>
        <Card className="aether-card border-amber-400/20 bg-amber-400/[0.03] rounded-[20px]">
          <CardContent className="p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-amber-400">
              <Sparkles className="h-4 w-4" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Pending Review</span>
            </div>
            <span className="text-3xl font-display font-extrabold text-white">{pendingLandingPages.length}</span>
          </CardContent>
        </Card>
      </div>

      {/* Pages Grid */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-bold tracking-[0.3em] text-slate-500 uppercase flex items-center gap-3">
            <Layout className="h-4 w-4 text-ai-blue" /> LIVE LANDING PAGES
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-2 border-ai-blue/30 border-t-ai-blue rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {uniquePages.map((page) => (
              <a
                key={page.slug}
                href={page.route || `/services/${page.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="aether-card bg-slate-900/40 border-slate-800/60 rounded-[20px] overflow-hidden hover:border-ai-blue/30 transition-all duration-300 h-full">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="p-2.5 rounded-xl bg-ai-blue/5 border border-ai-blue/10 shrink-0">
                        <Globe className="h-5 w-5 text-ai-blue" />
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-slate-700 group-hover:text-ai-blue transition-colors shrink-0" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-bold text-white group-hover:text-ai-blue transition-colors leading-snug">
                        {page.title}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-mono truncate">
                        {page.route || `/services/${page.slug}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[8px] uppercase tracking-widest rounded-full px-2 py-0.5 ${
                          page.source === "database"
                            ? "bg-ai-tertiary/5 border-ai-tertiary/20 text-ai-tertiary"
                            : "bg-slate-800/50 border-slate-700 text-slate-400"
                        }`}
                      >
                        {page.source === "database" ? "AI Generated" : "Hand-Built"}
                      </Badge>
                      {page.createdAt && (
                        <span className="text-[9px] text-slate-600 flex items-center gap-1">
                          <Calendar className="h-2.5 w-2.5" />
                          {new Date(page.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Internal Link Plan */}
      {linkPlan.length > 0 && (
        <div className="space-y-5">
          <h2 className="text-[10px] font-bold tracking-[0.3em] text-slate-500 uppercase flex items-center gap-3">
            <Layers className="h-4 w-4 text-ai-primary" /> INTERNAL LINK OPPORTUNITIES
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {linkPlan.slice(0, 6).map((item: any, i: number) => (
              <Card key={`link-${i}`} className="aether-card bg-slate-900/40 border-slate-800/60 rounded-[20px]">
                <CardContent className="p-4 space-y-2">
                  <p className="text-xs text-white font-medium">{item.target}</p>
                  <p className="text-[10px] text-slate-500">
                    Position {item.target_position} • {item.target_impressions} impressions
                  </p>
                  <p className="text-[10px] text-ai-blue uppercase tracking-widest">{item.anchor_direction}</p>
                  <p className="text-[10px] text-slate-600">
                    Sources: {item.suggested_sources?.map((s: any) => s.source).join(", ") || "none"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pending in Staging */}
      {pendingLandingPages.length > 0 && (
        <div className="space-y-5">
          <h2 className="text-[10px] font-bold tracking-[0.3em] text-slate-500 uppercase flex items-center gap-3">
            <FileText className="h-4 w-4 text-amber-400" /> PENDING REVIEW ({pendingLandingPages.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {pendingLandingPages.map((item: any) => (
              <Card key={item.id} className="aether-card bg-amber-500/[0.02] border-amber-500/10 rounded-[20px]">
                <CardContent className="p-4 space-y-2">
                  <p className="text-xs text-white font-bold">{item.title}</p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[8px] uppercase tracking-widest">
                      Pending Review
                    </Badge>
                    <span className="text-[9px] text-slate-600">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
