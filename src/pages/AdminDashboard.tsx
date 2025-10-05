import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminReportsTable } from "@/components/admin/AdminReportsTable";
import { AdminManagement } from "@/components/admin/AdminManagement";
import { PasswordManagement } from "@/components/admin/PasswordManagement";
import LeaderboardTab from "@/components/admin/LeaderboardTab";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Search, BarChart3, Globe, Calendar, TrendingUp, Target, Eye, Shield, FileText, Share2, Clock, LayoutDashboard, Trophy, Key, ArrowRight, Users as UsersIcon, Award, Crown, AlertTriangle, Briefcase, Flame, Filter, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { ComposedChart, Area, Line, Bar, BarChart, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import AdminLeadCalculatorForm from "@/components/admin/AdminLeadCalculatorForm";
import AdminManual from "@/components/admin/AdminManual";
import { ReportCategorizationTool } from "@/components/admin/ReportCategorizationTool";
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
  totalViewsToday: number;
  totalViewsYesterday: number;
  uniqueVisitorsToday: number;
  uniqueVisitorsYesterday: number;
}
interface ChartDataPoint {
  date: string;
  adminReports: number;
  nonAdminReports: number;
  revenueLineReports: number;
  total: number;
}

interface ViewsChartDataPoint {
  date: string;
  uniqueVisitors: number;
  totalViews: number;
}

interface TrafficStats {
  totalViewsAllTime: number;
  uniqueVisitorsAllTime: number;
  totalSharesAllTime: number;
  avgViewsPerReport: number;
  totalViewsToday: number;
  totalViewsYesterday: number;
  uniqueVisitorsToday: number;
  uniqueVisitorsYesterday: number;
  totalSharesToday: number;
  totalSharesYesterday: number;
}

interface TrafficSource {
  referrer: string;
  count: number;
  percentage: number;
}

interface SharePlatform {
  platform: string;
  count: number;
}

interface MostVisitedPage {
  domain: string;
  viewCount: number;
}

interface HourlyData {
  hour: number;
  views: number;
}

interface TopReport {
  domain: string;
  report_id: string;
  total_views: number;
  unique_visitors: number;
  share_count: number;
  slug: string;
}

