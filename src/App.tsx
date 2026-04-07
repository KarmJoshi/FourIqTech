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
import CustomSaasPlatformDevelopment from "./pages/services/CustomSaasPlatformDevelopment";
import LegacyWebApplicationModernization from "./pages/services/LegacyWebApplicationModernization";
import EnterpriseHeadlessCommerceDevelopment from "./pages/services/EnterpriseHeadlessCommerceDevelopment";
import EnterpriseRevenueAcceleration from "./pages/services/EnterpriseRevenueAcceleration";
import EnterpriseReactPerformanceOptimization from "./pages/services/EnterpriseReactPerformanceOptimization";
import EnterpriseUiUxDesignServices from "./pages/services/EnterpriseUiUxDesignServices";
import AgentManager from "./pages/AgentManager/index";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="/services/enterprise-react-performance-optimization" element={<EnterpriseReactPerformanceOptimization />} />
              <Route path="/services/enterprise-revenue-acceleration" element={<EnterpriseRevenueAcceleration />} />
              <Route path="/services/custom-saas-platform-development" element={<CustomSaasPlatformDevelopment />} />
              <Route path="/services/legacy-web-application-modernization" element={<LegacyWebApplicationModernization />} />
              <Route path="/services/enterprise-headless-commerce-development" element={<EnterpriseHeadlessCommerceDevelopment />} />
              <Route path="/agent-manager" element={<AgentManager />} />
              <Route path="/services/enterprise-ui-ux-design-services" element={<EnterpriseUiUxDesignServices />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SmoothScroll>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
