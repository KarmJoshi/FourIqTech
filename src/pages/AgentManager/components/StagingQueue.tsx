import { useState } from "react";
import { FileText, CheckCircle2, X, BookOpen, PenTool, Layers, Wrench, Crown } from "lucide-react";

interface StagingItem {
  id: string;
  type: string;
  department: string;
  status: string;
  createdAt: string;
  title: string;
  summary: any;
  managerReview: { verdict: string; feedback: string } | null;
}

interface StagingQueueProps {
  stagingQueue: StagingItem[];
  reviewItem: (id: string, verdict: "approved" | "rejected", feedback: string) => Promise<void>;
  previewItem: (id: string) => Promise<void>;
  previewContent: { id: string; content: string } | null;
  setPreviewContent: (content: { id: string; content: string } | null) => void;
}

export function StagingQueue({ stagingQueue, reviewItem, previewItem, previewContent, setPreviewContent }: StagingQueueProps) {
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  const typeIcon = (type: string) => {
    if (type.includes("blog")) return <PenTool className="h-3.5 w-3.5" />;
    if (type.includes("landing") || type.includes("structural")) return <Layers className="h-3.5 w-3.5" />;
    if (type.includes("technical")) return <Wrench className="h-3.5 w-3.5" />;
    return <FileText className="h-3.5 w-3.5" />;
  };

  return (
    <div className="space-y-3">
      {/* Preview Modal */}
      {previewContent && (
        <div className="rounded-lg border border-[#1c1c1f] bg-[#111113] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1c1c1f]">
            <span className="text-[11px] text-white/40 font-medium">Preview: {previewContent.id}</span>
            <button onClick={() => setPreviewContent(null)} className="text-white/30 hover:text-white/60">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-[400px] overflow-auto p-4">
            <pre className="text-[12px] text-white/50 whitespace-pre-wrap font-mono leading-relaxed">{previewContent.content}</pre>
          </div>
        </div>
      )}

      {/* Queue */}
      {stagingQueue.length === 0 ? (
        <div className="rounded-lg border border-[#1c1c1f] border-dashed bg-[#111113]/50 py-16 text-center">
          <FileText className="h-8 w-8 text-white/10 mx-auto mb-3" />
          <p className="text-[12px] text-white/20">No items in staging queue</p>
        </div>
      ) : (
        stagingQueue.map((item) => (
          <div key={item.id} className="rounded-lg border border-[#1c1c1f] bg-[#111113] p-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center gap-1.5 text-[10px] text-white/30 font-medium bg-white/[0.04] px-2 py-0.5 rounded">
                    {typeIcon(item.type)} {item.type.replace(/_/g, ' ')}
                  </span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                    item.status === "pending_review" ? "bg-amber-500/10 text-amber-400/80" :
                    item.status === "approved" || item.status === "published" ? "bg-emerald-500/10 text-emerald-400/80" :
                    "bg-red-500/10 text-red-400/80"
                  }`}>
                    {item.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h3 className="text-[14px] font-medium text-white/80 leading-snug">{item.title}</h3>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[10px] text-white/25">{item.department}</span>
                  <span className="text-[10px] text-white/15">{new Date(item.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
              </div>

              <button
                onClick={() => previewItem(item.id)}
                className="shrink-0 px-3 py-1.5 rounded-md text-[11px] text-white/40 border border-[#1c1c1f] hover:bg-white/[0.04] hover:text-white/60 transition-colors"
              >
                Preview
              </button>
            </div>

            {/* Director Feedback */}
            {item.managerReview && (
              <div className={`mt-3 flex items-start gap-2 px-3 py-2 rounded-md ${
                item.managerReview.verdict === "approved" ? "bg-emerald-500/[0.05]" : "bg-red-500/[0.05]"
              }`}>
                <Crown className="h-3 w-3 text-white/30 mt-0.5 shrink-0" />
                <span className="text-[11px] text-white/40">"{item.managerReview.feedback}"</span>
              </div>
            )}

            {/* Review Actions */}
            {item.status === "pending_review" && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  value={feedback[item.id] || ""}
                  onChange={(e) => setFeedback(prev => ({ ...prev, [item.id]: e.target.value }))}
                  placeholder="Feedback (optional)"
                  className="flex-1 h-8 px-3 text-[11px] bg-[#0c0c0e] border border-[#1c1c1f] rounded-md text-white/60 outline-none focus:border-white/20 placeholder:text-white/15"
                />
                <button
                  onClick={() => reviewItem(item.id, "approved", feedback[item.id] || "Approved.")}
                  className="h-8 px-3 rounded-md bg-emerald-500/20 text-emerald-400 text-[11px] font-medium hover:bg-emerald-500/30 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => reviewItem(item.id, "rejected", feedback[item.id] || "Rejected.")}
                  className="h-8 px-3 rounded-md bg-red-500/10 text-red-400/80 text-[11px] font-medium hover:bg-red-500/20 transition-colors"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
