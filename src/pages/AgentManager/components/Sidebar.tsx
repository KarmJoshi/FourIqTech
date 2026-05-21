import { Crown, PenTool, Wrench, Globe, Mail, Instagram, MessageCircle, LogOut, Zap, Activity, ChevronLeft, ChevronRight, Link2 } from "lucide-react";
import { useState } from "react";

type DeptId = "director" | "content" | "techseo" | "landing" | "backlinks" | "outreach" | "instagram";

interface SidebarProps {
  activeDept: DeptId;
  setActiveDept: (dept: DeptId) => void;
  onChatOpen: () => void;
  onLogout: () => void;
  apiOnline: boolean;
  isAutoPilot: boolean;
}

const NAV_ITEMS: { id: DeptId; label: string; icon: any }[] = [
  { id: "director", label: "Command Center", icon: Crown },
  { id: "content", label: "Content Studio", icon: PenTool },
  { id: "techseo", label: "Technical SEO", icon: Wrench },
  { id: "landing", label: "Landing Pages", icon: Globe },
  { id: "backlinks", label: "Backlinks", icon: Link2 },
  { id: "instagram", label: "Social Media", icon: Instagram },
  { id: "outreach", label: "Outreach", icon: Mail },
];

export function Sidebar({ activeDept, setActiveDept, onChatOpen, onLogout, apiOnline, isAutoPilot }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`fixed left-0 top-0 bottom-0 ${collapsed ? "w-[60px]" : "w-[240px]"} bg-[#0c0c0e] border-r border-[#1c1c1f] flex flex-col z-50 transition-all duration-200`}>
      
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-[#1c1c1f]">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="h-7 w-7 rounded-md bg-white flex items-center justify-center shrink-0">
            <Zap className="h-3.5 w-3.5 text-black" />
          </div>
          {!collapsed && (
            <span className="text-[13px] font-semibold text-white/90 truncate">SEO Agency</span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-5 w-5 rounded flex items-center justify-center text-white/30 hover:text-white/60 transition-colors shrink-0"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </div>

      {/* Status */}
      <div className="px-3 py-2.5">
        <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : "px-2"} py-1.5`}>
          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${apiOnline ? "bg-emerald-400" : "bg-red-400"}`} />
          {!collapsed && (
            <span className="text-[11px] text-white/40 font-medium">
              {apiOnline ? "Online" : "Offline"}
            </span>
          )}
        </div>
        {isAutoPilot && !collapsed && (
          <div className="flex items-center gap-1.5 px-2 py-1 mt-1">
            <Activity className="h-3 w-3 text-emerald-400 animate-pulse shrink-0" />
            <span className="text-[10px] font-medium text-emerald-400/80">Auto-Pilot</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeDept === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveDept(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-2.5 rounded-md px-2.5 py-[7px] transition-all duration-100 group ${
                isActive
                  ? "bg-white/[0.08] text-white"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
              }`}
            >
              <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : ""}`} />
              {!collapsed && (
                <span className="text-[13px] font-medium truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-[#1c1c1f] p-2 space-y-0.5">
        <button
          onClick={onChatOpen}
          className="w-full flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all"
        >
          <MessageCircle className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="text-[13px] font-medium">AI Chat</span>}
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-white/40 hover:text-red-400/80 hover:bg-red-500/[0.05] transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="text-[13px] font-medium">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
