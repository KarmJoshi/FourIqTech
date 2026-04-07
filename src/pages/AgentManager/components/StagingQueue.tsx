import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, CheckCircle2, X, BookOpen, Crown, PenTool, Layers, Wrench, Loader2 } from "lucide-react";

interface StagingItem {
  id: string;
  type: string;
  department: string;
  status: string;
  created_at: string;
  title: string;
  summary: any;
  manager_review: { verdict: string; feedback: string; reviewed_at: string } | null;
  published_at?: string;
  revision_count?: number;
}

interface StagingQueueProps {
  stagingQueue: StagingItem[];
  reviewItem: (id: string, verdict: "approved" | "rejected", feedback: string) => Promise<void>;
  previewItem: (id: string) => Promise<void>;
  previewContent: { id: string; content: string } | null;
  setPreviewContent: (content: { id: string; content: string } | null) => void;
}

export function StagingQueue({ 
  stagingQueue, 
  reviewItem, 
  previewItem, 
  previewContent, 
  setPreviewContent 
}: StagingQueueProps) {
  const [reviewFeedback, setReviewFeedback] = useState<Record<string, string>>({});

  const typeIcon = (type: string) => {
    switch (type) {
      case "blog_post": return <PenTool className="h-4 w-4 text-ai-purple" />;
      case "landing_page": return <Layers className="h-4 w-4 text-ai-primary" />;
      case "technical_patch": return <Wrench className="h-4 w-4 text-ai-tertiary" />;
      default: return <FileText className="h-4 w-4 text-slate-500" />;
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending_review": return "border-amber-500/20 bg-amber-500/5 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.05)]";
      case "approved": return "border-ai-tertiary/20 bg-ai-tertiary/5 text-ai-tertiary shadow-[0_0_15px_rgba(16,185,129,0.05)]";
      case "rejected": return "border-red-500/20 bg-red-500/5 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.05)]";
      default: return "border-slate-800 text-slate-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* PREVIEW OVERLAY */}
      {previewContent && (
        <Card className="aether-card bg-slate-900 border-ai-primary/30 shadow-3xl animate-in fade-in zoom-in-95 duration-300 rounded-[32px] overflow-hidden">
          <CardHeader className="pb-4 flex flex-row items-center justify-between border-b border-slate-800 bg-slate-950/50 px-8 pt-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-ai-primary/10 border border-ai-primary/20">
                <BookOpen className="h-5 w-5 text-ai-primary" />
              </div>
              <div>
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.3em] text-ai-primary">ASSET_INSPECTION_TERMINAL</CardTitle>
                <CardDescription className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">UNIT_ID: {previewContent.id.toUpperCase()}</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setPreviewContent(null)} className="h-10 w-10 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl">
              <X className="h-6 w-6" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-auto p-10 bg-slate-950/40 font-mono text-xs leading-relaxed selection:bg-ai-primary/30 selection:text-white">
               <pre className="text-slate-300 whitespace-pre-wrap lowercase">
                {previewContent.content}
               </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* QUEUE LIST */}
      <div className="space-y-4">
        {stagingQueue.length === 0 ? (
          <Card className="border-dashed border-slate-800/60 bg-slate-900/10 hover:bg-slate-900/20 transition-colors rounded-[32px]">
            <CardContent className="flex flex-col items-center justify-center py-28 text-center">
              <div className="p-6 rounded-[32px] bg-slate-950/50 border border-slate-800 mb-8 text-slate-800">
                <FileText className="h-12 w-12" />
              </div>
              <p className="text-xl font-display font-bold text-slate-500 uppercase tracking-tight">Oversight Hub Idle</p>
              <p className="text-[10px] text-slate-600 mt-3 font-bold uppercase tracking-[0.2em]">Pending transmissions will materialize for command review.</p>
            </CardContent>
          </Card>
        ) : (
          stagingQueue.map((item) => (
            <Card key={item.id} className={`aether-card bg-slate-900/40 border-slate-800/60 shadow-xl transition-all duration-500 group overflow-hidden rounded-[28px] ${
              item.status === "pending_review" ? "border-amber-500/20 bg-slate-900/60" : ""
            }`}>
              <div className="absolute top-0 left-0 w-1.5 h-full bg-ai-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-7">
                <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
                  <div className="flex-1 min-w-0 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                       <Badge variant="outline" className="h-6 px-3 border-slate-800 bg-slate-950/50 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 rounded-full">
                        {typeIcon(item.type)} <span className="ml-2">{item.type.toUpperCase()}</span>
                       </Badge>
                       <Badge variant="outline" className={`h-6 px-3 text-[9px] font-bold uppercase tracking-[0.2em] rounded-full ${statusBadge(item.status)}`}>
                        {item.status.toUpperCase()}
                       </Badge>
                       <span className="text-[9px] font-bold text-slate-700 tracking-widest ml-1 uppercase">SIG_#{item.id.slice(0, 8)}</span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-display font-bold text-white group-hover:text-ai-primary transition-colors tracking-tight">{item.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        <span className="text-ai-primary/70">{item.department.toUpperCase()}_UNIT</span>
                        <div className="w-1 h-1 rounded-full bg-slate-800" />
                        <span>{new Date(item.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        {item.summary?.word_count && (
                          <><div className="w-1 h-1 rounded-full bg-slate-800" /><span>{item.summary.word_count} WORDS</span></>
                        )}
                        {item.summary?.qa_score && (
                          <><div className="w-1 h-1 rounded-full bg-slate-800" /><span className={item.summary.qa_score >= 80 ? "text-ai-tertiary" : "text-amber-500"}>QA_CONFIDENCE: {item.summary.qa_score}%</span></>
                        )}
                      </div>
                    </div>

                    {item.manager_review && (
                      <div className={`flex items-start gap-4 p-5 rounded-[20px] border ${
                        item.manager_review.verdict === "approved" ? "bg-ai-tertiary/5 border-ai-tertiary/10 text-ai-tertiary/80" : "bg-red-500/5 border-red-500/10 text-red-400/80"
                      }`}>
                        <Crown className="h-4 w-4 mt-0.5 shrink-0" />
                        <div className="text-[11px] leading-relaxed font-bold uppercase tracking-wide">
                          <span className="text-slate-500 mr-3">DIRECTOR_FEEDBACK:</span>
                          "{item.manager_review.feedback}"
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col gap-4 items-end shrink-0 w-full lg:w-auto">
                    <Button variant="outline" size="lg" onClick={() => previewItem(item.id)} className="h-12 w-full lg:w-52 justify-center gap-3 border-slate-800 bg-slate-950/50 hover:bg-slate-900 hover:border-slate-700 text-[10px] font-bold tracking-[0.2em] text-slate-400 hover:text-white transition-all rounded-xl uppercase">
                      <BookOpen className="h-4 w-4" /> INSPECT_UNIT
                    </Button>
                    
                    {item.status === "pending_review" && (
                      <div className="flex flex-col gap-3 w-full lg:w-52">
                        <Input
                          value={reviewFeedback[item.id] || ""}
                          onChange={(e) => setReviewFeedback(prev => ({ ...prev, [item.id]: e.target.value }))}
                          placeholder="MANDATE_DETAILS..."
                          className="h-11 text-[10px] font-bold bg-slate-950 border-slate-800 focus:border-ai-primary/40 focus:ring-0 rounded-xl uppercase tracking-widest placeholder:text-slate-700"
                        />
                        <div className="flex gap-3">
                          <Button size="sm" onClick={() => reviewItem(item.id, "approved", reviewFeedback[item.id] || "Strategic approval.")}
                            className="flex-1 h-11 bg-ai-tertiary/90 hover:bg-ai-tertiary text-white border-none shadow-xl shadow-ai-tertiary/10 text-[10px] font-bold tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl">
                            <CheckCircle2 className="mr-2 h-4 w-4" /> APPROVE
                          </Button>
                          <Button size="sm" onClick={() => reviewItem(item.id, "rejected", reviewFeedback[item.id] || "Needs revision.")}
                            variant="outline" className="flex-1 h-11 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 text-[10px] font-bold tracking-widest transition-all active:scale-[0.98] rounded-xl">
                            <X className="mr-2 h-4 w-4" /> REJECT
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
