import { Crown, PenTool, Wrench, Globe, Mail, Instagram, MessageCircle, LogOut, Zap, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

type DeptId = "director" | "content" | "techseo" | "landing" | "outreach" | "instagram";

interface SidebarProps {
  activeDept: DeptId;
  setActiveDept: (dept: DeptId) => void;
  onChatOpen: () => void;
  onLogout: () => void;
  apiOnline: boolean;
  isAutoPilot: boolean;
}

const NAV_ITEMS: { id: DeptId; label: string; icon: any; badge?: string }[] = [
  { id: "director", label: "Command Center", icon: Crown },
  { id: "content", label: "Content Studio", icon: PenTool },
  { id: "techseo", label: "Technical SEO", icon: Wrench },
  { id: "landing", label: "Landing Pages", icon: Globe },
  { id: "instagram", label: "Social Media", icon: Instagram },
  { id: "outreach", label: "Outreach", icon: Mail },
];

export function Sidebar({ activeDept, setActiveDept, onChatOpen, onLogout, apiOnline, isAutoPilot }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`fixed left-0 top-0 bottom-0 ${collapsed ? "w-[68px]" : "w-[260px]"} bg-[#09090b] border-r border-white/[0.06] flex flex-col z-50 transition-all duration-300`}>
      
      {/* Header */}
      <div className="h-[60px] flex items-center justify-between px-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <Zap className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-white leading-tight">SEO Agency</span>
              <span className="text-[10px] text-slate-500 leading-tight">Autonomous Platform</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-6 w-6 rounded-md flex items-center justify-center text-slate-600 hover:text-slate-400 hover:bg-white/[0.05] transition-colors shrink-0"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* System Status */}
      <div className="px-3 py-3">
        <div className={`flex items-center gap-2.5 ${collapsed ? "justify-center" : "px-2"} py-2 rounded-lg ${apiOnline ? "bg-emerald-500/[0.08]" : "bg-red-500/[0.08]"}`}>
          <span className={`h-2 w-2 rounded-full shrink-0 ${apiOnline ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]"}`} />
          {!collapsed && (
            <span className={`text-[11px] font-medium ${apiOnline ? "text-emerald-400" : "text-red-400"}`}>
              {apiOnline ? "System Online" : "System Offline"}
            </span>
          )}
        </div>
        {isAutoPilot && !collapsed && (
          <div className="flex items-center gap-2 px-2 py-1.5 mt-2 rounded-lg bg-violet-500/[0.08] border border-violet-500/[0.12]">
            <Activity className="h-3 w-3 text-violet-400 animate-pulse shrink-0" />
            <span className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider">Auto-Pilot Active</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-[0.12em] px-3 mb-2 mt-1">Workspace</p>
        )}
        {NAV_ITEMS.map((item) => {
          const isActive = activeDept === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveDept(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-150 group relative ${
                isActive
                  ? "bg-white/[0.08] text-white"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full" />
              )}
              <item.icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-400"}`} />
              {!collapsed && (
                <span className={`text-[13px] font-medium truncate ${isActive ? "text-white" : ""}`}>{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/[0.06] p-2 space-y-0.5">
        <button
          onClick={onChatOpen}
          title={collapsed ? "AI Chat" : undefined}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/[0.06] transition-all"
        >
          <MessageCircle className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="text-[13px] font-medium">AI Assistant</span>}
        </button>
        <button
          onClick={onLogout}
          title={collapsed ? "Logout" : undefined}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-slate-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="text-[13px] font-medium">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
