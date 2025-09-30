import { useState, useEffect } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminReportsTable } from "@/components/admin/AdminReportsTable";
import { CRMProspectsTable } from "@/components/admin/CRMProspectsTable";
import { AdminManagement } from "@/components/admin/AdminManagement";
import LeaderboardTab from "@/components/admin/LeaderboardTab";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Search, BarChart3, Globe, Calendar, TrendingUp, ChevronDown, ChevronUp, Target, Eye, Shield, Users, FileText } from "lucide-react";
import { toast } from "sonner";
import { ComposedChart, Area, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import AdminLeadCalculatorForm from "@/components/admin/AdminLeadCalculatorForm";
import AdminManual from "@/components/admin/AdminManual";
import { FormData, ReportData } from "@/types/report";
import { fetchDomainData, calculateReportMetrics } from "@/services/spyfuService";
import { reportService } from "@/services/reportService";
import LeadReport from "@/components/LeadReport";
import LoadingState from "@/components/calculator/LoadingState";
import { useAuth } from "@/hooks/useAuth";

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
  uniqueDomainsToday: number;
  uniqueDomainsYesterday: number;
  reportsToday: number;
  adminReports: number;
  adminReportsToday: number;
  adminReportsYesterday: number;
  nonAdminReports: number;
  nonAdminReportsToday: number;
  nonAdminReportsYesterday: number;
  highValueProspects: number;
  highValueProspectsToday: number;
  highValueProspectsYesterday: number;
}

