import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PenTool, FileText, RefreshCw, Trash2, ExternalLink,
  Calendar, Clock, BookOpen, TrendingUp, AlertTriangle, Sparkles
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://fouriqtech.onrender.com"
    : "http://localhost:3848");

interface ContentHubProps {
  intelligence: any;
  activityFeed: any[];
  runningTasks: Record<string, any>;
}

export function ContentHubDepartment({ intelligence, activityFeed, runningTasks }: ContentHubProps) {
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const contentStrategy = intelligence?.opportunities?.content_strategy || {
    briefs: [], refresh_queue: [], prune_candidates: []
  };

  const recentContentActivity = activityFeed
    .filter((item) => String(item.source || "").toLowerCase().includes("content"))
    .slice(0, 8);

  // Fetch blog posts from API
  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/blogs`);
        if (res.ok) {
          const data = await res.json();
          setBlogPosts(data.posts || []);
        }
      } catch {
        /* API unavailable */
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  const isRunning = Boolean(runningTasks["content"]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Live Posts"
          value={blogPosts.length}
          icon={<BookOpen className="h-4 w-4" />}
          color="text-ai-purple"
          bgColor="border-ai-purple/20 bg-ai-purple/[0.03]"
        />
        <StatCard
          label="New Briefs"
          value={contentStrategy.briefs?.length || 0}
          icon={<Sparkles className="h-4 w-4" />}
          color="text-ai-primary"
          bgColor="border-ai-primary/20 bg-ai-primary/[0.03]"
        />
        <StatCard
          label="Needs Refresh"
          value={contentStrategy.refresh_queue?.length || 0}
          icon={<RefreshCw className="h-4 w-4" />}
          color="text-amber-400"
          bgColor="border-amber-400/20 bg-amber-400/[0.03]"
        />
        <StatCard
          label="Prune Candidates"
          value={contentStrategy.prune_candidates?.length || 0}
          icon={<Trash2 className="h-4 w-4" />}
          color="text-red-400"
          bgColor="border-red-400/20 bg-red-400/[0.03]"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Blog Posts Grid */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-bold tracking-[0.3em] text-slate-500 uppercase flex items-center gap-3">
              <PenTool className="h-4 w-4 text-ai-purple" /> PUBLISHED ARTICLES
            </h2>
            {isRunning && (
              <Badge className="bg-ai-purple/10 text-ai-purple border-ai-purple/20 text-[9px] uppercase tracking-widest animate-pulse">
                Writing...
              </Badge>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 border-2 border-ai-purple/30 border-t-ai-purple rounded-full animate-spin" />
            </div>
          ) : blogPosts.length === 0 ? (
            <Card className="border-dashed border-slate-800/60 bg-slate-900/10 rounded-[24px]">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="h-10 w-10 text-slate-800 mb-4" />
                <p className="text-sm font-bold text-slate-500">No published articles yet</p>
                <p className="text-[10px] text-slate-600 mt-2 uppercase tracking-widest">
                  Run a Content cycle to generate blog posts
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {blogPosts.map((post: any) => (
                <a
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <Card className="aether-card bg-slate-900/40 border-slate-800/60 rounded-[20px] overflow-hidden hover:border-ai-purple/30 transition-all duration-300 h-full">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[9px] uppercase tracking-widest bg-ai-purple/5 border-ai-purple/20 text-ai-purple rounded-full px-2.5 py-0.5">
                          {post.category || "Blog"}
                        </Badge>
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1">
                          <Calendar className="h-2.5 w-2.5" /> {post.date}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white group-hover:text-ai-purple transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" /> {post.readTime || "5 min"}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 text-slate-700 group-hover:text-ai-purple transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Strategy Intelligence */}
        <div className="space-y-6">
          {/* Content Briefs */}
          <Card className="aether-card bg-slate-900/40 border-slate-800/60 rounded-[24px]">
            <CardHeader className="pb-3">
              <CardDescription className="text-[9px] uppercase font-bold tracking-[0.2em] text-slate-500">CONTENT_STRATEGY</CardDescription>
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-ai-primary" /> Upcoming Briefs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contentStrategy.briefs?.length === 0 ? (
                <p className="text-xs text-slate-600">No new briefs queued.</p>
              ) : contentStrategy.briefs?.slice(0, 4).map((brief: any, i: number) => (
                <div key={`brief-${i}`} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 space-y-1.5">
                  <p className="text-xs text-white font-medium">{brief.target_slug}</p>
                  <p className="text-[10px] text-ai-primary">{brief.primary_keyword}</p>
                  <p className="text-[10px] text-slate-500">{brief.objective}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Refresh Queue */}
          {contentStrategy.refresh_queue?.length > 0 && (
            <Card className="aether-card bg-amber-500/[0.02] border-amber-500/10 rounded-[24px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-amber-400" /> Needs Refresh
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contentStrategy.refresh_queue.slice(0, 3).map((item: any, i: number) => (
                  <div key={`refresh-${i}`} className="rounded-xl border border-amber-500/10 bg-slate-950/50 p-3 space-y-1">
                    <p className="text-xs text-white">{item.slug}</p>
                    <p className="text-[10px] text-amber-400/70">Position {item.position} • {item.impressions} impressions</p>
                    <p className="text-[10px] text-slate-500">{item.reason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card className="aether-card bg-slate-900/40 border-slate-800/60 rounded-[24px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-ai-tertiary" /> Content Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[240px]">
                <div className="space-y-2">
                  {recentContentActivity.length === 0 ? (
                    <p className="text-xs text-slate-600">No content activity yet.</p>
                  ) : recentContentActivity.map((entry: any) => (
                    <div key={entry.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-950/30 border border-slate-800/30">
                      <span className="text-sm shrink-0">{entry.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-300 leading-snug">{entry.message}</p>
                        <p className="text-[9px] text-slate-600 mt-1">
                          {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, bgColor }: {
  label: string; value: number; icon: React.ReactNode; color: string; bgColor: string;
}) {
  return (
    <Card className={`aether-card ${bgColor} rounded-[20px] overflow-hidden`}>
      <CardContent className="p-5 flex flex-col gap-2">
        <div className={`flex items-center gap-2 ${color}`}>
          {icon}
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">{label}</span>
        </div>
        <span className="text-3xl font-display font-extrabold text-white">{value}</span>
      </CardContent>
    </Card>
  );
}
