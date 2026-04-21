import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Instagram, Camera, Sparkles, Send, Calendar, 
  Layout, Eye, Trash2, CheckCircle2, Clock, Zap,
  TrendingUp, Image as ImageIcon, MessageSquare, X
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SocialPost {
  id: string;
  type: string;
  topicPillar: string;
  status: string;
  caption: string;
  hashtags: string;
  visualPrompt?: string;
  imageUrl?: string;
  videoUrl?: string;
  quizData?: any;
  createdAt: string;
  engagementStats?: {
    likes: number;
    comments: number;
  };
}

export function InstagramDepartment() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isVisualizing, setIsVisualizing] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const fetchPosts = async () => {
    try {
      const res = await fetch("http://localhost:3848/api/social/posts");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error("Failed to fetch social posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("http://localhost:3848/api/social/posts/draft", {
        method: "POST"
      });
      if (res.ok) {
        setTimeout(fetchPosts, 5000);
      }
    } catch (err) {
      console.error("Failed to trigger generation:", err);
    } finally {
      setTimeout(() => setIsGenerating(false), 2000);
    }
  };

  const handleView = (post: SocialPost) => {
    setSelectedPost(post);
    setActiveSlide(0);
    setIsPreviewOpen(true);
  };

  const handleGenerateVisual = async (postId: string) => {
    setIsVisualizing(postId);
    try {
      // In Phase 2, this will call the Imagen renderer
      const res = await fetch(`http://localhost:3848/api/social/posts/${postId}/generate`, {
        method: "POST"
      });
      if (res.ok) {
        setTimeout(fetchPosts, 3000);
      }
    } catch (err) {
      console.error("Visual generation failed:", err);
    } finally {
      setIsVisualizing(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display tracking-tight text-white mb-1">
            Instagram <span className="text-ai-primary">Hub</span>
          </h2>
          <p className="text-neutral-400">Autonomous content creation and grid management</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-pink-500/20 px-6"
          >
            {isGenerating ? (
              <Zap className="w-4 hide-8 mr-2 animate-pulse" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            AI Content Magic
          </Button>
          <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Grid Preview */}
        <Card className="lg:col-span-2 border-white/5 bg-black/40 backdrop-blur-xl">
          <CardHeader className="border-b border-white/5 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-ai-primary" />
                <CardTitle className="text-lg">Visual Grid Preview</CardTitle>
              </div>
              <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                <Button variant="ghost" size="sm" className="h-8 px-3 bg-white/10">Grid</Button>
                <Button variant="ghost" size="sm" className="h-8 px-3 text-neutral-400">Feed</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-2 aspect-square">
              {posts.map((post) => (
                <div 
                  key={post.id} 
                  className="group relative aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/5 hover:border-ai-primary/50 transition-all cursor-pointer"
                >
                  {post.imageUrl ? (
                    <div className="w-full h-full relative">
                      <img 
                        src={post.imageUrl.split(',')[0]} 
                        alt="Social Content Cover" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {post.imageUrl.includes(',') && (
                        <div className="absolute top-2 right-2 bg-black/60 rounded px-1.5 py-0.5 text-[10px] text-white flex items-center gap-1">
                          <Layout className="w-3 h-3" />
                           {post.imageUrl.split(',').length}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-ai-primary/5 p-4 text-center">
                      <Sparkles className="w-6 h-6 text-ai-primary mb-2 animate-pulse" />
                      <span className="text-[10px] font-bold text-ai-primary uppercase tracking-tighter">Draft Concept</span>
                      <span className="text-[9px] text-neutral-500 mt-1 line-clamp-2">{post.topicPillar}: {post.caption.substring(0, 30)}...</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center gap-3 text-white">
                      <div className="flex items-center gap-1">
                        <Camera className="w-4 h-4" />
                        <span className="text-xs font-bold">{post.type.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleView(post)}
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-full bg-white/10 hover:bg-ai-primary text-white"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        onClick={() => handleGenerateVisual(post.id)}
                        disabled={isVisualizing === post.id}
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-full bg-white/10 hover:bg-ai-secondary text-white"
                      >
                        <Zap className={`w-4 h-4 ${isVisualizing === post.id ? 'animate-bounce' : ''}`} />
                      </Button>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                    {post.status}
                  </div>
                </div>
              ))}
              {/* Empty state placeholders */}
              {Array.from({ length: 9 - posts.length }).map((_, i) => (
                <div key={i} className="aspect-square rounded-lg bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-neutral-600" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info/Stats Panel */}
        <div className="space-y-6">
          <Card className="border-white/5 bg-black/40 backdrop-blur-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-ai-primary" />
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-ai-primary" />
                Channel Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-neutral-400 mb-1 uppercase tracking-wider">Total Reach</p>
                  <p className="text-2xl font-bold font-display">12.4K</p>
                </div>
                <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-0">+12%</Badge>
              </div>
              <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-neutral-400 mb-1 uppercase tracking-wider">Engagement Rate</p>
                  <p className="text-2xl font-bold font-display">4.8%</p>
                </div>
                <Badge className="bg-ai-primary/10 text-ai-primary hover:bg-ai-primary/20 border-0">High</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-black/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-ai-tertiary" />
                Next Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative pl-6 border-l-2 border-white/5 space-y-4">
                <div className="relative pb-4">
                  <div className="absolute -left-[27px] top-0 w-3 h-3 rounded-full bg-ai-primary border-2 border-black" />
                  <p className="text-xs text-neutral-400 mb-1">Upcoming • 6:00 PM</p>
                  <p className="text-sm font-medium">Reel: Why slow sites kill business</p>
                </div>
                <div className="relative pb-4 opacity-50">
                  <div className="absolute -left-[27px] top-0 w-3 h-3 rounded-full bg-neutral-600 border-2 border-black" />
                  <p className="text-xs text-neutral-400 mb-1">Drafting • Tomorrow</p>
                  <p className="text-sm font-medium">Carousel: 5 Med Spa Gaps</p>
                </div>
              </div>
              <Button className="w-full bg-white/5 hover:bg-white/10 border-white/10">
                View Full Calendar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Post Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl bg-black/95 border-white/10 text-white backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-ai-primary" />
              Content Detail: {selectedPost?.topicPillar}
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Reviewing the AI generated concept and caption.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-4">
              {selectedPost?.imageUrl ? (
                <div className="relative group aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5">
                  <img 
                    src={selectedPost.imageUrl.split(',')[activeSlide]} 
                    alt={`Slide ${activeSlide + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                    <a 
                      href={selectedPost.imageUrl.split(',')[activeSlide]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" className="bg-white/10 border-white/20">
                        <Layout className="w-4 h-4 mr-2" />
                        View High-Res Slide
                      </Button>
                    </a>
                  </div>

                  {/* Carousel Controls */}
                  {selectedPost.imageUrl.includes(',') && (
                     <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                       {selectedPost.imageUrl.split(',').map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveSlide(idx)}
                            className={`w-2 h-2 rounded-full transition-colors ${idx === activeSlide ? 'bg-ai-primary' : 'bg-white/40'}`}
                          />
                       ))}
                     </div>
                  )}

                </div>
              ) : (
                <div className="aspect-square rounded-xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-6">
                  <ImageIcon className="w-10 h-10 text-neutral-600 mb-4" />
                  <p className="text-sm text-neutral-400">No visual generated for this concept yet.</p>
                  <Button 
                    onClick={() => handleGenerateVisual(selectedPost?.id || '')}
                    className="mt-4 bg-ai-secondary text-white"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Now
                  </Button>
                </div>
              )}
              
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-xs text-ai-secondary font-bold uppercase mb-2">Hashtags</p>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {selectedPost?.hashtags}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-xs text-ai-primary font-bold uppercase mb-2">Caption</p>
                <ScrollArea className="h-[250px] text-sm text-neutral-300 pr-4">
                  {selectedPost?.caption}
                </ScrollArea>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-xs text-neutral-400 font-bold uppercase mb-2">Visual Style</p>
                <p className="text-xs text-neutral-500 italic">
                  {selectedPost?.visualPrompt}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 flex gap-2">
            <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="text-neutral-400">
              Close
            </Button>
            <Button className="bg-ai-primary hover:bg-ai-primary/80 text-black font-bold">
              Schedule Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
