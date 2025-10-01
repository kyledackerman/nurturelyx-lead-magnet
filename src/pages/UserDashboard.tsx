import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ReportData } from '@/types/report';
import { reportService } from '@/services/reportService';
import { Eye, Share2, ExternalLink, Search, Calendar, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Header from '@/components/Header';

interface UserReport {
  id: string;
  domain: string;
  created_at: string;
  report_data: ReportData;
  slug: string;
  is_public: boolean;
}

const UserDashboard = () => {
  const { user, loading } = useAuth();
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserReports();
    }
  }, [user]);

  const fetchUserReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        toast.error('Failed to load reports');
        return;
      }

      const transformedData = (data || []).map(report => ({
        ...report,
        report_data: report.report_data as unknown as ReportData
      }));
      setReports(transformedData);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoadingReports(false);
    }
  };

  const handleShare = async (report: UserReport) => {
    const shareUrl = reportService.generateShareUrl(report.slug);
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Report link copied to clipboard!');
      
      // Track the share
      await reportService.trackShare(report.id, 'clipboard');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleDelete = async (reportId: string, domain: string) => {
    if (!user?.id) return;
    
    try {
      await reportService.deleteReport(reportId, user.id);
      setReports(reports.filter(report => report.id !== reportId));
      toast.success(`Report for ${domain} deleted successfully`);
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    }
  };

  const filteredReports = reports.filter(report =>
    report.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'America/New_York',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Reports</h1>
          <p className="text-muted-foreground">
            Track and manage your lead estimation reports
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{reports.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Lost Revenue</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(
                  reports.reduce((sum, report) => 
                    sum + (report.report_data.yearlyRevenueLost || 0), 0
                  )
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Missed Leads</CardTitle>
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {reports.reduce((sum, report) => 
                  sum + (report.report_data.missedLeads || 0), 0
                ).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button asChild>
            <Link to="/">Create New Report</Link>
          </Button>
        </div>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Reports</CardTitle>
            <CardDescription>
              All your generated lead estimation reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingReports ? (
              <div className="text-center py-8">Loading reports...</div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'No reports found matching your search.' : 'No reports yet.'}
                </p>
                {!searchTerm && (
                  <Button asChild>
                    <Link to="/">Create Your First Report</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain</TableHead>
                      <TableHead>Date Created</TableHead>
                      <TableHead>Missed Leads</TableHead>
                      <TableHead>Lost Revenue</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.domain}</TableCell>
                        <TableCell>{formatDate(report.created_at)}</TableCell>
                        <TableCell>
                          {(report.report_data.missedLeads || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(report.report_data.yearlyRevenueLost || 0)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={report.is_public ? "secondary" : "outline"}>
                            {report.is_public ? "Public" : "Private"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <Link to={`/report/${report.slug}`}>
                                <ExternalLink className="h-4 w-4" />
                                View
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleShare(report)}
                            >
                              <Share2 className="h-4 w-4" />
                              Share
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Report</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the report for "{report.domain}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(report.id, report.domain)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UserDashboard;