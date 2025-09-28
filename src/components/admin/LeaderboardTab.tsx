import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, TrendingUp, DollarSign, Users, Target, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';

interface AdminPerformance {
  adminId: string;
  adminEmail: string;
  totalReports: number;
  totalRevenueLost: number;
  totalLeads: number;
  averageRevenuePerReport: number;
  qualityScore: number;
  compositeScore: number;
  reportsWithRevenue: number;
  conversionQuality: number;
  rank: number;
}

interface LeaderboardTabProps {
  timeFilter: 'daily' | 'weekly' | 'monthly' | 'all-time';
}

const LeaderboardTab = ({ timeFilter = 'monthly' }: LeaderboardTabProps) => {
  const [leaderboard, setLeaderboard] = useState<AdminPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboardData();
  }, [timeFilter]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);

      // Calculate date filter based on timeFilter
      let dateFilter = '';
      const now = new Date();
      switch (timeFilter) {
        case 'daily':
          dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
          break;
        case 'weekly':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilter = weekAgo.toISOString();
          break;
        case 'monthly':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          dateFilter = monthAgo.toISOString();
          break;
        default:
          dateFilter = '';
      }

      // Query to get admin performance data
      let query = supabase
        .from('reports')
        .select(`
          user_id,
          report_data,
          created_at
        `)
        .not('user_id', 'is', null);

      if (dateFilter) {
        query = query.gte('created_at', dateFilter);
      }

      const { data: reports, error } = await query;

      if (error) throw error;

      // Fetch admin emails using the get-admins edge function
      const { data: adminData, error: adminError } = await supabase.functions.invoke('get-admins');
      
      if (adminError) {
        console.error('Error fetching admin emails:', adminError);
      }

      // Create a mapping of user IDs to emails
      const adminEmailMap = new Map<string, string>();
      if (adminData?.admins) {
        adminData.admins.forEach((admin: any) => {
          adminEmailMap.set(admin.id, admin.email);
        });
      }

      // Calculate performance metrics for each admin
      const adminMap = new Map<string, AdminPerformance>();

      reports?.forEach((report) => {
        if (!report.user_id) return;

        const adminId = report.user_id;
        const adminEmail = adminEmailMap.get(adminId) || adminId; // Use email from map or fallback to ID
        const reportData = report.report_data as any;
        
        const monthlyRevenueLost = reportData?.monthlyRevenueLost || 0;
        const missedLeads = reportData?.missedLeads || 0;
        const avgTransactionValue = reportData?.avgTransactionValue || 0;

        if (!adminMap.has(adminId)) {
          adminMap.set(adminId, {
            adminId,
            adminEmail,
            totalReports: 0,
            totalRevenueLost: 0,
            totalLeads: 0,
            averageRevenuePerReport: 0,
            qualityScore: 0,
            compositeScore: 0,
            reportsWithRevenue: 0,
            conversionQuality: 0,
            rank: 0
          });
        }

        const admin = adminMap.get(adminId)!;
        admin.totalReports += 1;
        admin.totalRevenueLost += monthlyRevenueLost;
        admin.totalLeads += missedLeads;
        
        if (monthlyRevenueLost > 0) {
          admin.reportsWithRevenue += 1;
        }
      });

      // Calculate derived metrics and composite scores
      const adminPerformances = Array.from(adminMap.values()).map(admin => {
        admin.averageRevenuePerReport = admin.totalReports > 0 ? admin.totalRevenueLost / admin.totalReports : 0;
        admin.conversionQuality = admin.totalReports > 0 ? (admin.reportsWithRevenue / admin.totalReports) * 100 : 0;
        
        // Quality score: combination of avg revenue and conversion rate
        admin.qualityScore = (admin.averageRevenuePerReport * 0.7) + (admin.conversionQuality * admin.averageRevenuePerReport * 0.3);
        
        // Composite score: (Total Revenue Lost / 1000 * 0.7) + (Total Leads * 0.3)
        admin.compositeScore = Math.round((admin.totalRevenueLost / 1000 * 0.7) + (admin.totalLeads * 0.3));
        
        return admin;
      });

      // Sort by composite score and assign ranks
      adminPerformances.sort((a, b) => b.compositeScore - a.compositeScore);
      adminPerformances.forEach((admin, index) => {
        admin.rank = index + 1;
      });

      setLeaderboard(adminPerformances);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeForRank = (rank: number) => {
    if (rank === 1) return { icon: Trophy, color: "bg-yellow-500", text: "Champion" };
    if (rank === 2) return { icon: Award, color: "bg-gray-400", text: "Runner-up" };
    if (rank === 3) return { icon: Target, color: "bg-orange-500", text: "Third Place" };
    return { icon: TrendingUp, color: "bg-blue-500", text: `#${rank}` };
  };

  const getQualityBadge = (admin: AdminPerformance) => {
    if (admin.averageRevenuePerReport > 50000) return { text: "High Value Hunter", color: "bg-green-600" };
    if (admin.conversionQuality > 80) return { text: "Quality Expert", color: "bg-blue-600" };
    if (admin.totalReports > 20) return { text: "Volume Leader", color: "bg-purple-600" };
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Admin Performance Leaderboard</h2>
          <p className="text-muted-foreground">Rankings based on revenue opportunity discovered and lead quality</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {timeFilter === 'all-time' ? 'All Time' : timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)}
        </Badge>
      </div>

      <Tabs defaultValue="overall" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overall">Overall</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="overall" className="space-y-4">
          {leaderboard.map((admin) => {
            const badge = getBadgeForRank(admin.rank);
            const qualityBadge = getQualityBadge(admin);
            const IconComponent = badge.icon;

            return (
              <Card key={admin.adminId} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full ${badge.color} text-white`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{admin.adminEmail}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">{badge.text}</Badge>
                          {qualityBadge && (
                            <Badge className={qualityBadge.color + " text-white"}>
                              {qualityBadge.text}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {admin.compositeScore.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Composite Score</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="font-semibold">{formatCurrency(admin.totalRevenueLost)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Revenue Found</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold">{admin.totalLeads.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Leads Found</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Target className="w-4 h-4 text-orange-500" />
                        <span className="font-semibold">{admin.conversionQuality.toFixed(1)}%</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Quality Rate</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <TrendingUp className="w-4 h-4 text-purple-500" />
                        <span className="font-semibold">{admin.totalReports}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Reports</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          {[...leaderboard].sort((a, b) => b.totalRevenueLost - a.totalRevenueLost).map((admin, index) => (
            <Card key={admin.adminId}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">#{index + 1} {admin.adminEmail}</CardTitle>
                  <Badge variant="outline">{formatCurrency(admin.totalRevenueLost)}</Badge>
                </div>
                <CardDescription>
                  Average: {formatCurrency(admin.averageRevenuePerReport)} per report
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          {[...leaderboard].sort((a, b) => b.totalLeads - a.totalLeads).map((admin, index) => (
            <Card key={admin.adminId}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">#{index + 1} {admin.adminEmail}</CardTitle>
                  <Badge variant="outline">{admin.totalLeads.toLocaleString()} leads</Badge>
                </div>
                <CardDescription>
                  Average: {(admin.totalLeads / Math.max(admin.totalReports, 1)).toFixed(1)} leads per report
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          {[...leaderboard].sort((a, b) => b.qualityScore - a.qualityScore).map((admin, index) => (
            <Card key={admin.adminId}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">#{index + 1} {admin.adminEmail}</CardTitle>
                  <Badge variant="outline">{admin.qualityScore.toFixed(0)} points</Badge>
                </div>
                <CardDescription>
                  {admin.conversionQuality.toFixed(1)}% quality rate • {formatCurrency(admin.averageRevenuePerReport)} avg revenue
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {leaderboard.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Performance Data</h3>
            <p className="text-muted-foreground">No admin performance data available for this time period.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeaderboardTab;