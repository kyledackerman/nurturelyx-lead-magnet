
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";
import PublicReportPage from "./pages/PublicReportPage";
import AdminDashboard from "./pages/AdminDashboard";
import AuthPage from "./pages/AuthPage";
import UserDashboard from "./pages/UserDashboard";
import LearnPage from "./pages/LearnPage";
import HvacLeadsPage from "./pages/HvacLeadsPage";
import PricingPage from "./pages/PricingPage";
import HVACIndustryPage from "./pages/industries/HVACIndustryPage";
import LegalIndustryPage from "./pages/industries/LegalIndustryPage";
import RealEstateIndustryPage from "./pages/industries/RealEstateIndustryPage";
import HomeServicesIndustryPage from "./pages/industries/HomeServicesIndustryPage";
import AutomotiveIndustryPage from "./pages/industries/AutomotiveIndustryPage";
import HealthcareIndustryPage from "./pages/industries/HealthcareIndustryPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <HelmetProvider>
        <TooltipProvider>
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/generate-leads-hvac" element={<HvacLeadsPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/report/:slug" element={<PublicReportPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/industries/hvac" element={<HVACIndustryPage />} />
            <Route path="/industries/legal" element={<LegalIndustryPage />} />
            <Route path="/industries/real-estate" element={<RealEstateIndustryPage />} />
            <Route path="/industries/home-services" element={<HomeServicesIndustryPage />} />
            <Route path="/industries/automotive" element={<AutomotiveIndustryPage />} />
            <Route path="/industries/healthcare" element={<HealthcareIndustryPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </HelmetProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
