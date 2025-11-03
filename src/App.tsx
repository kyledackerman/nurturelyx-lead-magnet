
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { HelmetProvider } from "react-helmet-async";
import { EnforcedThemeProvider } from "@/components/EnforcedThemeProvider";
import { ScrollToTopOnRouteChange } from "@/components/ScrollToTopOnRouteChange";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";
import PublicReportPage from "./pages/PublicReportPage";
import AdminDashboard from "./pages/AdminDashboard";
import CRMDashboard from "./pages/CRMDashboard";
import ClientsDashboard from "./pages/ClientsDashboard";
import AuthPage from "./pages/AuthPage";
import { AdminAuthGuard } from "./components/admin/AdminAuthGuard";
import { AmbassadorAuthGuard } from "./components/ambassador/AmbassadorAuthGuard";
import UserDashboard from "./pages/UserDashboard";
import LearnPage from "./pages/LearnPage";
import HvacLeadsPage from "./pages/HvacLeadsPage";
import WhyNoLeadsPage from "./pages/WhyNoLeadsPage";
import GoogleAnalyticsLyingPage from "./pages/GoogleAnalyticsLyingPage";
import VisitorIdVsTraditionalPage from "./pages/VisitorIdVsTraditionalPage";
import LeadFeederComparisonPage from "./pages/LeadFeederComparisonPage";
import PricingPage from "./pages/PricingPage";
import ComparePage from "./pages/ComparePage";
import HVACIndustryPage from "./pages/industries/HVACIndustryPage";
import LegalIndustryPage from "./pages/industries/LegalIndustryPage";
import RealEstateIndustryPage from "./pages/industries/RealEstateIndustryPage";
import HomeServicesIndustryPage from "./pages/industries/HomeServicesIndustryPage";
import AutomotiveIndustryPage from "./pages/industries/AutomotiveIndustryPage";
import HealthcareIndustryPage from "./pages/industries/HealthcareIndustryPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import IndustryReportsPage from "./pages/IndustryReportsPage";
import TopCompaniesPage from "./pages/TopCompaniesPage";
import SubmitSupportTicket from "./pages/SubmitSupportTicket";
import AmbassadorDashboard from "./pages/AmbassadorDashboard";
import AmbassadorMarketplace from "./pages/AmbassadorMarketplace";
import AmbassadorDomains from "./pages/AmbassadorDomains";
import AmbassadorSubmitDomain from "./pages/AmbassadorSubmitDomain";
import AmbassadorCommissions from "./pages/AmbassadorCommissions";
import AmbassadorSettings from "./pages/AmbassadorSettings";
import AmbassadorApplication from "./pages/AmbassadorApplication";
import AmbassadorLeaderboard from "./pages/AmbassadorLeaderboard";
import AmbassadorResources from "./pages/AmbassadorResources";
import AmbassadorMyClients from "./pages/AmbassadorMyClients";
import ResourcesPage from "./pages/ResourcesPage";
import SubscribeCheckout from "./pages/SubscribeCheckout";
import SubscribeThankYou from "./pages/SubscribeThankYou";
import BuyCredits from "./pages/BuyCredits";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <HelmetProvider>
        <EnforcedThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            <Sonner />
            <BrowserRouter>
              <ScrollToTopOnRouteChange />
              <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/learn/google-analytics-lying" element={<GoogleAnalyticsLyingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/compare/visitor-id-vs-traditional" element={<VisitorIdVsTraditionalPage />} />
            <Route path="/compare/leadfeeder-alternative" element={<LeadFeederComparisonPage />} />
            <Route path="/generate-leads-hvac" element={<HvacLeadsPage />} />
            <Route path="/why-website-not-getting-leads" element={<WhyNoLeadsPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/report/:slug" element={<PublicReportPage />} />
            <Route path="/admin" element={
              <AdminAuthGuard>
                <AdminDashboard />
              </AdminAuthGuard>
            } />
            <Route path="/admin/crm" element={
              <AdminAuthGuard>
                <CRMDashboard />
              </AdminAuthGuard>
            } />
            <Route path="/admin/clients" element={
              <AdminAuthGuard>
                <ClientsDashboard />
              </AdminAuthGuard>
            } />
            <Route path="/support/new" element={
              <AdminAuthGuard>
                <SubmitSupportTicket />
              </AdminAuthGuard>
            } />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/industries/hvac" element={<HVACIndustryPage />} />
            <Route path="/industries/legal" element={<LegalIndustryPage />} />
            <Route path="/industries/real-estate" element={<RealEstateIndustryPage />} />
            <Route path="/industries/home-services" element={<HomeServicesIndustryPage />} />
            <Route path="/industries/automotive" element={<AutomotiveIndustryPage />} />
            <Route path="/industries/healthcare" element={<HealthcareIndustryPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/reports/:industry" element={<IndustryReportsPage />} />
            <Route path="/top-companies-losing-revenue" element={<TopCompaniesPage />} />
            
            {/* Ambassador Routes */}
            <Route path="/ambassador/apply" element={<AmbassadorApplication />} />
            <Route path="/ambassador" element={
              <AmbassadorAuthGuard>
                <AmbassadorDashboard />
              </AmbassadorAuthGuard>
            } />
            <Route path="/ambassador/marketplace" element={
              <AmbassadorAuthGuard>
                <AmbassadorMarketplace />
              </AmbassadorAuthGuard>
            } />
            <Route path="/ambassador/domains" element={
              <AmbassadorAuthGuard>
                <AmbassadorDomains />
              </AmbassadorAuthGuard>
            } />
            <Route path="/ambassador/submit" element={
              <AmbassadorAuthGuard>
                <AmbassadorSubmitDomain />
              </AmbassadorAuthGuard>
            } />
            <Route path="/ambassador/commissions" element={
              <AmbassadorAuthGuard>
                <AmbassadorCommissions />
              </AmbassadorAuthGuard>
            } />
            <Route path="/ambassador/settings" element={
              <AmbassadorAuthGuard>
                <AmbassadorSettings />
              </AmbassadorAuthGuard>
            } />
            <Route path="/ambassador/leaderboard" element={
              <AmbassadorAuthGuard>
                <AmbassadorLeaderboard />
              </AmbassadorAuthGuard>
            } />
            <Route path="/ambassador/resources" element={
              <AmbassadorAuthGuard>
                <AmbassadorResources />
              </AmbassadorAuthGuard>
            } />
            <Route path="/ambassador/my-clients" element={
              <AmbassadorAuthGuard>
                <AmbassadorMyClients />
              </AmbassadorAuthGuard>
            } />
            
            {/* Subscription Routes */}
            <Route path="/subscribe" element={<SubscribeCheckout />} />
            <Route path="/subscribe/thank-you" element={<SubscribeThankYou />} />
            <Route path="/buy-credits" element={<BuyCredits />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </TooltipProvider>
        </EnforcedThemeProvider>
      </HelmetProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
