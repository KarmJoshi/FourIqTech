import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  TrendingUp, TrendingDown, MousePointerClick, Eye,
  Target, BarChart3, ArrowUpRight, ArrowDownRight, Minus,
  Search, Globe, Sparkles, RefreshCw
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://fouriqtech.onrender.com"
    : "http://localhost:3848");

interface GscData {
  period: { days: number; since: string };
  summary: { totalClicks: number; totalImpressions: number; avgPosition: number; avgCtr: number; pageCount: number };
  delta: { clicks: number | null; impressions: number | null; position: number | null };
  timeSeries: { date: string; clicks: number; impressions: number; position: number; ctr: number }[];
  topPages: { page: string; clicks: number; impressions: number; position: number; ctr: number }[];
  topQueries: { query: string; clicks: number; impressions: number; position: number; ctr: number }[];
  insights: { type: string; text: string; page: string; query: string; confidence: number; date: string }[];
}

function DeltaBadge({ value, suffix = "%", inverse = false }: { value: number | null; suffix?: string; inverse?: boolean }) {
  if (value === null) return <span className="text-[10px] text-white/30">—</span>;
  const isPositive = inverse ? value < 0 : value > 0;
  const isNeutral = Math.abs(value) < 0.5;

  if (isNeutral) return (
    <span className="inline-flex items-center gap-0.5 text-[10px] text-white/40">
      <Minus className="h-2.5 w-2.5" /> 0{suffix}
    </span>
  );

  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
      {isPositive ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
      {Math.abs(value).toFixed(1)}{suffix}
    </span>
  );
}

function InsightBadge({ type }: { type: string }) {
  const config: Record<string, { color: string; label: string }> = {
    rising_star: { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Rising" },
    declining: { color: "bg-red-500/10 text-red-400 border-red-500/20", label: "Declining" },
    opportunity: { color: "bg-amber-500/10 text-amber-400 border-amber-500/20", label: "Opportunity" },
    new_keyword: { color: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "New" },
    winner: { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Winner" },
    stuck: { color: "bg-orange-500/10 text-orange-400 border-orange-500/20", label: "Stuck" },
  };
  const c = config[type] || { color: "bg-white/5 text-white/50 border-white/10", label: type };
  return <Badge variant="outline" className={`text-[9px] uppercase tracking-wider ${c.color}`}>{c.label}</Badge>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[#0d0d0f] px-3 py-2 shadow-xl">
      <p className="text-[10px] text-white/50 mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} className="text-[11px] font-medium" style={{ color: entry.color }}>
          {entry.name}: {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export function GscAnalytics() {
  const [data, setData] = useState<GscData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/gsc/analytics?days=${days}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (e) {
      console.error("GSC fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [days]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-5 w-5 text-white/30 animate-spin" />
      </div>
    );
  }

  if (!data || data.timeSeries.length === 0) {
    return (
      <div className="space-y-5 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Search Performance</h2>
            <p className="text-[11px] text-white/40">Google Search Console — fouriqtech.com</p>
          </div>
        </div>
        <Card className="border-[#1c1c1f] bg-[#111113]">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <BarChart3 className="h-8 w-8 text-white/20" />
            <p className="text-sm text-white/40">Syncing with Google Search Console...</p>
            <p className="text-xs text-white/25">Data will appear automatically once available. GSC typically has a 2-3 day reporting delay.</p>
            <button onClick={() => { setLoading(true); fetchData(); }} className="mt-3 px-3 py-1.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-[11px] text-white/60 hover:text-white/80 hover:bg-white/[0.08] transition-all flex items-center gap-1.5">
              <RefreshCw className="h-3 w-3" /> Refresh
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Search Performance</h2>
          <p className="text-[11px] text-white/40">Google Search Console — fouriqtech.com</p>
        </div>
        <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-lg p-0.5">
          {[7, 14, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                days === d ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-[#1c1c1f] bg-[#111113]">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-2">
              <MousePointerClick className="h-4 w-4 text-blue-400" />
              <DeltaBadge value={data.delta.clicks} />
            </div>
            <p className="text-2xl font-bold text-white">{data.summary.totalClicks.toLocaleString()}</p>
            <p className="text-[10px] text-white/35 mt-0.5">Total Clicks</p>
          </CardContent>
        </Card>

        <Card className="border-[#1c1c1f] bg-[#111113]">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-2">
              <Eye className="h-4 w-4 text-purple-400" />
              <DeltaBadge value={data.delta.impressions} />
            </div>
            <p className="text-2xl font-bold text-white">{data.summary.totalImpressions.toLocaleString()}</p>
            <p className="text-[10px] text-white/35 mt-0.5">Impressions</p>
          </CardContent>
        </Card>

        <Card className="border-[#1c1c1f] bg-[#111113]">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-4 w-4 text-emerald-400" />
              <DeltaBadge value={data.delta.position} suffix=" pos" />
            </div>
            <p className="text-2xl font-bold text-white">{data.summary.avgPosition}</p>
            <p className="text-[10px] text-white/35 mt-0.5">Avg Position</p>
          </CardContent>
        </Card>

        <Card className="border-[#1c1c1f] bg-[#111113]">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white">{data.summary.avgCtr}%</p>
            <p className="text-[10px] text-white/35 mt-0.5">Avg CTR</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Overview / Pages / Queries / Insights */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/[0.03] border border-white/[0.06]">
          <TabsTrigger value="overview" className="text-[11px] data-[state=active]:bg-white/10">Overview</TabsTrigger>
          <TabsTrigger value="pages" className="text-[11px] data-[state=active]:bg-white/10">Top Pages</TabsTrigger>
          <TabsTrigger value="queries" className="text-[11px] data-[state=active]:bg-white/10">Top Queries</TabsTrigger>
          <TabsTrigger value="insights" className="text-[11px] data-[state=active]:bg-white/10">Insights</TabsTrigger>
        </TabsList>

        {/* Overview — Time Series Charts */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Clicks & Impressions Area Chart */}
          <Card className="border-[#1c1c1f] bg-[#111113]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[13px] font-medium text-white/80">Clicks & Impressions</CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.timeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="impressionsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }} />
                  <Area type="monotone" dataKey="impressions" stroke="#a855f7" fill="url(#impressionsGrad)" strokeWidth={2} name="Impressions" />
                  <Area type="monotone" dataKey="clicks" stroke="#3b82f6" fill="url(#clicksGrad)" strokeWidth={2} name="Clicks" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Position & CTR Line Chart */}
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="border-[#1c1c1f] bg-[#111113]">
              <CardHeader className="pb-2">
                <CardTitle className="text-[13px] font-medium text-white/80">Average Position</CardTitle>
                <CardDescription className="text-[10px] text-white/30">Lower is better</CardDescription>
              </CardHeader>
              <CardContent className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.timeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis reversed tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="position" stroke="#10b981" strokeWidth={2} dot={false} name="Position" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-[#1c1c1f] bg-[#111113]">
              <CardHeader className="pb-2">
                <CardTitle className="text-[13px] font-medium text-white/80">Click-Through Rate</CardTitle>
                <CardDescription className="text-[10px] text-white/30">Higher is better</CardDescription>
              </CardHeader>
              <CardContent className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.timeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="ctr" stroke="#f59e0b" strokeWidth={2} dot={false} name="CTR %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top Pages */}
        <TabsContent value="pages" className="mt-4">
          <Card className="border-[#1c1c1f] bg-[#111113]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[13px] font-medium text-white/80">Top Pages by Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {/* Table Header */}
                <div className="grid grid-cols-[1fr_80px_100px_70px_60px] gap-2 px-3 py-2 text-[10px] text-white/30 uppercase tracking-wider border-b border-white/[0.04]">
                  <span>Page</span>
                  <span className="text-right">Clicks</span>
                  <span className="text-right">Impressions</span>
                  <span className="text-right">Position</span>
                  <span className="text-right">CTR</span>
                </div>
                {data.topPages.map((page, i) => (
                  <div key={page.page} className="grid grid-cols-[1fr_80px_100px_70px_60px] gap-2 px-3 py-2.5 rounded-md hover:bg-white/[0.02] transition-colors items-center">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] text-white/20 w-4">{i + 1}</span>
                      <Globe className="h-3 w-3 text-white/20 shrink-0" />
                      <span className="text-[11px] text-white/70 truncate">{page.page || "/"}</span>
                    </div>
                    <span className="text-[11px] text-white/80 text-right font-medium">{page.clicks}</span>
                    <span className="text-[11px] text-white/50 text-right">{page.impressions.toLocaleString()}</span>
                    <span className={`text-[11px] text-right font-medium ${page.position <= 10 ? "text-emerald-400" : page.position <= 20 ? "text-amber-400" : "text-white/50"}`}>
                      {page.position}
                    </span>
                    <span className="text-[11px] text-white/50 text-right">{page.ctr}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Queries */}
        <TabsContent value="queries" className="mt-4">
          <Card className="border-[#1c1c1f] bg-[#111113]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[13px] font-medium text-white/80">Top Search Queries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="grid grid-cols-[1fr_80px_100px_70px_60px] gap-2 px-3 py-2 text-[10px] text-white/30 uppercase tracking-wider border-b border-white/[0.04]">
                  <span>Query</span>
                  <span className="text-right">Clicks</span>
                  <span className="text-right">Impressions</span>
                  <span className="text-right">Position</span>
                  <span className="text-right">CTR</span>
                </div>
                {data.topQueries.map((q, i) => (
                  <div key={q.query} className="grid grid-cols-[1fr_80px_100px_70px_60px] gap-2 px-3 py-2.5 rounded-md hover:bg-white/[0.02] transition-colors items-center">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] text-white/20 w-4">{i + 1}</span>
                      <Search className="h-3 w-3 text-white/20 shrink-0" />
                      <span className="text-[11px] text-white/70 truncate">{q.query}</span>
                    </div>
                    <span className="text-[11px] text-white/80 text-right font-medium">{q.clicks}</span>
                    <span className="text-[11px] text-white/50 text-right">{q.impressions.toLocaleString()}</span>
                    <span className={`text-[11px] text-right font-medium ${q.position <= 10 ? "text-emerald-400" : q.position <= 20 ? "text-amber-400" : "text-white/50"}`}>
                      {q.position}
                    </span>
                    <span className="text-[11px] text-white/50 text-right">{q.ctr}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights */}
        <TabsContent value="insights" className="mt-4">
          <Card className="border-[#1c1c1f] bg-[#111113]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[13px] font-medium text-white/80 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" /> AI-Generated Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.insights.length === 0 ? (
                <p className="text-xs text-white/30 py-6 text-center">No insights generated yet. Run GSC ingestion first.</p>
              ) : (
                <div className="space-y-3">
                  {data.insights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <InsightBadge type={insight.type} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-white/70 leading-relaxed">{insight.text}</p>
                        <p className="text-[9px] text-white/25 mt-1">{insight.date}</p>
                      </div>
                      {insight.confidence && (
                        <span className="text-[9px] text-white/25 shrink-0">{Math.round(insight.confidence * 100)}%</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
