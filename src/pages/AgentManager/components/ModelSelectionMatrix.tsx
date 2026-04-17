import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Server, BrainCircuit, Check, AlertCircle, Coins, Sparkles, RefreshCcw } from "lucide-react";

interface ModelSelectionMatrixProps {
  currentModels: Record<string, any>;
  onUpdate: (models: Record<string, string[]>) => void;
  isUpdating: boolean;
}

const AVAILABLE_MODELS = [
  { id: "gemini-3.1-pro-preview", label: "3.1 Pro", tier: "pro" },
  { id: "gemini-1.5-pro", label: "1.5 Pro", tier: "pro" },
  { id: "gemini-3.1-flash-lite-preview", label: "3.1 Flash", tier: "flash" },
  { id: "gemini-1.5-flash", label: "1.5 Flash", tier: "flash" },
  { id: "gemini-3-flash", label: "3 Flash", tier: "flash" },
  { id: "gemini-2.5-flash", label: "2.5 Flash", tier: "flash" }
];

const PRICING_INR = {
  pro: 10.50, // Approx ₹10.50 per complex execution
  flash: 0.25 // Approx ₹0.25 per rapid execution
};

const DEPARTMENTS = [
  { id: "management", label: "Management & Strategy" },
  { id: "content", label: "SEO Content Team" },
  { id: "landing_pages", label: "Landing Page Factory" },
  { id: "technical", label: "Technical SEO" },
  { id: "outreach", label: "Outreach & Revenue" }
];

const ROLES = [
  { id: "manager", dept: "management", label: "Agency Director (CEO)", recommended: "gemini-3.1-pro-preview", desc: "Orchestrates all departments and costs." },
  { id: "content_manager", dept: "content", label: "Content Strategist", recommended: "gemini-1.5-pro", desc: "Creates the brief and snippet strategy." },
  { id: "researcher", dept: "content", label: "SERP Researcher", recommended: "gemini-3.1-flash-lite-preview", desc: "Audits top 10 results and PAA gaps." },
  { id: "writer", dept: "content", label: "Content Writer", recommended: "gemini-1.5-flash", desc: "Generates technical blog posts." },
  { id: "qa", dept: "content", label: "QA Inspector", recommended: "gemini-3.1-pro-preview", desc: "Validates technical accuracy and tone." },
  { id: "scanner", dept: "outreach", label: "Revenue Scanner", recommended: "gemini-3.1-flash-lite-preview", desc: "Finds commercial niches and lead info." },
  { id: "architect", dept: "landing_pages", label: "Page Architect", recommended: "gemini-1.5-pro", desc: "Blueprints landing page structures." },
  { id: "builder", dept: "landing_pages", label: "Page Builder", recommended: "gemini-3.1-pro-preview", desc: "Writes production React/Tailwind code." },
  { id: "auditor", dept: "technical", label: "Code Auditor", recommended: "gemini-3.1-pro-preview", desc: "Scans for SEO and performance risks." },
  { id: "browser", dept: "technical", label: "Digital Scout", recommended: "gemini-1.5-flash", desc: "Executes automated site scraping." }
];

