import { Crown, CheckCircle2, TrendingUp, Activity, FileText, Eye } from "lucide-react";

interface StatsBarProps {
  directorStatus: any;
  stagingStats: any;
  pendingCount: number;
  runningTasks: Record<string, any>;
  intelligence?: any;
}

export function StatsBar({ directorStatus, stagingStats, pendingCount, runningTasks, intelligence }: StatsBarProps) {
  const stats = [
    {
      label: "Blog Posts",
      value: directorStatus?.blog_posts || 0,
      sub: "Published",
      icon: FileText,
    },
    {
      label: "Pending Review",
      value: pendingCount,
      sub: `of ${stagingStats?.total_submitted || 0} total`,
      icon: Eye,
      highlight: pendingCount > 0,
    },
    {
      label: "Approval Rate",
      value: stagingStats?.approval_rate || "0%",
      sub: `${stagingStats?.approved || 0} approved`,
      icon: CheckCircle2,
    },
    {
      label: "Impressions",
      value: (intelligence?.gsc?.summary?.total_impressions || 0).toLocaleString(),
      sub: "30-day search",
      icon: Activity,
    },
    {
      label: "Clicks",
      value: intelligence?.gsc?.summary?.total_clicks || 0,
      sub: "Organic traffic",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-[#1c1c1f] bg-[#111113] p-4 flex flex-col justify-between min-h-[100px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-white/40 font-medium">{stat.label}</span>
            <stat.icon className="h-3.5 w-3.5 text-white/20" />
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-semibold ${stat.highlight ? "text-amber-400" : "text-white/90"}`}>
              {stat.value}
            </span>
            <p className="text-[10px] text-white/30 mt-0.5">{stat.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
