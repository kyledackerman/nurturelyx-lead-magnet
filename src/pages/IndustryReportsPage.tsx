import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ReportTable } from "@/components/programmatic/ReportTable";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { MetaTags } from "@/components/seo/MetaTags";
import { ItemListSchema } from "@/components/seo/ItemListSchema";
import { ServiceSchema } from "@/components/seo/ServiceSchema";
import { WebPageSchema } from "@/components/seo/WebPageSchema";
import { Breadcrumb } from "@/components/report/Breadcrumb";
import { getIndustryData } from "@/data/industryData";
import { scrollToTopIfHomeLink } from "@/lib/scroll";

export default function IndustryReportsPage() {
  const { industry } = useParams<{ industry: string }>();

  const { data: reports, isLoading } = useQuery({
    queryKey: ['industry-all-reports', industry],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('industry', industry)
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!industry
  });

  const industryInfo = industry ? getIndustryData(industry) : null;
  const industryName = industryInfo?.name || industry?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <>
      <MetaTags
        title={`${industryName} Companies Losing Revenue - All Reports | NurturelyX`}
        description={`Browse all ${industryName} companies and see how much revenue they're losing from anonymous website visitors. Free lead generation reports and benchmarks.`}
        canonical={`https://x1.nurturely.io/industries/${industry}/all-reports`}
        keywords={`${industry} lead generation, ${industry} visitor tracking, ${industry} revenue loss, ${industry} website analytics`}
      />

      {reports && reports.length > 0 && (
        <ItemListSchema
          items={reports.map((report, index) => ({
            name: report.domain || `${industryName} Company ${index + 1}`,
            url: `/report/${report.slug}`,
            description: `${industryName} company losing revenue from anonymous website visitors`,
          }))}
          listName={`All ${industryName} Companies Losing Revenue`}
          description={`Complete list of ${industryName} companies and their revenue loss from anonymous website traffic`}
        />
      )}

      <ServiceSchema
        name={`${industryName} Visitor Identification Service`}
        description={`Identify anonymous website visitors for ${industryName} businesses and track potential customers researching your services`}
        serviceType="Professional Service"
      />

      <WebPageSchema
        name={`All ${industryName} Companies - Revenue Loss Reports`}
        description={`Browse all ${industryName} companies and see how much revenue they're losing from anonymous visitors`}
        url={`https://x1.nurturely.io/industries/${industry}/all-reports`}
        breadcrumbs={[
          { name: "Industries", url: "/industries" },
          { name: industryName || "", url: `/industries/${industry}` },
          { name: "All Reports", url: `/industries/${industry}/all-reports` }
        ]}
        keywords={[`${industry} companies`, `${industry} revenue loss`, `${industry} lead generation`]}
      />

      <Header />
      
      <main className="min-h-screen py-16">
        <div className="container max-w-6xl">
          <Breadcrumb items={[
            { label: "Industries", href: "/industries" },
            { label: industryName || "", href: `/industries/${industry}` },
            { label: "All Reports", href: `/industries/${industry}/all-reports` }
          ]} />
          
          <div className="text-center mb-12 mt-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              All {industryName} Companies
            </h1>
            <p className="text-xl text-muted-foreground">
              See how much revenue {industryName?.toLowerCase()} businesses are losing to anonymous traffic
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading reports...</div>
          ) : !reports || reports.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No reports available yet for this industry.</p>
              <Button asChild onClick={scrollToTopIfHomeLink}>
                <Link to="/">Generate Your Report</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <p className="text-muted-foreground">
                  Showing {reports.length} {industryName?.toLowerCase()} {reports.length === 1 ? 'company' : 'companies'}
                </p>
              </div>

              <ReportTable reports={reports} />

              <div className="mt-12 text-center">
                <h2 className="text-2xl font-bold mb-4">
                  Is Your {industryName} Business on This List?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Calculate your lost revenue and discover how many leads you're missing
                </p>
                <Button asChild size="lg" className="gradient-bg" onClick={scrollToTopIfHomeLink}>
                  <Link to="/">
                    Get Your Free Report
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
