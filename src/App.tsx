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
import DynamicServicePage from "./pages/services/DynamicServicePage";

import AgentManager from "./pages/AgentManager/index";
import AiChat from "./components/AiChat";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MultiTenantSaasDevelopment from "./pages/services/MultiTenantSaasDevelopment";
import LegacyApplicationModernization from "./pages/services/LegacyApplicationModernization";
import EnterpriseNextjsDevelopment from "./pages/services/EnterpriseNextjsDevelopment";
import WebPerformanceOptimization from "./pages/services/WebPerformanceOptimization";
import CustomSaasDevelopment from "./pages/services/CustomSaasDevelopment";
import CustomWebApplicationDevelopment from "./pages/services/CustomWebApplicationDevelopment";

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
            <AiChat />
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
              <Route path="/services/:slug" element={<DynamicServicePage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="/agent-manager" element={<AgentManager />} />              <Route path="/services/multi-tenant-saas-development" element={<MultiTenantSaasDevelopment />} />              <Route path="/services/legacy-application-modernization" element={<LegacyApplicationModernization />} />              <Route path="/services/enterprise-nextjs-development" element={<EnterpriseNextjsDevelopment />} />              <Route path="/services/web-performance-optimization" element={<WebPerformanceOptimization />} />              <Route path="/services/custom-saas-development" element={<CustomSaasDevelopment />} />              <Route path="/services/custom-web-application-development" element={<CustomWebApplicationDevelopment />} />





              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SmoothScroll>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
