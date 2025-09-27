import { useState, useEffect } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminReportsTable } from "@/components/admin/AdminReportsTable";
import { CRMProspectsTable } from "@/components/admin/CRMProspectsTable";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { Search, BarChart3, Globe, Calendar, TrendingUp, ChevronDown, ChevronUp, Target } from "lucide-react";
import { toast } from "sonner";

interface ReportSummary {
  domain: string;
  created_at: string;
  is_public: boolean;
  user_id: string | null;
  slug: string;
  id: string;
  report_data: {
    organicTraffic?: number;
    paidTraffic?: number;
    missedLeads?: number;
    yearlyRevenueLost?: number;
    avgTransactionValue?: number;
  };
}

interface AdminStats {
  totalReports: number;
  uniqueDomains: number;
  reportsToday: number;
  publicReports: number;
  highValueProspects: number;
}

const AdminDashboard = () => {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [filteredReports, setFilteredReports] = useState<ReportSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalReports: 0,
    uniqueDomains: 0,
    reportsToday: 0,
    publicReports: 0,
    highValueProspects: 0,
  });
  const [crmOpen, setCrmOpen] = useState(true);

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, []);

  useEffect(() => {
    const filtered = reports.filter(report =>
      report.domain.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredReports(filtered);
  }, [searchTerm, reports]);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('id, domain, created_at, is_public, user_id, slug, report_data')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      // Type cast the report_data from Json to our interface
      const typedData = (data || []).map(report => ({
        ...report,
        report_data: report.report_data as {
          organicTraffic?: number;
          paidTraffic?: number;
          missedLeads?: number;
          yearlyRevenueLost?: number;
          avgTransactionValue?: number;
        }
      }));
      
      setReports(typedData);
      setFilteredReports(typedData);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: allReports, error } = await supabase
        .from('reports')
        .select('domain, created_at, is_public, report_data');

      if (error) throw error;

      const today = new Date().toISOString().split('T')[0];
      const uniqueDomains = new Set(allReports?.map(r => r.domain) || []).size;
      const reportsToday = allReports?.filter(r => 
        r.created_at.startsWith(today)
      ).length || 0;
      const publicReports = allReports?.filter(r => r.is_public).length || 0;
      
      // Count high-value prospects (reports with monthly revenue lost > 0)
      const highValueProspects = allReports?.filter(r => {
        const reportData = r.report_data as any;
        return (reportData?.monthlyRevenueLost || 0) > 0 || (reportData?.yearlyRevenueLost || 0) > 0;
      }).length || 0;

      setStats({
        totalReports: allReports?.length || 0,
        uniqueDomains,
        reportsToday,
        publicReports,
        highValueProspects,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <AdminAuthGuard>
      <Header />
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Monitor submitted domains and report analytics
              </p>
            </div>
            <Button onClick={fetchReports} disabled={loading}>
              Refresh Data
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalReports}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Domains</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.uniqueDomains}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reports Today</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.reportsToday}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Public Reports</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.publicReports}</div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High-Value Prospects</CardTitle>
                <Target className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-700">{stats.highValueProspects}</div>
                <p className="text-xs text-orange-600 mt-1">Domains with revenue loss</p>
              </CardContent>
            </Card>
          </div>

          {/* CRM Section */}
          <Card>
            <Collapsible open={crmOpen} onOpenChange={setCrmOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                      <CardTitle>CRM - High-Value Prospects</CardTitle>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        {stats.highValueProspects} prospects
                      </Badge>
                    </div>
                    {crmOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                  <CardDescription>
                    Domains with monthly revenue loss - prime targets for outreach and conversion
                  </CardDescription>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <CRMProspectsTable 
                    reports={filteredReports} 
                    loading={loading}
                  />
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle>Submitted Domains</CardTitle>
              <CardDescription>
                Search and filter through all submitted domain reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search domains..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              
              <AdminReportsTable 
                reports={filteredReports} 
                loading={loading}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminAuthGuard>
  );
};

export default AdminDashboard;