interface RecentView {
  id: string;
  domain: string;
  viewed_at: string;
  referrer: string | null;
  user_agent: string | null;
  session_id: string;
}
const AdminDashboard = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [filteredReports, setFilteredReports] = useState<ReportSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [hotLeadsCount, setHotLeadsCount] = useState(0);
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
    totalViewsToday: 0,
    totalViewsYesterday: 0,
    uniqueVisitorsToday: 0,
    uniqueVisitorsYesterday: 0,
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [viewsChartData, setViewsChartData] = useState<ViewsChartDataPoint[]>([]);
  const [timePeriod, setTimePeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [viewsTimePeriod, setViewsTimePeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [leaderboardTimeFilter, setLeaderboardTimeFilter] = useState<'daily' | 'weekly' | 'monthly' | 'all-time'>('monthly');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Analytics tab state
  const [trafficStats, setTrafficStats] = useState<TrafficStats>({
    totalViewsAllTime: 0,
    uniqueVisitorsAllTime: 0,
    totalSharesAllTime: 0,
    avgViewsPerReport: 0,
    totalViewsToday: 0,
    totalViewsYesterday: 0,
    uniqueVisitorsToday: 0,
    uniqueVisitorsYesterday: 0,
    totalSharesToday: 0,
    totalSharesYesterday: 0,
  });
  const [mostVisitedPages, setMostVisitedPages] = useState<MostVisitedPage[]>([]);
  const [sharePlatforms, setSharePlatforms] = useState<SharePlatform[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [topReports, setTopReports] = useState<TopReport[]>([]);
  const [recentViews, setRecentViews] = useState<RecentView[]>([]);

  // Report generation state
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportProgress, setReportProgress] = useState(0);
  const [generatedReport, setGeneratedReport] = useState<ReportData | null>(null);
  const [reportFormData, setReportFormData] = useState<FormData | null>(null);
  const [reportApiError, setReportApiError] = useState<string | null>(null);

  // Business Insights State
  const [peakDay, setPeakDay] = useState({ date: '', count: 0, percentageOfTotal: 0 });
  const [qualityScore, setQualityScore] = useState({ highImpactCount: 0, totalCount: 0, percentage: 0 });
  const [topRevenueDomain, setTopRevenueDomain] = useState({ domain: '', yearlyRevenueLost: 0, monthlyRevenueLost: 0 });
  const [topLeadsDomain, setTopLeadsDomain] = useState({ domain: '', missedLeads: 0 });
  const [avgDealSize, setAvgDealSize] = useState({ avgDealSize: 0, medianDealSize: 0 });
  const [hotStreak, setHotStreak] = useState({ currentStreak: 0, longestStreak: 0, isActive: false });
  const [conversionHealth, setConversionHealth] = useState({ conversionRate: 0, reportsInCRM: 0, totalReports: 0 });
  const [marketOpportunity, setMarketOpportunity] = useState({ totalOpportunity: 0, activeProspects: 0, avgPerProspect: 0 });
  useEffect(() => {
    fetchReports();
    fetchStats();
    fetchHotLeadsCount();
    fetchChartData(timePeriod);
    fetchViewsChartData(viewsTimePeriod);
    fetchTrafficStats();
    fetchMostVisitedPages();
    fetchShareDistribution();
    fetchHourlyHeatmap();
    fetchTopReports();
    fetchRecentViews();
    fetchPeakPerformanceDay();
    fetchQualityScore();
    fetchTopRevenueDomain();
    fetchTopLeadsDomain();
    fetchAverageDealSize();
    fetchHotStreak();
    fetchConversionRate();
    fetchTotalMarketOpportunity();

    // Set up real-time subscription for new reports
    const channel = supabase
      .channel('reports-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reports'
        },
        () => {
          console.log('New report detected, refreshing data...');
          fetchReports();
          fetchStats();
          fetchChartData(timePeriod);
          fetchViewsChartData(viewsTimePeriod);
          fetchTrafficStats();
          fetchMostVisitedPages();
          fetchShareDistribution();
          fetchHourlyHeatmap();
          fetchTopReports();
          fetchRecentViews();
          fetchPeakPerformanceDay();
          fetchQualityScore();
          fetchTopRevenueDomain();
          fetchTopLeadsDomain();
          fetchAverageDealSize();
          fetchHotStreak();
          fetchConversionRate();
          fetchTotalMarketOpportunity();
          setLastUpdated(new Date());
        }
      )
      .subscribe();

    // Set up periodic refresh every 60 seconds
    const refreshInterval = setInterval(() => {
      fetchReports();
      fetchStats();
      fetchChartData(timePeriod);
      fetchViewsChartData(viewsTimePeriod);
      fetchTrafficStats();
      fetchMostVisitedPages();
      fetchShareDistribution();
      fetchHourlyHeatmap();
      fetchTopReports();
      fetchRecentViews();
      fetchPeakPerformanceDay();
      fetchQualityScore();
      fetchTopRevenueDomain();
      fetchTopLeadsDomain();
      fetchAverageDealSize();
      fetchHotStreak();
      fetchConversionRate();
      fetchTotalMarketOpportunity();
      setLastUpdated(new Date());
    }, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(refreshInterval);
    };
  }, []);

  useEffect(() => {
    fetchChartData(timePeriod);
  }, [timePeriod]);

  useEffect(() => {
    fetchViewsChartData(viewsTimePeriod);
  }, [viewsTimePeriod]);
  useEffect(() => {
    const filtered = reports.filter(report => report.domain.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredReports(filtered);
  }, [searchTerm, reports]);
  const fetchReports = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('reports').select('id, domain, created_at, is_public, user_id, slug, report_data').order('created_at', {
        ascending: false
      }).limit(100);
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
  const fetchHotLeadsCount = async () => {
    try {
      const { data, error } = await supabase
        .from('prospect_activities')
        .select('id', { count: 'exact' })
        .eq('priority', 'hot')
        .in('status', ['new', 'contacted', 'proposal']);

      if (error) throw error;
      setHotLeadsCount(data?.length || 0);
    } catch (error) {
      console.error("Error fetching hot leads:", error);
    }
  };

  const fetchStats = async () => {
    try {
      // Get all reports with user_id
      const {
        data: allReports,
        error: reportsError
      } = await supabase.from('reports').select('domain, created_at, user_id, report_data');
      if (reportsError) throw reportsError;

      // Get all user roles
      const {
        data: userRoles,
        error: rolesError
      } = await supabase.from('user_roles').select('user_id, role');
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
      const todayReports = allReports?.filter(r => {
        const reportDate = new Date(r.created_at);
        return reportDate >= today;
      }) || [];
      const yesterdayReports = allReports?.filter(r => {
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
      // Get report views data
      const { data: allViews, error: viewsError } = await supabase
        .from('report_views')
        .select('viewed_at, session_id');

      if (viewsError) throw viewsError;

      const todayViews = allViews?.filter(v => {
        const viewDate = new Date(v.viewed_at);
        return viewDate >= today;
      }) || [];

      const yesterdayViews = allViews?.filter(v => {
        const viewDate = new Date(v.viewed_at);
        return viewDate >= yesterday && viewDate < today;
      }) || [];

      const totalViewsToday = todayViews.length;
      const totalViewsYesterday = yesterdayViews.length;
      const uniqueVisitorsToday = new Set(todayViews.map(v => v.session_id)).size;
      const uniqueVisitorsYesterday = new Set(yesterdayViews.map(v => v.session_id)).size;

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
        totalViewsToday,
        totalViewsYesterday,
        uniqueVisitorsToday,
        uniqueVisitorsYesterday,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchViewsChartData = async (period: 'weekly' | 'monthly' | 'yearly') => {
    try {
      const { data: allViews, error: viewsError } = await supabase
        .from('report_views')
        .select('viewed_at, session_id')
        .order('viewed_at', { ascending: true });

      if (viewsError) throw viewsError;

      const now = new Date();
      let startDate: Date;
      let dateFormat: (date: Date) => string;
      let periods: number;
      let incrementType: 'day' | 'month';

      switch (period) {
        case 'weekly':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
          periods = 8;
          incrementType = 'day';
          dateFormat = date => date.toLocaleDateString('en-US', {
            weekday: 'short',
            day: 'numeric'
          });
          break;
        case 'yearly':
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 12);
          periods = 13;
          incrementType = 'month';
          dateFormat = date => date.toLocaleDateString('en-US', {
            month: 'short',
            year: '2-digit'
          });
          break;
        default:
          // monthly
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 30);
          periods = 31;
          incrementType = 'day';
          dateFormat = date => date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          });
      }

      if (incrementType === 'day') {
        startDate.setHours(0, 0, 0, 0);
      }

      const dateMap = new Map<string, { uniqueSessions: Set<string>; totalViews: number }>();

      // Initialize all periods
      for (let i = 0; i < periods; i++) {
        const date = new Date(startDate);
        if (incrementType === 'day') {
          date.setDate(date.getDate() + i);
        } else {
          date.setMonth(date.getMonth() + i);
        }
        const dateStr = period === 'yearly' 
          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` 
          : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        dateMap.set(dateStr, { uniqueSessions: new Set(), totalViews: 0 });
      }

      // Count views and unique sessions for each period
      allViews?.forEach(view => {
        const viewDate = new Date(view.viewed_at);
        let key: string;
        if (period === 'yearly') {
          key = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}`;
        } else {
          key = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(viewDate.getDate()).padStart(2, '0')}`;
        }
        if (dateMap.has(key)) {
          const current = dateMap.get(key)!;
          current.uniqueSessions.add(view.session_id);
          current.totalViews += 1;
          dateMap.set(key, current);
        }
      });

      // Convert to chart format
      const chartData: ViewsChartDataPoint[] = Array.from(dateMap.entries()).map(([dateKey, data]) => {
        let displayDate: string;
        if (period === 'yearly') {
          const [year, month] = dateKey.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1, 1);
          displayDate = dateFormat(date);
        } else {
          const [y, m, d] = dateKey.split('-').map(Number);
          const localDate = new Date(y, m - 1, d);
          displayDate = dateFormat(localDate);
        }
        return {
          date: displayDate,
          uniqueVisitors: data.uniqueSessions.size,
          totalViews: data.totalViews
        };
      });

      setViewsChartData(chartData);
    } catch (error) {
      console.error('Error fetching views chart data:', error);
    }
  };

  const fetchTrafficStats = async () => {
    try {
      const { data: allViews, error: viewsError } = await supabase
        .from('report_views')
        .select('report_id, session_id');
      
      if (viewsError) throw viewsError;

      const { data: allShares, error: sharesError } = await supabase
        .from('report_shares')
        .select('id');
      
      if (sharesError) throw sharesError;

      const totalViewsAllTime = allViews?.length || 0;
      const uniqueVisitorsAllTime = new Set(allViews?.map(v => v.session_id) || []).size;
      const totalSharesAllTime = allShares?.length || 0;
      
      // Calculate unique reports viewed
      const uniqueReportsViewed = new Set(allViews?.map(v => v.report_id) || []).size;
      const avgViewsPerReport = uniqueReportsViewed > 0 ? totalViewsAllTime / uniqueReportsViewed : 0;

      // Get today's data
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: todayViews } = await supabase
        .from('report_views')
        .select('id, session_id')
        .gte('viewed_at', today.toISOString());
      
      const { data: todayShares } = await supabase
        .from('report_shares')
        .select('id')
        .gte('shared_at', today.toISOString());
      
      // Get yesterday's data
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { data: yesterdayViews } = await supabase
        .from('report_views')
        .select('id, session_id')
        .gte('viewed_at', yesterday.toISOString())
        .lt('viewed_at', today.toISOString());
      
      const { data: yesterdayShares } = await supabase
        .from('report_shares')
        .select('id')
        .gte('shared_at', yesterday.toISOString())
        .lt('shared_at', today.toISOString());

      setTrafficStats({
        totalViewsAllTime,
        uniqueVisitorsAllTime,
        totalSharesAllTime,
        avgViewsPerReport: Math.round(avgViewsPerReport * 10) / 10,
        totalViewsToday: todayViews?.length || 0,
        totalViewsYesterday: yesterdayViews?.length || 0,
        uniqueVisitorsToday: new Set(todayViews?.map(v => v.session_id) || []).size,
        uniqueVisitorsYesterday: new Set(yesterdayViews?.map(v => v.session_id) || []).size,
        totalSharesToday: todayShares?.length || 0,
        totalSharesYesterday: yesterdayShares?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching traffic stats:', error);
    }
  };

  const fetchMostVisitedPages = async () => {
    try {
      const { data: reportViews, error } = await supabase
        .from('report_views')
        .select('report_id');
      
      if (error) throw error;

      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select('id, domain');
      
      if (reportsError) throw reportsError;

      // Count views per domain
      const domainCounts = new Map<string, number>();
      
      reportViews?.forEach(view => {
        const report = reports?.find(r => r.id === view.report_id);
        if (report) {
          const domain = report.domain;
          domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
        }
      });

      const pages: MostVisitedPage[] = Array.from(domainCounts.entries())
        .map(([domain, viewCount]) => ({ domain, viewCount }))
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 10);

      console.log('Most visited pages data:', pages);
      setMostVisitedPages(pages);
    } catch (error) {
      console.error('Error fetching most visited pages:', error);
    }
  };

  const fetchShareDistribution = async () => {
    try {
      const { data: allShares, error } = await supabase
        .from('report_shares')
        .select('platform');
      
      if (error) throw error;

      const platformCounts = new Map<string, number>();

      allShares?.forEach(share => {
        const platform = share.platform || 'Unknown';
        platformCounts.set(platform, (platformCounts.get(platform) || 0) + 1);
      });

      const platforms: SharePlatform[] = Array.from(platformCounts.entries())
        .map(([platform, count]) => ({ platform, count }))
        .sort((a, b) => b.count - a.count);

      console.log('Share platforms data:', platforms);
      setSharePlatforms(platforms);
    } catch (error) {
      console.error('Error fetching share distribution:', error);
    }
  };

  const fetchHourlyHeatmap = async () => {
    try {
      const { data: allViews, error } = await supabase
        .from('report_views')
        .select('viewed_at');
      
      if (error) throw error;

      const hourCounts = new Array(24).fill(0);

      allViews?.forEach(view => {
        const hour = new Date(view.viewed_at).getHours();
        hourCounts[hour]++;
      });

      const hourlyData: HourlyData[] = hourCounts.map((views, hour) => ({
        hour,
        views
      }));

      setHourlyData(hourlyData);
    } catch (error) {
      console.error('Error fetching hourly heatmap:', error);
    }
  };

  const fetchTopReports = async () => {
    try {
      const { data: views, error: viewsError } = await supabase
        .from('report_views')
        .select('report_id, session_id');
      
      if (viewsError) throw viewsError;

      const { data: shares, error: sharesError } = await supabase
        .from('report_shares')
        .select('report_id');
      
      if (sharesError) throw sharesError;

      const reportMetrics = new Map<string, { views: number; sessions: Set<string>; shares: number }>();

      views?.forEach(view => {
        if (!reportMetrics.has(view.report_id)) {
          reportMetrics.set(view.report_id, { views: 0, sessions: new Set(), shares: 0 });
        }
        const metrics = reportMetrics.get(view.report_id)!;
        metrics.views++;
        metrics.sessions.add(view.session_id);
      });

      shares?.forEach(share => {
        if (reportMetrics.has(share.report_id)) {
          reportMetrics.get(share.report_id)!.shares++;
        }
      });

      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select('id, domain, slug')
        .in('id', Array.from(reportMetrics.keys()));
      
      if (reportsError) throw reportsError;

      const topReports: TopReport[] = reports?.map(report => {
        const metrics = reportMetrics.get(report.id)!;
        return {
          domain: report.domain,
          report_id: report.id,
          total_views: metrics.views,
          unique_visitors: metrics.sessions.size,
          share_count: metrics.shares,
          slug: report.slug
        };
      })
      .sort((a, b) => b.total_views - a.total_views)
      .slice(0, 10) || [];

      setTopReports(topReports);
    } catch (error) {
      console.error('Error fetching top reports:', error);
    }
  };

  const fetchRecentViews = async () => {
    try {
      const { data: views, error } = await supabase
        .from('report_views')
        .select('id, report_id, viewed_at, referrer, user_agent, session_id')
        .order('viewed_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;

      const reportIds = views?.map(v => v.report_id) || [];
      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select('id, domain')
        .in('id', reportIds);
      
      if (reportsError) throw reportsError;

      const reportMap = new Map(reports?.map(r => [r.id, r.domain]) || []);

      const recentViews: RecentView[] = views?.map(view => ({
        id: view.id,
        domain: reportMap.get(view.report_id) || 'Unknown',
        viewed_at: view.viewed_at,
        referrer: view.referrer,
        user_agent: view.user_agent,
        session_id: view.session_id
      })) || [];

      setRecentViews(recentViews);
    } catch (error) {
      console.error('Error fetching recent views:', error);
    }
  };

  // Helper functions for formatting
  const formatLargeNumber = (num: number): string => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toLocaleString()}`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00Z');
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  const truncateDomain = (domain: string, maxLength: number = 25): string => {
    return domain.length > maxLength ? domain.substring(0, maxLength) + '...' : domain;
  };

  // Business Insights Fetch Functions
  const fetchPeakPerformanceDay = async () => {
    try {
      const { data: allReports, error } = await supabase
        .from('reports')
        .select('created_at');
      
      if (error) throw error;

      const dateCounts = new Map<string, number>();
      allReports?.forEach(report => {
        const date = new Date(report.created_at).toISOString().split('T')[0];
        dateCounts.set(date, (dateCounts.get(date) || 0) + 1);
      });

      let maxCount = 0;
      let peakDate = '';
      dateCounts.forEach((count, date) => {
        if (count > maxCount) {
          maxCount = count;
          peakDate = date;
        }
      });

      const totalReports = allReports?.length || 1;
      const percentageOfTotal = (maxCount / totalReports) * 100;

      setPeakDay({
        date: peakDate,
        count: maxCount,
        percentageOfTotal: Math.round(percentageOfTotal)
      });
    } catch (error) {
      console.error('Error fetching peak performance day:', error);
    }
  };

  const fetchQualityScore = async () => {
    try {
      const { data: allReports, error } = await supabase
        .from('reports')
        .select('report_data');
      
      if (error) throw error;

      let highImpactCount = 0;
      const totalCount = allReports?.length || 0;

      allReports?.forEach(report => {
        const reportData = report.report_data as any;
        const yearlyRevenueLost = reportData?.yearlyRevenueLost || 0;
        const missedLeads = reportData?.missedLeads || 0;
        
        if (yearlyRevenueLost > 500000 || missedLeads > 1000) {
          highImpactCount++;
        }
      });

      const percentage = totalCount > 0 ? (highImpactCount / totalCount) * 100 : 0;

      setQualityScore({
        highImpactCount,
        totalCount,
        percentage: Math.round(percentage)
      });
    } catch (error) {
      console.error('Error fetching quality score:', error);
    }
  };

  const fetchTopRevenueDomain = async () => {
    try {
      const { data: reports, error } = await supabase
        .from('reports')
        .select('domain, report_data')
        .order('id', { ascending: false })
        .limit(1000);
      
      if (error) throw error;

      let topDomain = { domain: '', yearlyRevenueLost: 0, monthlyRevenueLost: 0 };

      reports?.forEach(report => {
        const reportData = report.report_data as any;
        const yearlyRevenueLost = reportData?.yearlyRevenueLost || 0;
        const monthlyRevenueLost = reportData?.monthlyRevenueLost || 0;
        
        if (yearlyRevenueLost > topDomain.yearlyRevenueLost) {
          topDomain = {
            domain: report.domain,
            yearlyRevenueLost,
            monthlyRevenueLost
          };
        }
      });

      setTopRevenueDomain(topDomain);
    } catch (error) {
      console.error('Error fetching top revenue domain:', error);
    }
  };

  const fetchTopLeadsDomain = async () => {
    try {
      const { data: reports, error } = await supabase
        .from('reports')
        .select('domain, report_data')
        .order('id', { ascending: false })
        .limit(1000);
      
      if (error) throw error;

      let topDomain = { domain: '', missedLeads: 0 };

      reports?.forEach(report => {
        const reportData = report.report_data as any;
        const missedLeads = reportData?.missedLeads || 0;
        
        if (missedLeads > topDomain.missedLeads) {
          topDomain = {
            domain: report.domain,
            missedLeads
          };
        }
      });

      setTopLeadsDomain(topDomain);
    } catch (error) {
      console.error('Error fetching top leads domain:', error);
    }
  };

  const fetchAverageDealSize = async () => {
    try {
      const { data: reports, error } = await supabase
        .from('reports')
        .select('report_data');
      
      if (error) throw error;

      const revenues: number[] = [];
      reports?.forEach(report => {
        const reportData = report.report_data as any;
        const yearlyRevenueLost = reportData?.yearlyRevenueLost || 0;
        if (yearlyRevenueLost > 0) {
          revenues.push(yearlyRevenueLost);
        }
      });

      const avgDealSize = revenues.length > 0 
        ? revenues.reduce((sum, val) => sum + val, 0) / revenues.length 
        : 0;

      const sortedRevenues = [...revenues].sort((a, b) => a - b);
      const medianDealSize = sortedRevenues.length > 0
        ? sortedRevenues[Math.floor(sortedRevenues.length / 2)]
        : 0;

      setAvgDealSize({
        avgDealSize: Math.round(avgDealSize),
        medianDealSize: Math.round(medianDealSize)
      });
    } catch (error) {
      console.error('Error fetching average deal size:', error);
    }
  };

  const fetchHotStreak = async () => {
    try {
      const { data: allReports, error } = await supabase
        .from('reports')
        .select('created_at')
        .order('created_at', { ascending: true });
      
      if (error) throw error;

      const dates = new Set<string>();
      allReports?.forEach(report => {
        const date = new Date(report.created_at).toISOString().split('T')[0];
        dates.add(date);
      });

      const sortedDates = Array.from(dates).sort();
      
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let prevDate: Date | null = null;

      sortedDates.forEach(dateStr => {
        const date = new Date(dateStr);
        
        if (prevDate) {
          const dayDiff = Math.floor((date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
          if (dayDiff === 1) {
            tempStreak++;
          } else {
            if (tempStreak > longestStreak) {
              longestStreak = tempStreak;
            }
            tempStreak = 1;
          }
        } else {
          tempStreak = 1;
        }
        
        prevDate = date;
      });

      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }

      // Check if streak is still active (last report was today or yesterday)
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const lastDate = sortedDates[sortedDates.length - 1];
      const isActive = lastDate === today || lastDate === yesterday;
      
      if (isActive) {
        currentStreak = tempStreak;
      } else {
        currentStreak = 0;
      }

      setHotStreak({
        currentStreak,
        longestStreak,
        isActive
      });
    } catch (error) {
      console.error('Error fetching hot streak:', error);
    }
  };

  const fetchConversionRate = async () => {
    try {
      const { data: allReports, error: reportsError } = await supabase
        .from('reports')
        .select('id', { count: 'exact' });
      
      if (reportsError) throw reportsError;

      const { data: crmReports, error: crmError } = await supabase
        .from('prospect_activities')
        .select('report_id', { count: 'exact' });
      
      if (crmError) throw crmError;

      const totalReports = allReports?.length || 0;
      const reportsInCRM = new Set(crmReports?.map(p => p.report_id) || []).size;
      const conversionRate = totalReports > 0 ? (reportsInCRM / totalReports) * 100 : 0;

      setConversionHealth({
        conversionRate: Math.round(conversionRate),
        reportsInCRM,
        totalReports
      });
    } catch (error) {
      console.error('Error fetching conversion rate:', error);
    }
  };

  const fetchTotalMarketOpportunity = async () => {
    try {
      const { data: allReports, error } = await supabase
        .from('reports')
        .select('report_data');
      
      if (error) throw error;

      let totalOpportunity = 0;
      let activeProspects = 0;

      allReports?.forEach(report => {
        const reportData = report.report_data as any;
        const yearlyRevenueLost = reportData?.yearlyRevenueLost || 0;
        if (yearlyRevenueLost > 0) {
          totalOpportunity += yearlyRevenueLost;
          activeProspects++;
        }
      });

      const avgPerProspect = activeProspects > 0 ? totalOpportunity / activeProspects : 0;

      setMarketOpportunity({
        totalOpportunity: Math.round(totalOpportunity),
        activeProspects,
        avgPerProspect: Math.round(avgPerProspect)
      });
    } catch (error) {
      console.error('Error fetching total market opportunity:', error);
    }
  };

  const fetchChartData = async (period: 'weekly' | 'monthly' | 'yearly') => {
    try {
      // First, get all reports with report_data
      const {
        data: allReports,
        error: reportsError
      } = await supabase.from('reports').select('created_at, user_id, report_data').order('created_at', {
        ascending: true
      });
      if (reportsError) throw reportsError;

      // Then, get all user roles
      const {
        data: userRoles,
        error: rolesError
      } = await supabase.from('user_roles').select('user_id, role');
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
          periods = 8;
          incrementType = 'day';
          dateFormat = date => date.toLocaleDateString('en-US', {
            weekday: 'short',
            day: 'numeric'
          });
          break;
        case 'yearly':
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 12);
          periods = 13;
          incrementType = 'month';
          dateFormat = date => date.toLocaleDateString('en-US', {
            month: 'short',
            year: '2-digit'
          });
          break;
        default:
          // monthly
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 30);
          periods = 31;
          incrementType = 'day';
          dateFormat = date => date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          });
      }
      
      // Normalize to local midnight for daily/weekly/monthly periods
      if (incrementType === 'day') {
        startDate.setHours(0, 0, 0, 0);
      }
      
      const dateMap = new Map<string, {
        admin: number;
        nonAdmin: number;
        revenueLoss: number;
      }>();

      // Initialize all periods with 0
      for (let i = 0; i < periods; i++) {
        const date = new Date(startDate);
        if (incrementType === 'day') {
          date.setDate(date.getDate() + i);
        } else {
          date.setMonth(date.getMonth() + i);
        }
        // Use local date components instead of UTC
        const dateStr = period === 'yearly' 
          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` 
          : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        dateMap.set(dateStr, {
          admin: 0,
          nonAdmin: 0,
          revenueLoss: 0
        });
      }

      // Count reports for each period, separating admin vs non-admin and revenue loss
      allReports?.forEach(report => {
        // Parse UTC timestamp - Date methods automatically return local timezone values
        const reportDate = new Date(report.created_at);
        
        let key: string;
        if (period === 'yearly') {
          // Use local month/year
          key = `${reportDate.getFullYear()}-${String(reportDate.getMonth() + 1).padStart(2, '0')}`;
        } else {
          // Use local date in YYYY-MM-DD format
          key = `${reportDate.getFullYear()}-${String(reportDate.getMonth() + 1).padStart(2, '0')}-${String(reportDate.getDate()).padStart(2, '0')}`;
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
          // Parse dateKey as local date components (not UTC)
          const [y, m, d] = dateKey.split('-').map(Number);
          const localDate = new Date(y, m - 1, d);
          displayDate = dateFormat(localDate);
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
      setLastUpdated(new Date());
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
    setReportFormData({
      ...formData,
      domain
    });
    const progressInterval = setInterval(() => {
      setReportProgress(prev => {
        if (prev < 90) return prev + Math.random() * 15;
        return prev;
      });
    }, 500);
    try {
      // Fetch domain data from SpyFu
      const apiData = await fetchDomainData(domain, formData.organicTrafficManual, formData.isUnsureOrganic);
      setReportProgress(95);
      const paidTraffic = formData.isUnsurePaid ? 0 : formData.monthlyVisitors || 0;
      const metrics = calculateReportMetrics(paidTraffic, formData.avgTransactionValue, apiData.organicTraffic, apiData.paidTraffic, apiData.monthlyRevenueData, apiData.dataSource === "api");
      const fullReportData: ReportData = {
        ...formData,
        ...apiData,
        ...metrics
      };
      setReportProgress(100);
      setTimeout(() => {
        setGeneratedReport(fullReportData);

        // Save report to database in background
        try {
          reportService.saveReport(fullReportData, user?.id).then(saveResult => {
            setGeneratedReport(prev => prev ? {
              ...prev,
              reportId: saveResult.reportId,
              slug: saveResult.slug
            } : null);
            console.log('Report saved:', saveResult);
            toast.success('Report saved successfully!', {
              description: 'Report has been added to the database.',
              duration: 4000
            });

            // Refresh the reports list
            fetchReports();
          }).catch(saveError => {
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
          duration: 5000
        });
      }, 500);
    } catch (error) {
      console.error("Error calculating report:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
      setReportApiError(errorMsg);
      setIsGeneratingReport(false);
      clearInterval(progressInterval);
      toast.error("Failed to generate report", {
        description: "Please provide traffic data manually to continue.",
        duration: 8000
      });
    }
  };
  const handleResetReport = () => {
    setGeneratedReport(null);
    setReportApiError(null);
    setReportFormData(null);
    setReportProgress(0);
    toast.success("Report cleared", {
      duration: 3000
    });
  };
  const handleEditReport = () => {
    setGeneratedReport(null);
    setReportApiError(null);
    toast.info("Edit your information and submit again", {
      description: "Your previous entries have been preserved.",
      duration: 5000
    });
  };

  const handleGeneratedReportUpdate = async () => {
    if (!generatedReport?.reportId) {
      console.warn('No reportId available for update');
      return;
    }

    try {
      // Fetch the updated report from the database
      const result = await reportService.getReport(generatedReport.reportId);
      setGeneratedReport(result.reportData);
      toast.success('Report data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing report:', error);
      toast.error('Failed to refresh report data');
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
              fetchViewsChartData(viewsTimePeriod);
              fetchTrafficStats();
              fetchMostVisitedPages();
              fetchShareDistribution();
              fetchHourlyHeatmap();
              fetchTopReports();
              fetchRecentViews();
              fetchPeakPerformanceDay();
              fetchQualityScore();
              fetchTopRevenueDomain();
              fetchTopLeadsDomain();
              fetchAverageDealSize();
              fetchHotStreak();
              fetchConversionRate();
              fetchTotalMarketOpportunity();
              setLastUpdated(new Date());
              toast.success('Data refreshed!');
            }} disabled={loading}>
              Refresh Data
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="text-sm font-medium">Unique Domains</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-4xl font-bold">{stats.uniqueDomains}</div>
                <div className="flex gap-2 mt-0.5 text-xs">
                  <span className="text-green-600">Today: +{stats.uniqueDomainsToday}</span>
                  <span className="text-muted-foreground">Yesterday: +{stats.uniqueDomainsYesterday}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="text-sm font-medium">Admin Reports</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-4xl font-bold">{stats.adminReports}</div>
                <div className="flex gap-2 mt-0.5 text-xs">
                  <span className="text-green-600">Today: +{stats.adminReportsToday}</span>
                  <span className="text-muted-foreground">Yesterday: +{stats.adminReportsYesterday}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="text-sm font-medium">Non-Admin Reports</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-4xl font-bold">{stats.nonAdminReports}</div>
                <div className="flex gap-2 mt-0.5 text-xs">
                  <span className="text-green-600">Today: +{stats.nonAdminReportsToday}</span>
                  <span className="text-muted-foreground">Yesterday: +{stats.nonAdminReportsYesterday}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="text-sm font-medium text-black">High-Value Prospects</CardTitle>
                <Target className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-4xl font-bold text-orange-700">{stats.highValueProspects}</div>
                <div className="flex gap-2 mt-0.5 text-xs">
                  <span className="text-green-600">Today: +{stats.highValueProspectsToday}</span>
                  <span className="text-muted-foreground">Yesterday: +{stats.highValueProspectsYesterday}</span>
                </div>
                <p className="text-xs text-orange-600 mt-0.5">Significant revenue loss (&gt; $5,000/month)</p>
              </CardContent>
            </Card>

          </div>

          {/* Business Insights Section - 8 New Cards */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Business Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              
              {/* Card #1: Peak Performance Day */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                  <CardTitle className="text-sm font-medium">Peak Performance Day</CardTitle>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Trophy className="h-3 w-3 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-4xl font-bold">
                    {peakDay.date ? formatDate(peakDay.date) : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {peakDay.count} reports ({peakDay.percentageOfTotal}% of all time)
                  </p>
                </CardContent>
              </Card>

              {/* Card #2: Quality Score */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                  <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
                  <Award className={`h-4 w-4 ${qualityScore.percentage > 30 ? 'text-green-500' : qualityScore.percentage > 20 ? 'text-yellow-500' : 'text-orange-500'}`} />
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className={`text-4xl font-bold ${qualityScore.percentage > 30 ? 'text-green-500' : qualityScore.percentage > 20 ? 'text-yellow-500' : 'text-orange-500'}`}>
                    {qualityScore.percentage}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {qualityScore.highImpactCount} of {qualityScore.totalCount} are high-impact
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    &gt;$500K yearly or &gt;1K leads/mo
                  </p>
                </CardContent>
              </Card>

              {/* Card #3: Biggest Revenue Opportunity */}
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                  <CardTitle className="text-sm font-medium text-black">Biggest Revenue Opportunity</CardTitle>
                  <div className="flex items-center gap-1">
                    <Crown className="h-4 w-4 text-orange-600" />
                    <DollarSign className="h-3 w-3 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-2xl font-bold text-orange-700 truncate" title={topRevenueDomain.domain}>
                    {topRevenueDomain.domain ? truncateDomain(topRevenueDomain.domain, 20) : 'N/A'}
                  </div>
                  <p className="text-xs text-orange-600 mt-0.5 font-semibold">
                    {formatLargeNumber(topRevenueDomain.yearlyRevenueLost)}/year lost
                  </p>
                  <p className="text-xs text-orange-600">
                    ${topRevenueDomain.monthlyRevenueLost.toLocaleString()}/month
                  </p>
                </CardContent>
              </Card>

              {/* Card #4: Biggest Lead Volume Loss */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                  <CardTitle className="text-sm font-medium">Biggest Lead Volume Loss</CardTitle>
                  <div className="flex items-center gap-1">
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                    <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-2xl font-bold truncate" title={topLeadsDomain.domain}>
                    {topLeadsDomain.domain ? truncateDomain(topLeadsDomain.domain, 20) : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {topLeadsDomain.missedLeads.toLocaleString()} monthly missed leads
                  </p>
                </CardContent>
              </Card>

              {/* Card #5: Average Deal Size */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                  <CardTitle className="text-sm font-medium">Average Deal Size</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-4xl font-bold">
                    {formatLargeNumber(avgDealSize.avgDealSize)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Median: {formatLargeNumber(avgDealSize.medianDealSize)}/year
                  </p>
                </CardContent>
              </Card>

              {/* Card #6: Hot Streak */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                  <CardTitle className="text-sm font-medium">Hot Streak</CardTitle>
                  <Flame className={`h-4 w-4 ${hotStreak.isActive ? 'text-orange-500 animate-pulse' : 'text-muted-foreground'}`} />
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className={`text-4xl font-bold ${hotStreak.isActive ? 'text-orange-500' : ''}`}>
                    {hotStreak.currentStreak} {hotStreak.isActive && '🔥'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {hotStreak.currentStreak === 1 ? 'day' : 'days'} • Best: {hotStreak.longestStreak} days
                  </p>
                  {hotStreak.isActive && (
                    <p className="text-xs text-orange-500 font-semibold mt-0.5">
                      🚀 Streak Active!
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Card #7: Conversion Funnel Health */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                  <CardTitle className="text-sm font-medium">Conversion Funnel</CardTitle>
                  <Filter className={`h-4 w-4 ${conversionHealth.conversionRate > 50 ? 'text-green-500' : conversionHealth.conversionRate > 25 ? 'text-yellow-500' : 'text-red-500'}`} />
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className={`text-4xl font-bold ${conversionHealth.conversionRate > 50 ? 'text-green-500' : conversionHealth.conversionRate > 25 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {conversionHealth.conversionRate}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {conversionHealth.reportsInCRM} of {conversionHealth.totalReports} in CRM
                  </p>
                </CardContent>
              </Card>

              {/* Card #8: Total Market Opportunity */}
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                  <CardTitle className="text-sm font-medium text-black">Total Market Opportunity</CardTitle>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                    <Globe className="h-3 w-3 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-4xl font-bold text-orange-700">
                    {formatLargeNumber(marketOpportunity.totalOpportunity)}
                  </div>
                  <p className="text-xs text-orange-600 mt-0.5">
                    Avg: {formatLargeNumber(marketOpportunity.avgPerProspect)}/prospect
                  </p>
                  <p className="text-xs text-orange-600">
                    {marketOpportunity.activeProspects} active prospects
                  </p>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* Analytics Section with Shared Time Period Toggle */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Analytics Overview</h3>
                <p className="text-sm text-muted-foreground">
                  {timePeriod === 'weekly' ? 'Last 7 Days' : timePeriod === 'yearly' ? 'Last 12 Months' : 'Last 30 Days'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Live • Updated {Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000)}s ago
                </p>
              </div>
              <ToggleGroup type="single" value={timePeriod} onValueChange={value => value && setTimePeriod(value as 'weekly' | 'monthly' | 'yearly')} className="bg-muted/50">
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
                    <UsersIcon className="h-5 w-5" />
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
                      <XAxis dataKey="date" className="text-muted-foreground" fontSize={12} />
                      <YAxis className="text-muted-foreground" fontSize={12} label={{
                      value: 'Reports',
                      angle: -90,
                      position: 'insideLeft',
                      style: {
                        fill: 'hsl(var(--muted-foreground))'
                      }
                    }} />
                      <Tooltip contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }} />
                      <Legend />
                      <Line type="monotone" dataKey="adminReports" stroke="#60a5fa" strokeWidth={2.5} dot={{
                      fill: '#60a5fa',
                      strokeWidth: 2,
                      r: 4
                    }} activeDot={{
                      r: 6
                    }} name="Admin Reports" />
                      <Line type="monotone" dataKey="nonAdminReports" stroke="#ef4444" strokeWidth={2.5} dot={{
                      fill: '#ef4444',
                      strokeWidth: 2,
                      r: 4
                    }} activeDot={{
                      r: 6
                    }} name="Non-Admin Reports" />
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
                      <XAxis dataKey="date" className="text-muted-foreground" fontSize={12} />
                      <YAxis className="text-muted-foreground" fontSize={12} label={{
                      value: 'Count',
                      angle: -90,
                      position: 'insideLeft',
                      style: {
                        fill: 'hsl(var(--muted-foreground))'
                      }
                    }} />
                      <Tooltip contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }} />
                      <Legend />
                      <Line type="monotone" dataKey="total" stroke="#60a5fa" strokeWidth={2.5} dot={{
                      fill: '#60a5fa',
                      strokeWidth: 2,
                      r: 4
                    }} activeDot={{
                      r: 6
                    }} name="Total Reports" />
                      <Line type="monotone" dataKey="revenueLineReports" stroke="#ef4444" strokeWidth={2.5} dot={{
                      fill: '#ef4444',
                      strokeWidth: 2,
                      r: 4
                    }} activeDot={{
                      r: 6
                    }} name="High-Value Domains" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>


          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="crm">
                <UsersIcon className="h-4 w-4 mr-2" />
                CRM
              </TabsTrigger>
              <TabsTrigger value="generate">
                <FileText className="h-4 w-4 mr-2" />
                Generate
              </TabsTrigger>
              <TabsTrigger value="leaderboard">
                <Trophy className="h-4 w-4 mr-2" />
                Leaderboard
              </TabsTrigger>
              <TabsTrigger value="admin">
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </TabsTrigger>
              <TabsTrigger value="reports">
                <FileText className="h-4 w-4 mr-2" />
                Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <AdminManual />
            </TabsContent>

            <TabsContent value="crm" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>CRM Dashboard</CardTitle>
                  <CardDescription>
                    Manage prospects, track pipeline, and close deals
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">Full CRM Experience</h3>
                      <p className="text-sm text-muted-foreground">
                        Access the complete CRM with Kanban boards, task management, and sales metrics
                      </p>
                      {hotLeadsCount > 0 && (
                        <Badge variant="destructive" className="mt-2">
                          {hotLeadsCount} hot leads need follow-up
                        </Badge>
                      )}
                    </div>
                    <Button onClick={() => navigate('/admin/crm')}>
                      Open CRM
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="generate" className="space-y-6">
              {!generatedReport ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Generate Lead Report</CardTitle>
                      <CardDescription>
                        Enter domain information to generate a comprehensive lead analysis report
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <AdminLeadCalculatorForm
                      onCalculate={handleGenerateReport}
                      isCalculating={isGeneratingReport}
                      initialData={reportFormData}
                      apiError={reportApiError}
                      onReset={generatedReport ? handleResetReport : undefined}
                    />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="space-y-6">
                  {generatedReport && (
                    <>
                      <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Generated Report Preview</h2>
                        <div className="flex gap-2">
                          <Button onClick={handleEditReport} variant="outline">
                            Edit Report
                          </Button>
                          <Button onClick={handleResetReport}>
                            Generate New Report
                          </Button>
                        </div>
                      </div>
                    <LeadReport 
                      data={generatedReport} 
                      onReset={handleResetReport}
                      onEditData={handleEditReport}
                      onUpdate={handleGeneratedReportUpdate}
                    />
                    </>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Time Period</CardTitle>
                      <CardDescription>Select the time range for leaderboard rankings</CardDescription>
                    </div>
                    <ToggleGroup 
                      type="single" 
                      value={leaderboardTimeFilter} 
                      onValueChange={(value) => value && setLeaderboardTimeFilter(value as 'daily' | 'weekly' | 'monthly' | 'all-time')}
                    >
                      <ToggleGroupItem value="daily" aria-label="Daily">
                        Daily
                      </ToggleGroupItem>
                      <ToggleGroupItem value="weekly" aria-label="Weekly">
                        Weekly
                      </ToggleGroupItem>
                      <ToggleGroupItem value="monthly" aria-label="Monthly">
                        Monthly
                      </ToggleGroupItem>
                      <ToggleGroupItem value="all-time" aria-label="All Time">
                        All Time
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </CardHeader>
              </Card>
              
              <LeaderboardTab timeFilter={leaderboardTimeFilter} />
            </TabsContent>

            <TabsContent value="admin" className="space-y-6">
              <Tabs defaultValue="management" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="management">
                    <Shield className="h-4 w-4 mr-2" />
                    Management
                  </TabsTrigger>
                  <TabsTrigger value="analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="password">
                    <Key className="h-4 w-4 mr-2" />
                    Password
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="management" className="space-y-6">
                  <AdminManagement />
                  <ReportCategorizationTool />
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                  {/* Traffic Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold">{trafficStats.totalViewsAllTime.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {trafficStats.totalViewsToday} today, {trafficStats.totalViewsYesterday} yesterday
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                        <UsersIcon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold">{trafficStats.uniqueVisitorsAllTime.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {trafficStats.uniqueVisitorsToday} today, {trafficStats.uniqueVisitorsYesterday} yesterday
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-sm font-medium">Total Social Shares</CardTitle>
                        <Share2 className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold">{trafficStats.totalSharesAllTime.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {trafficStats.totalSharesToday} today, {trafficStats.totalSharesYesterday} yesterday
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-sm font-medium">Avg Views per Report</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold">{trafficStats.avgViewsPerReport.toFixed(1)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Engagement metric</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Daily Visitor Activity Chart */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Daily Visitor Activity</CardTitle>
                        <div className="flex gap-2">
                          <Button
                            variant={viewsTimePeriod === 'weekly' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              setViewsTimePeriod('weekly');
                              fetchViewsChartData('weekly');
                            }}
                          >
                            Week
                          </Button>
                          <Button
                            variant={viewsTimePeriod === 'monthly' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              setViewsTimePeriod('monthly');
                              fetchViewsChartData('monthly');
                            }}
                          >
                            Month
                          </Button>
                          <Button
                            variant={viewsTimePeriod === 'yearly' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              setViewsTimePeriod('yearly');
                              fetchViewsChartData('yearly');
                            }}
                          >
                            Year
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={viewsChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Legend />
                          <Bar yAxisId="left" dataKey="totalViews" fill="#60a5fa" name="Total Views" />
                          <Line yAxisId="right" type="monotone" dataKey="uniqueVisitors" stroke="#f97316" name="Unique Visitors" strokeWidth={2} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Traffic Sources and Share Distribution */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Most Visited Pages</CardTitle>
                        <CardDescription>Top 10 domains by view count</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {mostVisitedPages.length === 0 ? (
                          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                            <p>No page view data available yet.</p>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={mostVisitedPages} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis 
                                type="number"
                                tick={{ fill: 'hsl(var(--foreground))' }}
                                stroke="hsl(var(--border))"
                              />
                              <YAxis 
                                type="category"
                                dataKey="domain"
                                width={150}
                                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                                stroke="hsl(var(--border))"
                              />
                              <Tooltip 
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--card))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '6px',
                                  color: 'hsl(var(--foreground))'
                                }}
                              />
                              <Bar dataKey="viewCount" fill="#10b981" name="Views" />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Share Platform Distribution</CardTitle>
                        <CardDescription>Most popular sharing methods</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {sharePlatforms.length === 0 ? (
                          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                            <p>No share data available yet. Shares will appear here once reports are shared.</p>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={sharePlatforms}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis 
                                dataKey="platform" 
                                tick={{ fill: 'hsl(var(--foreground))' }}
                                stroke="hsl(var(--border))"
                              />
                              <YAxis 
                                tick={{ fill: 'hsl(var(--foreground))' }}
                                stroke="hsl(var(--border))"
                              />
                              <Tooltip 
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--card))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '6px',
                                  color: 'hsl(var(--foreground))'
                                }}
                              />
                              <Bar dataKey="count" fill="#60a5fa" name="Shares" />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Hourly Traffic Heatmap */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Hourly Traffic Heatmap</CardTitle>
                      <CardDescription>Peak traffic times throughout the day</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-12 gap-2">
                        {hourlyData.map((hour) => {
                          const maxViews = Math.max(...hourlyData.map(h => h.views));
                          const intensity = maxViews > 0 ? hour.views / maxViews : 0;
                          return (
                            <div
                              key={hour.hour}
                              className="aspect-square rounded flex flex-col items-center justify-center text-xs font-medium"
                              style={{
                                backgroundColor: `rgba(96, 165, 250, ${intensity})`,
                                color: intensity > 0.5 ? 'white' : 'black'
                              }}
                              title={`${hour.hour}:00 - ${hour.views} views`}
                            >
                              <div>{hour.hour}</div>
                              <div className="text-[10px]">{hour.views}</div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Reports and Recent Views */}
                  <div className="grid grid-cols-1 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Top 10 Most Viewed Reports</CardTitle>
                        <CardDescription>Reports with highest engagement</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Domain</TableHead>
                              <TableHead className="text-right">Total Views</TableHead>
                              <TableHead className="text-right">Unique Visitors</TableHead>
                              <TableHead className="text-right">Shares</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {topReports.map((report) => (
                              <TableRow key={report.report_id}>
                                <TableCell className="font-medium">{report.domain}</TableCell>
                                <TableCell className="text-right">{report.total_views}</TableCell>
                                <TableCell className="text-right">{report.unique_visitors}</TableCell>
                                <TableCell className="text-right">{report.share_count}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                  >
                                    <a href={`/report/${report.slug}`} target="_blank" rel="noopener noreferrer">
                                      View
                                    </a>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Views Log</CardTitle>
                        <CardDescription>Last 50 report views</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Domain</TableHead>
                              <TableHead>Viewed At</TableHead>
                              <TableHead>Referrer</TableHead>
                              <TableHead>Session ID</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {recentViews.map((view) => (
                              <TableRow key={view.id}>
                                <TableCell className="font-medium">{view.domain}</TableCell>
                                <TableCell>{new Date(view.viewed_at).toLocaleString()}</TableCell>
                                <TableCell>{view.referrer || 'Direct'}</TableCell>
                                <TableCell className="font-mono text-xs">{view.session_id.slice(0, 8)}...</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="password">
                  <PasswordManagement />
                </TabsContent>
              </Tabs>
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
                    <Input placeholder="Search domains..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="max-w-sm" />
                  </div>
                  
                  <AdminReportsTable reports={filteredReports} loading={loading} onReportUpdate={fetchReports} />
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