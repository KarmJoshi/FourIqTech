import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SmoothScroll from "./components/SmoothScroll";

import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Services from "./pages/Services";

import WebsiteDevelopment from "./pages/services/WebsiteDevelopment";
import AppDevelopment from "./pages/services/AppDevelopment";
import UiUxDesign from "./pages/services/UiUxDesign";
import SeoDigitalMarketing from "./pages/services/SeoDigitalMarketing";
import Consulting from "./pages/services/Consulting";

import AgentManager from "./pages/AgentManager/index";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MultiTenantSaasDevelopment from "./pages/services/MultiTenantSaasDevelopment";

gsap.registerPlugin(ScrollTrigger);

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SmoothScroll>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/website-development" element={<WebsiteDevelopment />} />
              <Route path="/services/app-development" element={<AppDevelopment />} />
              <Route path="/services/ui-ux-design" element={<UiUxDesign />} />
              <Route path="/services/seo-digital-marketing" element={<SeoDigitalMarketing />} />
              <Route path="/services/consulting" element={<Consulting />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="/agent-manager" element={<AgentManager />} />              <Route path="/services/multi-tenant-saas-development" element={<MultiTenantSaasDevelopment />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SmoothScroll>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
