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
import { Search, BarChart3, Globe, Calendar, TrendingUp, ChevronDown, ChevronUp, Target, Eye, Shield, Users } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
  adminReports: number;
  nonAdminReports: number;
  highValueProspects: number;
}

interface ChartDataPoint {
  date: string;
  adminReports: number;
  nonAdminReports: number;
  total: number;
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
    adminReports: 0,
    nonAdminReports: 0,
    highValueProspects: 0,
  });
  const [crmOpen, setCrmOpen] = useState(true);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [timePeriod, setTimePeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [leaderboardTimeFilter, setLeaderboardTimeFilter] = useState<'daily' | 'weekly' | 'monthly' | 'all-time'>('monthly');

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

      const today = new Date().toISOString().split('T')[0];
      const uniqueDomains = new Set(allReports?.map(r => r.domain) || []).size;
      const reportsToday = allReports?.filter(r => 
        r.created_at.startsWith(today)
      ).length || 0;
      
      // Separate admin vs non-admin reports
      let adminReports = 0;
      let nonAdminReports = 0;
      
      allReports?.forEach(report => {
        const userRole = report.user_id ? roleMap.get(report.user_id) : null;
        const isAdmin = userRole === 'admin' || userRole === 'super_admin';
        
        if (isAdmin) {
          adminReports++;
        } else {
          nonAdminReports++;
        }
      });
      
      // Count high-value prospects (reports with monthly revenue lost > 0)
      const highValueProspects = allReports?.filter(r => {
        const reportData = r.report_data as any;
        return (reportData?.monthlyRevenueLost || 0) > 0 || (reportData?.yearlyRevenueLost || 0) > 0;
      }).length || 0;

      setStats({
        totalReports: allReports?.length || 0,
        uniqueDomains,
        reportsToday,
        adminReports,
        nonAdminReports,
        highValueProspects,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchChartData = async (period: 'weekly' | 'monthly' | 'yearly') => {
    try {
      // First, get all reports
      const { data: allReports, error: reportsError } = await supabase
        .from('reports')
        .select('created_at, user_id')
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

      const dateMap = new Map<string, { admin: number; nonAdmin: number }>();
      
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
        dateMap.set(dateStr, { admin: 0, nonAdmin: 0 });
      }

      // Count reports for each period, separating admin vs non-admin
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
          
          if (isAdmin) {
            current.admin += 1;
          } else {
            current.nonAdmin += 1;
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
          total: counts.admin + counts.nonAdmin
        };
      });

      setChartData(chartData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
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
                <p className="text-xs text-muted-foreground mt-1">Analyzed domains</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-sm font-medium">Admin Reports</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.adminReports}</div>
                <p className="text-xs text-muted-foreground mt-1">Internal submissions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-sm font-medium">Non-Admin Reports</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.nonAdminReports}</div>
                <p className="text-xs text-muted-foreground mt-1">External submissions</p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-sm font-medium">High-Value Prospects</CardTitle>
                <Target className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-700">{stats.highValueProspects}</div>
                <p className="text-xs text-orange-600 mt-1">Domains with revenue loss</p>
              </CardContent>
            </Card>
          </div>

          {/* Reports Over Time Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Report Submissions by User Type ({
                      timePeriod === 'weekly' ? 'Last 7 Days' : 
                      timePeriod === 'yearly' ? 'Last 12 Months' : 
                      'Last 30 Days'
                    })
                  </CardTitle>
                  <CardDescription>
                    Compare admin vs non-admin report submissions
                  </CardDescription>
                </div>
                <ToggleGroup 
                  type="single" 
                  value={timePeriod} 
                  onValueChange={(value) => value && setTimePeriod(value as 'weekly' | 'monthly' | 'yearly')}
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
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-muted-foreground"
                      fontSize={12}
                    />
                    <YAxis 
                      className="text-muted-foreground"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                      formatter={(value, name) => [
                        value,
                        name === 'adminReports' ? 'Admin Reports' : 'Non-Admin Reports'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="adminReports" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                      name="Admin Reports"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="nonAdminReports" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: 'hsl(var(--chart-2))' }}
                      name="Non-Admin Reports"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="crm">CRM</TabsTrigger>
              <TabsTrigger value="admin">Admin Management</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Move chart here for overview */}
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