interface ChartDataPoint {
  date: string;
  adminReports: number;
  nonAdminReports: number;
  revenueLineReports: number;
  total: number;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [filteredReports, setFilteredReports] = useState<ReportSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalReports: 0,
    uniqueDomains: 0,
    uniqueDomainsToday: 0,
    uniqueDomainsYesterday: 0,
    reportsToday: 0,
    adminReports: 0,
    adminReportsToday: 0,
    adminReportsYesterday: 0,
    nonAdminReports: 0,
    nonAdminReportsToday: 0,
    nonAdminReportsYesterday: 0,
    highValueProspects: 0,
    highValueProspectsToday: 0,
    highValueProspectsYesterday: 0,
  });
  const [crmOpen, setCrmOpen] = useState(true);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [timePeriod, setTimePeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [leaderboardTimeFilter, setLeaderboardTimeFilter] = useState<'daily' | 'weekly' | 'monthly' | 'all-time'>('monthly');
  
  // Report generation state
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportProgress, setReportProgress] = useState(0);
  const [generatedReport, setGeneratedReport] = useState<ReportData | null>(null);
  const [reportFormData, setReportFormData] = useState<FormData | null>(null);
  const [reportApiError, setReportApiError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
    fetchStats();
    fetchChartData(timePeriod);
  }, []);

  useEffect(() => {
    fetchChartData(timePeriod);
  }, [timePeriod]);

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
      // Get all reports with user_id
      const { data: allReports, error: reportsError } = await supabase
        .from('reports')
        .select('domain, created_at, user_id, report_data');

      if (reportsError) throw reportsError;

      // Get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Create a map of user_id to role for quick lookup
      const roleMap = new Map<string, string>();
      userRoles?.forEach(ur => {
        roleMap.set(ur.user_id, ur.role);
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Filter reports by time period
      const todayReports = allReports?.filter((r) => {
        const reportDate = new Date(r.created_at);
        return reportDate >= today;
      }) || [];
      
      const yesterdayReports = allReports?.filter((r) => {
        const reportDate = new Date(r.created_at);
        return reportDate >= yesterday && reportDate < today;
      }) || [];

      // Calculate unique domains
      const uniqueDomains = new Set(allReports?.map(r => r.domain) || []).size;
      const uniqueDomainsToday = new Set(todayReports.map(r => r.domain)).size;
      const uniqueDomainsYesterday = new Set(yesterdayReports.map(r => r.domain)).size;
      
      // Helper function to check if user is admin
      const isAdminUser = (userId: string | null) => {
        if (!userId) return false;
        const userRole = roleMap.get(userId);
        return userRole === 'admin' || userRole === 'super_admin';
      };
      
      // Calculate admin reports
      let adminReports = 0;
      let adminReportsToday = 0;
      let adminReportsYesterday = 0;
      let nonAdminReports = 0;
      let nonAdminReportsToday = 0;
      let nonAdminReportsYesterday = 0;
      
      allReports?.forEach(report => {
        if (isAdminUser(report.user_id)) {
          adminReports++;
        } else {
          nonAdminReports++;
        }
      });
      
      todayReports.forEach(report => {
        if (isAdminUser(report.user_id)) {
          adminReportsToday++;
        } else {
          nonAdminReportsToday++;
        }
      });
      
      yesterdayReports.forEach(report => {
        if (isAdminUser(report.user_id)) {
          adminReportsYesterday++;
        } else {
          nonAdminReportsYesterday++;
        }
      });
      
      // Helper function to check if high value prospect
      const isHighValue = (r: any) => {
        const reportData = r.report_data as any;
        const monthlyRevenueLost = reportData?.monthlyRevenueLost || 0;
        return monthlyRevenueLost > 5000;
      };
      
      // Count high-value prospects
      const highValueProspects = allReports?.filter(isHighValue).length || 0;
      const highValueProspectsToday = todayReports.filter(isHighValue).length;
      const highValueProspectsYesterday = yesterdayReports.filter(isHighValue).length;

      setStats({
        totalReports: allReports?.length || 0,
        uniqueDomains,
        uniqueDomainsToday,
        uniqueDomainsYesterday,
        reportsToday: todayReports.length,
        adminReports,
        adminReportsToday,
        adminReportsYesterday,
        nonAdminReports,
        nonAdminReportsToday,
        nonAdminReportsYesterday,
        highValueProspects,
        highValueProspectsToday,
        highValueProspectsYesterday,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchChartData = async (period: 'weekly' | 'monthly' | 'yearly') => {
    try {
      // First, get all reports with report_data
      const { data: allReports, error: reportsError } = await supabase
        .from('reports')
        .select('created_at, user_id, report_data')
        .order('created_at', { ascending: true });

      if (reportsError) throw reportsError;

      // Then, get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Create a map of user_id to role for quick lookup
      const roleMap = new Map<string, string>();
      userRoles?.forEach(ur => {
        roleMap.set(ur.user_id, ur.role);
      });

      const now = new Date();
      let startDate: Date;
      let dateFormat: (date: Date) => string;
      let periods: number;
      let incrementType: 'day' | 'month';

      // Configure based on time period
      switch (period) {
        case 'weekly':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
          periods = 7;
          incrementType = 'day';
          dateFormat = (date) => date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
          break;
        case 'yearly':
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 12);
          periods = 12;
          incrementType = 'month';
          dateFormat = (date) => date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          break;
        default: // monthly
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 30);
          periods = 30;
          incrementType = 'day';
          dateFormat = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      const dateMap = new Map<string, { admin: number; nonAdmin: number; revenueLoss: number }>();
      
      // Initialize all periods with 0
      for (let i = 0; i < periods; i++) {
        const date = new Date(startDate);
        if (incrementType === 'day') {
          date.setDate(date.getDate() + i);
        } else {
          date.setMonth(date.getMonth() + i);
        }
        const dateStr = period === 'yearly' 
          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          : date.toISOString().split('T')[0];
        dateMap.set(dateStr, { admin: 0, nonAdmin: 0, revenueLoss: 0 });
      }

      // Count reports for each period, separating admin vs non-admin and revenue loss
      allReports?.forEach(report => {
        const reportDate = new Date(report.created_at);
        let key: string;
        
        if (period === 'yearly') {
          key = `${reportDate.getFullYear()}-${String(reportDate.getMonth() + 1).padStart(2, '0')}`;
        } else {
          key = report.created_at.split('T')[0];
        }
        
        if (dateMap.has(key)) {
          const current = dateMap.get(key)!;
          
          // Check if user is admin or super_admin
          const userRole = report.user_id ? roleMap.get(report.user_id) : null;
          const isAdmin = userRole === 'admin' || userRole === 'super_admin';
          
          // Check if report has revenue loss
          const reportData = report.report_data as any;
          const hasRevenueLoss = (reportData?.monthlyRevenueLost || 0) > 0 || (reportData?.yearlyRevenueLost || 0) > 0;
          
          if (isAdmin) {
            current.admin += 1;
          } else {
            current.nonAdmin += 1;
          }
          
          if (hasRevenueLoss) {
            current.revenueLoss += 1;
          }
          
          dateMap.set(key, current);
        }
      });

      // Convert to chart format
      const chartData: ChartDataPoint[] = Array.from(dateMap.entries()).map(([dateKey, counts]) => {
        let displayDate: string;
        
        if (period === 'yearly') {
          const [year, month] = dateKey.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1, 1);
          displayDate = dateFormat(date);
        } else {
          displayDate = dateFormat(new Date(dateKey));
        }
        
        return {
          date: displayDate,
          adminReports: counts.admin,
          nonAdminReports: counts.nonAdmin,
          revenueLineReports: counts.revenueLoss,
          total: counts.admin + counts.nonAdmin
        };
      });

      setChartData(chartData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  // Report generation handler - identical to Index.tsx
  const handleGenerateReport = async (formData: FormData) => {
    const domain = formData.domain || "example.com";

    setIsGeneratingReport(true);
    setReportApiError(null);
    setReportProgress(0);
    setReportFormData({ ...formData, domain });

    const progressInterval = setInterval(() => {
      setReportProgress((prev) => {
        if (prev < 90) return prev + Math.random() * 15;
        return prev;
      });
    }, 500);

    try {
      // Fetch domain data from SpyFu
      const apiData = await fetchDomainData(
        domain,
        formData.organicTrafficManual,
        formData.isUnsureOrganic
      );

      setReportProgress(95);

      const paidTraffic = formData.isUnsurePaid
        ? 0
        : formData.monthlyVisitors || 0;

      const metrics = calculateReportMetrics(
        paidTraffic,
        formData.avgTransactionValue,
        apiData.organicTraffic,
        apiData.paidTraffic,
        apiData.monthlyRevenueData,
        apiData.dataSource === "api"
      );

      const fullReportData: ReportData = {
        ...formData,
        ...apiData,
        ...metrics,
      };

      setReportProgress(100);
      setTimeout(() => {
        setGeneratedReport(fullReportData);
        
        // Save report to database in background
        try {
          reportService.saveReport(fullReportData, user?.id).then((saveResult) => {
            setGeneratedReport(prev => prev ? { 
              ...prev, 
              reportId: saveResult.reportId,
              slug: saveResult.slug 
            } : null);
            console.log('Report saved:', saveResult);
            
            toast.success('Report saved successfully!', {
              description: 'Report has been added to the database.',
              duration: 4000,
            });
            
            // Refresh the reports list
            fetchReports();
          }).catch((saveError) => {
            console.error('Failed to save report:', saveError);
          });
        } catch (saveError) {
          console.error('Failed to save report:', saveError);
        }
        
        setIsGeneratingReport(false);
        clearInterval(progressInterval);

        let dataSourceMessage = "";
        switch (apiData.dataSource) {
          case "api":
            dataSourceMessage = "using SpyFu data";
            break;
          case "manual":
            dataSourceMessage = "using manually entered data";
            break;
          case "both":
            dataSourceMessage = "using combined SpyFu and manual data";
            break;
          case "fallback":
            dataSourceMessage = "using industry estimates (API unavailable)";
            break;
        }

        toast.success(`Report generated successfully ${dataSourceMessage}`, {
          duration: 5000,
        });
      }, 500);
    } catch (error) {
      console.error("Error calculating report:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Unknown error occurred";
      setReportApiError(errorMsg);
      setIsGeneratingReport(false);
      clearInterval(progressInterval);

      toast.error("Failed to generate report", {
        description: "Please provide traffic data manually to continue.",
        duration: 8000,
      });
    }
  };

  const handleResetReport = () => {
    setGeneratedReport(null);
    setReportApiError(null);
    setReportFormData(null);
    setReportProgress(0);
    toast.success("Report cleared", {
      duration: 3000,
    });
  };

  const handleEditReport = () => {
    setGeneratedReport(null);
    setReportApiError(null);
    toast.info("Edit your information and submit again", {
      description: "Your previous entries have been preserved.",
      duration: 5000,
    });
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
            <Button onClick={() => {
              fetchReports();
              fetchStats();
              fetchChartData(timePeriod);
            }} disabled={loading}>
              Refresh Data
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-sm font-medium">Unique Domains</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.uniqueDomains}</div>
                <div className="flex gap-3 mt-2 text-xs">
                  <span className="text-green-600">Today: +{stats.uniqueDomainsToday}</span>
                  <span className="text-muted-foreground">Yesterday: +{stats.uniqueDomainsYesterday}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-sm font-medium">Admin Reports</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.adminReports}</div>
                <div className="flex gap-3 mt-2 text-xs">
                  <span className="text-green-600">Today: +{stats.adminReportsToday}</span>
                  <span className="text-muted-foreground">Yesterday: +{stats.adminReportsYesterday}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-sm font-medium">Non-Admin Reports</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.nonAdminReports}</div>
                <div className="flex gap-3 mt-2 text-xs">
                  <span className="text-green-600">Today: +{stats.nonAdminReportsToday}</span>
                  <span className="text-muted-foreground">Yesterday: +{stats.nonAdminReportsYesterday}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-sm font-medium">High-Value Prospects</CardTitle>
                <Target className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-700">{stats.highValueProspects}</div>
                <div className="flex gap-3 mt-2 text-xs">
                  <span className="text-green-600">Today: +{stats.highValueProspectsToday}</span>
                  <span className="text-muted-foreground">Yesterday: +{stats.highValueProspectsYesterday}</span>
                </div>
                <p className="text-xs text-orange-600 mt-1">Significant revenue loss</p>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Section with Shared Time Period Toggle */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Analytics Overview</h3>
                <p className="text-sm text-muted-foreground">
                  {timePeriod === 'weekly' ? 'Last 7 Days' : 
                   timePeriod === 'yearly' ? 'Last 12 Months' : 
                   'Last 30 Days'}
                </p>
              </div>
              <ToggleGroup 
                type="single" 
                value={timePeriod} 
                onValueChange={(value) => value && setTimePeriod(value as 'weekly' | 'monthly' | 'yearly')}
                className="bg-muted/50"
              >
                <ToggleGroupItem value="weekly" aria-label="Weekly view">
                  Week
                </ToggleGroupItem>
                <ToggleGroupItem value="monthly" aria-label="Monthly view">
                  Month
                </ToggleGroupItem>
                <ToggleGroupItem value="yearly" aria-label="Yearly view">
                  Year
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Side-by-Side Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Report Sources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Report Sources & User Adoption
                  </CardTitle>
                  <CardDescription>
                    Admin vs non-admin submission trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        className="text-muted-foreground"
                        fontSize={12}
                      />
                      <YAxis 
                        className="text-muted-foreground"
                        fontSize={12}
                        label={{ value: 'Reports', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="adminReports"
                        stroke="#60a5fa"
                        strokeWidth={2.5}
                        dot={{ fill: '#60a5fa', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Admin Reports"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="nonAdminReports" 
                        stroke="#ef4444"
                        strokeWidth={2.5}
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Non-Admin Reports"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Chart 2: Volume & Quality Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Volume & Quality Trends
                  </CardTitle>
                  <CardDescription>
                    Total reports and high-value domain detection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        className="text-muted-foreground"
                        fontSize={12}
                      />
                      <YAxis 
                        className="text-muted-foreground"
                        fontSize={12}
                        label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="total"
                        stroke="#60a5fa" 
                        strokeWidth={2.5}
                        dot={{ fill: '#60a5fa', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Total Reports"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenueLineReports" 
                        stroke="#ef4444"
                        strokeWidth={2.5}
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                        name="High-Value Domains"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="generate">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </TabsTrigger>
              <TabsTrigger value="crm">CRM</TabsTrigger>
              <TabsTrigger value="admin">Admin Management</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <AdminManual />
            </TabsContent>

            <TabsContent value="generate" className="space-y-6">
              {isGeneratingReport ? (
                <LoadingState
                  calculationProgress={reportProgress}
                  onReset={handleResetReport}
                />
              ) : !generatedReport ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Generate Lead Report
                    </CardTitle>
                    <CardDescription>
                      Run internal reports for prospecting and analysis. Reports are saved to the database with normal tracking.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AdminLeadCalculatorForm
                      onCalculate={handleGenerateReport}
                      onReset={handleResetReport}
                      isCalculating={isGeneratingReport}
                      initialData={reportFormData}
                      apiError={reportApiError}
                    />
                  </CardContent>
                </Card>
              ) : (
                <div>
                  <LeadReport
                    data={generatedReport}
                    onReset={handleResetReport}
                    onEditData={handleEditReport}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Performance Rankings</h3>
                <ToggleGroup
                  type="single" 
                  value={leaderboardTimeFilter} 
                  onValueChange={(value) => value && setLeaderboardTimeFilter(value as 'daily' | 'weekly' | 'monthly' | 'all-time')}
                  className="border rounded-lg"
                >
                  <ToggleGroupItem value="daily" className="text-xs">Daily</ToggleGroupItem>
                  <ToggleGroupItem value="weekly" className="text-xs">Weekly</ToggleGroupItem>
                  <ToggleGroupItem value="monthly" className="text-xs">Monthly</ToggleGroupItem>
                  <ToggleGroupItem value="all-time" className="text-xs">All Time</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <LeaderboardTab timeFilter={leaderboardTimeFilter} />
            </TabsContent>

            <TabsContent value="crm" className="space-y-6">
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
            </TabsContent>

            <TabsContent value="admin" className="space-y-6">
              <AdminManagement />
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminAuthGuard>
  );
};

export default AdminDashboard;