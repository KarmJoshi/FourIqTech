import { Activity, Bell, Search } from "lucide-react";

type DeptId = "director" | "content" | "techseo" | "landing" | "outreach" | "instagram";

interface TopBarProps {
  activeDept: DeptId;
  pendingCount: number;
  runningTasks: Record<string, any>;
}

const DEPT_TITLES: Record<DeptId, { title: string; subtitle: string }> = {
  director: { title: "Agency Director", subtitle: "Strategic command center — dispatch teams, review work, monitor performance" },
  content: { title: "Content Hub", subtitle: "Blog articles, SEO content pipeline, and publishing queue" },
  techseo: { title: "Technical SEO", subtitle: "Site health audits, Core Web Vitals, and performance patches" },
  landing: { title: "Landing Pages", subtitle: "Service page generation, architecture, and deployment" },
  instagram: { title: "Social Hub", subtitle: "Instagram content brainstorming, visuals, and scheduling" },
  outreach: { title: "Outreach Agent", subtitle: "Lead hunting, email drafting, and cold outreach campaigns" },
};

export function TopBar({ activeDept, pendingCount, runningTasks }: TopBarProps) {
  const dept = DEPT_TITLES[activeDept];
  const activeTaskCount = Object.keys(runningTasks).length;

  return (
    <header className="h-16 border-b border-white/[0.06] bg-slate-950/40 backdrop-blur-sm flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30">
      {/* Left: Page Title */}
      <div>
        <h1 className="text-[15px] font-semibold text-white">{dept.title}</h1>
        <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block">{dept.subtitle}</p>
      </div>

      {/* Right: Status Indicators */}
      <div className="flex items-center gap-3">
        {/* Running Tasks */}
        {activeTaskCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <Activity className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-cyan-400">
              {activeTaskCount} running
            </span>
          </div>
        )}

        {/* Pending Reviews */}
        {pendingCount > 0 && (
          <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Bell className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[11px] font-semibold text-amber-400">
              {pendingCount} pending
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
