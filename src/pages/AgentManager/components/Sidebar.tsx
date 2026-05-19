import { Crown, PenTool, Wrench, Globe, Mail, Instagram, MessageCircle, Settings, Activity, LogOut, Zap } from "lucide-react";

type DeptId = "director" | "content" | "techseo" | "landing" | "outreach" | "instagram";

interface SidebarProps {
  activeDept: DeptId;
  setActiveDept: (dept: DeptId) => void;
  onChatOpen: () => void;
  onLogout: () => void;
  apiOnline: boolean;
  isAutoPilot: boolean;
}

const NAV_ITEMS: { id: DeptId; label: string; icon: any; shortLabel: string }[] = [
  { id: "director", label: "Director", icon: Crown, shortLabel: "CMD" },
  { id: "content", label: "Content", icon: PenTool, shortLabel: "BLG" },
  { id: "techseo", label: "Tech SEO", icon: Wrench, shortLabel: "SEO" },
  { id: "landing", label: "Pages", icon: Globe, shortLabel: "PGS" },
  { id: "instagram", label: "Social", icon: Instagram, shortLabel: "SOC" },
  { id: "outreach", label: "Outreach", icon: Mail, shortLabel: "OUT" },
];

export function Sidebar({ activeDept, setActiveDept, onChatOpen, onLogout, apiOnline, isAutoPilot }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[72px] lg:w-[240px] bg-slate-950/80 backdrop-blur-xl border-r border-white/[0.06] flex flex-col z-40 transition-all">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center lg:justify-start lg:px-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="hidden lg:block text-sm font-bold text-white tracking-tight">FourIQ Agency</span>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="px-3 lg:px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-center lg:justify-start gap-2">
          <span className={`h-2 w-2 rounded-full ${apiOnline ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" : "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.6)]"}`} />
          <span className="hidden lg:block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            {apiOnline ? "System Online" : "Offline"}
          </span>
        </div>
        {isAutoPilot && (
          <div className="hidden lg:flex items-center gap-1.5 mt-2 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
            <Activity className="h-3 w-3 text-emerald-400 animate-pulse" />
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Auto-Pilot</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 lg:px-3 space-y-1 overflow-y-auto">
        <p className="hidden lg:block text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] px-2 mb-2">Departments</p>
        {NAV_ITEMS.map((item) => {
          const isActive = activeDept === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveDept(item.id)}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 group relative ${
                isActive
                  ? "bg-white/[0.08] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-cyan-400 rounded-r-full" />
              )}
              <item.icon className={`h-[18px] w-[18px] shrink-0 transition-colors ${isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-400"}`} />
              <span className="hidden lg:block text-[13px] font-medium">{item.label}</span>
              <span className="lg:hidden text-[8px] font-bold uppercase tracking-wider">{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-white/[0.06] p-2 lg:p-3 space-y-1">
        <button
          onClick={onChatOpen}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-500 hover:text-cyan-400 hover:bg-cyan-400/[0.06] transition-all"
        >
          <MessageCircle className="h-[18px] w-[18px] shrink-0" />
          <span className="hidden lg:block text-[13px] font-medium">AI Chat</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-500 hover:text-red-400 hover:bg-red-400/[0.06] transition-all"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          <span className="hidden lg:block text-[13px] font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
