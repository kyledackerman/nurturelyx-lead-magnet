import { useState, useEffect } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminReportsTable } from "@/components/admin/AdminReportsTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Search, BarChart3, Globe, Calendar } from "lucide-react";
import { toast } from "sonner";

interface ReportSummary {
  domain: string;
  created_at: string;
  is_public: boolean;
  user_id: string | null;
  slug: string;
  id: string;
}

interface AdminStats {
  totalReports: number;
  uniqueDomains: number;
  reportsToday: number;
  publicReports: number;
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
  });

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
        .select('id, domain, created_at, is_public, user_id, slug')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setReports(data || []);
      setFilteredReports(data || []);
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
        .select('domain, created_at, is_public');

      if (error) throw error;

      const today = new Date().toISOString().split('T')[0];
      const uniqueDomains = new Set(allReports?.map(r => r.domain) || []).size;
      const reportsToday = allReports?.filter(r => 
        r.created_at.startsWith(today)
      ).length || 0;
      const publicReports = allReports?.filter(r => r.is_public).length || 0;

      setStats({
        totalReports: allReports?.length || 0,
        uniqueDomains,
        reportsToday,
        publicReports,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <AdminAuthGuard>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          </div>

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