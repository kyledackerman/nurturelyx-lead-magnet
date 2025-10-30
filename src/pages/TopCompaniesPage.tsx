import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ReportTable } from "@/components/programmatic/ReportTable";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingDown } from "lucide-react";
import { MetaTags } from "@/components/seo/MetaTags";
import { ItemListSchema } from "@/components/seo/ItemListSchema";
import { WebPageSchema } from "@/components/seo/WebPageSchema";
import { Breadcrumb } from "@/components/report/Breadcrumb";
import { scrollToTop } from "@/lib/scroll";
import { InternalLinkingWidget } from "@/components/seo/InternalLinkingWidget";

export default function TopCompaniesPage() {
  const { data: reports, isLoading } = useQuery({
    queryKey: ['top-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      // Sort by revenue lost (from report_data)
      return data.sort((a, b) => {
        const aRevenue = (a.report_data as any)?.yearlyRevenueLost || 0;
        const bRevenue = (b.report_data as any)?.yearlyRevenueLost || 0;
        return bRevenue - aRevenue;
      }).slice(0, 25);
    }
  });

  const totalRevenueLost = reports?.reduce((sum, report) => {
    return sum + ((report.report_data as any)?.yearlyRevenueLost || 0);
  }, 0) || 0;

  return (
    <>
      <MetaTags
        title="Top 25 Companies Losing Revenue to Anonymous Traffic | NurturelyX"
        description="Discover the top 25 companies losing the most revenue from anonymous website visitors. Real examples of missed lead generation opportunities and revenue benchmarks."
        canonical="https://x1.nurturely.io/top-companies-losing-revenue"
        keywords="revenue loss rankings, anonymous traffic cost, B2B lead generation benchmarks, visitor tracking statistics"
      />

      {reports && reports.length > 0 && (
        <ItemListSchema
          items={reports.map((report, index) => ({
            name: report.domain || `Company ${index + 1}`,
            url: `/report/${report.slug}`,
            description: `Losing $${((report.report_data as any)?.yearlyRevenueLost || 0).toLocaleString()} annually to anonymous traffic`,
          }))}
          listName="Top 25 Companies Losing Revenue to Anonymous Traffic"
          description="Real businesses losing millions to anonymous website traffic"
        />
      )}

      <WebPageSchema
        name="Top 25 Companies Losing Revenue to Anonymous Traffic"
        description="Rankings of companies losing the most revenue from unidentified website visitors"
        url="https://x1.nurturely.io/top-companies-losing-revenue"
        breadcrumbs={[
          { name: "Top Companies", url: "/top-companies-losing-revenue" }
        ]}
        keywords={["revenue loss rankings", "anonymous traffic statistics", "lead generation benchmarks"]}
      />

      <Header />
      
      <main className="min-h-screen py-16">
        <div className="container max-w-6xl">
          <Breadcrumb items={[
            { label: "Top Companies", href: "/top-companies" }
          ]} />
          
          <div className="text-center mb-12 mt-6">
            <div className="inline-flex items-center justify-center gap-2 mb-4">
              <TrendingDown className="h-12 w-12 text-destructive" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Top 25 Companies Losing Revenue
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Real businesses losing millions to anonymous website traffic
            </p>
            
            {!isLoading && reports && (
              <div className="inline-block p-6 bg-destructive/10 rounded-lg border border-destructive/20">
                <div className="text-4xl font-bold text-destructive mb-2">
                  ${totalRevenueLost.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Combined annual revenue lost by these 25 companies
                </div>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading top companies...</div>
          ) : !reports || reports.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No reports available yet.</p>
            </div>
          ) : (
            <>
              <ReportTable reports={reports} />

              <div className="mt-12 p-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Don't Let Your Business Make This List
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  These companies are losing an average of ${Math.round(totalRevenueLost / 25).toLocaleString()} per year. 
                  Find out how much your business is losing and how to fix it.
                </p>
                <Button asChild size="lg" className="gradient-bg">
                  <Link to="/">
                    Calculate Your Lost Revenue Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-background rounded-lg border text-center">
                  <div className="text-3xl font-bold mb-2">95%</div>
                  <p className="text-sm text-muted-foreground">
                    Of website visitors never convert
                  </p>
                </div>
                <div className="p-6 bg-background rounded-lg border text-center">
                  <div className="text-3xl font-bold mb-2">35%</div>
                  <p className="text-sm text-muted-foreground">
                    Can be identified with visitor tracking
                  </p>
                </div>
                <div className="p-6 bg-background rounded-lg border text-center">
                  <div className="text-3xl font-bold mb-2">$127k</div>
                  <p className="text-sm text-muted-foreground">
                    Average annual revenue lost per business
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Internal Linking Widget */}
      <div className="container mx-auto px-4 pb-16">
        <InternalLinkingWidget />
      </div>

      <Footer />
    </>
  );
}
