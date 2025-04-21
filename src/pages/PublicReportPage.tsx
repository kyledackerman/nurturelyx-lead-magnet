
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LeadReport from "@/components/LeadReport";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportData } from "@/types/report";
import { BarChart3, TrendingUp, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// This is a mock function - in a real app, this would fetch from a backend
const fetchPublicReport = async (reportId: string): Promise<ReportData | null> => {
  // In a real implementation, this would be an API call to fetch the report by ID
  console.log(`Fetching report with ID: ${reportId}`);
  
  // For demo purposes, return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      // This would normally come from your backend
      const mockReportData: ReportData = {
        domain: "example.com",
        avgTransactionValue: 1000,
        organicTraffic: 25000,
        organicKeywords: 1500,
        domainPower: 65,
        backlinks: 550,
        paidTraffic: 5000,
        dataSource: "api",
        missedLeads: 6000,
        estimatedSalesLost: 60,
        monthlyRevenueLost: 60000,
        yearlyRevenueLost: 720000,
        monthlyRevenueData: [
          // Mock data would go here
          {
            month: "Jan",
            year: 2023,
            visitors: 28000,
            organicVisitors: 23000,
            paidVisitors: 5000,
            leads: 5600,
            missedLeads: 4800,
            sales: 56,
            lostSales: 48,
            revenueLost: 48000,
            lostRevenue: 48000
          },
          // Additional months would be here
        ],
        reportId: reportId
      };
      
      resolve(mockReportData);
    }, 1000);
  });
};

const PublicReportPage = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewCount, setViewCount] = useState(Math.floor(Math.random() * 100) + 50);
  
  useEffect(() => {
    const loadReport = async () => {
      if (reportId) {
        setLoading(true);
        try {
          const data = await fetchPublicReport(reportId);
          setReportData(data);
        } catch (error) {
          console.error("Error loading report:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadReport();
    
    // Simulate incrementing view count
    const timer = setTimeout(() => {
      setViewCount(prev => prev + 1);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [reportId]);
  
  const handleCreateMyReport = () => {
    window.location.href = "/";
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-t-4 border-accent rounded-full animate-spin"></div>
              <p className="mt-4 text-white">Loading report...</p>
            </div>
          ) : reportData ? (
            <>
              <div className="mb-8 max-w-3xl mx-auto text-center">
                <h1 className="text-3xl font-bold text-white mb-4">
                  Lead Opportunity Report for {reportData.domain}
                </h1>
                <p className="text-white/80 mb-6">
                  This report shows how much revenue this website is potentially losing 
                  due to anonymous visitor traffic.
                </p>
                
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <Card className="bg-secondary py-3 px-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 size={20} className="text-accent" />
                      <div className="text-left">
                        <p className="text-xs text-white/70">Yearly Revenue Lost</p>
                        <p className="text-lg font-bold text-white">{formatCurrency(reportData.yearlyRevenueLost)}</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="bg-secondary py-3 px-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={20} className="text-accent" />
                      <div className="text-left">
                        <p className="text-xs text-white/70">Missed Leads</p>
                        <p className="text-lg font-bold text-white">{reportData.missedLeads.toLocaleString()}/mo</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="bg-secondary py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Clock size={20} className="text-accent" />
                      <div className="text-left">
                        <p className="text-xs text-white/70">Report Views</p>
                        <p className="text-lg font-bold text-white">{viewCount}</p>
                      </div>
                    </div>
                  </Card>
                </div>
                
                <Button 
                  onClick={handleCreateMyReport} 
                  className="gradient-bg mx-auto mb-12"
                  size="lg"
                >
                  Generate My Own Report
                </Button>
              </div>
              
              <LeadReport 
                data={reportData} 
                onReset={() => {}} 
                isPublicView={true}
              />
            </>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-white mb-4">Report Not Found</h2>
              <p className="text-white/80 mb-8">
                The report you're looking for doesn't exist or has been removed.
              </p>
              <Button 
                onClick={handleCreateMyReport} 
                className="gradient-bg mx-auto"
              >
                Create My Own Report
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PublicReportPage;