export function ModelSelectionMatrix({ currentModels, onUpdate, isUpdating }: ModelSelectionMatrixProps) {
  // Use a Ref to hold the absolute "Locked" state. 
  // Once the user interacts, we NEVER let props overwrite localModels until isUpdating finishes.
  const [localModels, setLocalModels] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const userInteracted = useRef(false);
  const prevIsUpdating = useRef(false);

  // 1. Initial Load: Only run once on mount when currentModels are available
  useEffect(() => {
    if (Object.keys(currentModels).length > 0 && !isInitialized) {
      const init: Record<string, string> = {};
      ROLES.forEach(role => {
        const val = currentModels[role.id];
        init[role.id] = Array.isArray(val) ? val[0] : (typeof val === 'string' ? val : AVAILABLE_MODELS[0].id);
      });
      setLocalModels(init);
      setIsInitialized(true);
    }
  }, [currentModels, isInitialized]);

  // 2. Post-Save Sync: Only overwrite local state when a SAVE operation has successfully concluded
  useEffect(() => {
    if (!isUpdating && prevIsUpdating.current) {
      // Save just finished!
      userInteracted.current = false;
      const sync: Record<string, string> = {};
      ROLES.forEach(role => {
        const val = currentModels[role.id];
        sync[role.id] = Array.isArray(val) ? val[0] : (typeof val === 'string' ? val : AVAILABLE_MODELS[0].id);
      });
      setLocalModels(sync);
      setHasChanges(false);
    }
    prevIsUpdating.current = isUpdating;
  }, [isUpdating, currentModels]);

  // 3. Prevent Poll Drift: A simple effect to kill hasChanges if we somehow match current props again
  useEffect(() => {
    if (!userInteracted.current || isUpdating) return;
    let changed = false;
    ROLES.forEach(r => {
      let original = currentModels?.[r.id];
      if (Array.isArray(original)) original = original[0];
      if (!original) original = AVAILABLE_MODELS[0].id;
      if (localModels[r.id] !== original) changed = true;
    });
    setHasChanges(changed);
  }, [localModels, currentModels, isUpdating]);

  const totalCost = Object.values(localModels).reduce((acc, id) => {
    const m = AVAILABLE_MODELS.find(x => x.id === id);
    return acc + (m ? PRICING_INR[m.tier as keyof typeof PRICING_INR] : 0);
  }, 0);

  const handleChange = (roleId: string, model: string) => {
    userInteracted.current = true;
    setLocalModels(prev => ({ ...prev, [roleId]: model }));
  };

  const handleSave = () => {
    const payload: Record<string, string[]> = {};
    Object.entries(localModels).forEach(([role, model]) => {
      // Send the selection with a robust fallback chain
      payload[role] = [model, "gemini-3.1-flash-lite-preview", "gemini-3-flash", "gemini-2.5-flash"];
    });
    onUpdate(payload);
  };

  const handleReset = () => {
    userInteracted.current = false;
    setIsInitialized(false); // Trigger re-init
  };

  return (
    <Card className="aether-card border-ai-tertiary/20 bg-ai-tertiary/[0.02] rounded-[24px] overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-ai-tertiary" />
              <span className="text-[9px] font-bold tracking-[0.2em] text-slate-500 uppercase">INTELLIGENCE MATRIX</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-display font-bold text-white">Agent Model Matrix</CardTitle>
          </div>
          <div className="flex flex-wrap items-center gap-4 bg-slate-950/40 p-2 rounded-2xl border border-white/5 self-start">
             <div className="flex flex-col items-end px-3 border-r border-white/10 mr-1">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Est. Cycle Cost (INR)</span>
                <span className="text-sm font-mono font-bold text-ai-tertiary flex items-center gap-1.5">
                   <Coins className="w-3.5 h-3.5" /> ₹{totalCost.toFixed(2)}
                </span>
             </div>
             {hasChanges && (
                <div className="flex items-center gap-2">
                   <button onClick={handleReset} className="text-[9px] font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-1">
                      <RefreshCcw className="w-2.5 h-2.5" /> RESET
                   </button>
                   <span className="text-[9px] font-bold tracking-widest text-orange-400 uppercase flex items-center gap-1 animate-pulse">
                     <AlertCircle className="w-3 h-3" /> PENDING SAVE
                   </span>
                </div>
             )}
            <button
              onClick={handleSave}
              disabled={isUpdating || !hasChanges}
              className={`h-9 px-5 rounded-xl transition-all font-bold text-xs flex items-center gap-2 ${
                hasChanges 
                  ? "bg-ai-tertiary text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-ai-tertiary/90" 
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              <Server className="w-3 h-3" /> APPLY MATRIX
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 mt-4">
          {DEPARTMENTS.map(dept => {
            const deptRoles = ROLES.filter(r => r.dept === dept.id);
            const deptCost = deptRoles.reduce((acc, role) => {
               const m = AVAILABLE_MODELS.find(x => x.id === (localModels[role.id] || AVAILABLE_MODELS[0].id));
               return acc + (m ? PRICING_INR[m.tier as keyof typeof PRICING_INR] : 0);
            }, 0);

            return (
              <div key={dept.id} className="space-y-4">
                 <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">{dept.label}</h3>
                    <div className="flex items-center gap-2 bg-slate-900/50 px-2 py-1 rounded w-fit border border-white/5">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Est. Dept Cost</span>
                        <span className="text-xs font-mono font-bold text-ai-tertiary">₹{deptCost.toFixed(2)}</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {deptRoles.map(role => (
                      <div key={role.id} className="bg-slate-950/40 border border-white/5 p-4 rounded-2xl space-y-3 flex flex-col justify-between group hover:border-ai-tertiary/20 transition-all duration-300">
                         <div className="space-y-1">
                            <h4 className="text-sm font-bold text-white flex items-center justify-between">
                               {role.label}
                               <span className="text-[8px] text-slate-600 font-mono tracking-tighter">ID: {role.id.toUpperCase()}</span>
                            </h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed min-h-[30px]">{role.desc}</p>
                         </div>
                         
                         <div className="pt-2 relative">
                            <select
                                value={localModels[role.id] || AVAILABLE_MODELS[0].id}
                                onChange={(e) => handleChange(role.id, e.target.value)}
                                className={`w-full bg-slate-950 border appearance-none py-2.5 px-3 rounded-xl text-[11px] font-mono transition-all outline-none ${
                                    hasChanges && localModels[role.id] !== (Array.isArray(currentModels?.[role.id]) ? currentModels[role.id][0] : (typeof currentModels?.[role.id] === 'string' ? currentModels[role.id] : AVAILABLE_MODELS[0].id))
                                    ? "border-orange-500 text-orange-400 ring-1 ring-orange-500/20"
                                    : "border-white/10 text-slate-400 focus:border-ai-tertiary/50 focus:text-white"
                                }`}
                            >
                                {AVAILABLE_MODELS.map(m => (
                                  <option key={m.id} value={m.id}>
                                     {m.label} {role.recommended === m.id ? '(Recommended)' : ''} — {m.tier === 'pro' ? '₹10.5' : '₹0.25'}
                                  </option>
                                ))}
                            </select>
                            {localModels[role.id] === role.recommended && (
                               <div className="absolute -top-1 -right-1 bg-ai-tertiary text-slate-950 rounded-full p-0.5 shadow-lg border border-slate-900">
                                  <Sparkles className="w-2.5 h-2.5" />
                               </div>
                            )}
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
