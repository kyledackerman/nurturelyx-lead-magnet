import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  DollarSign, 
  Calendar, 
  Activity, 
  Phone, 
  Mail, 
  MessageSquare, 
  Eye,
  Copy,
  ExternalLink,
  TrendingDown,
  Clock,
  Building,
  Target
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ReportData {
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
    monthlyRevenueLost?: number;
    avgTransactionValue?: number;
    monthlyRevenueData?: Array<{
      month: string;
      year: number;
      missedLeads: number;
      lostSales: number;
      revenueLost: number;
    }>;
  };
}

interface ProspectActivity {
  id: string;
  activity_type: string;
  status: string;
  priority: string;
  notes?: string;
  contact_method?: string;
  next_follow_up?: string;
  created_at: string;
  updated_at: string;
}

interface ProspectProfileProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportData | null;
  onActivityUpdate?: () => void;
}

export const ProspectProfile = ({ isOpen, onClose, report, onActivityUpdate }: ProspectProfileProps) => {
  const [activities, setActivities] = useState<ProspectActivity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && report) {
      fetchAllActivities();
    }
  }, [isOpen, report]);

  const fetchAllActivities = async () => {
    if (!report) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('prospect_activities')
        .select('*')
        .eq('report_id', report.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activity history');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const formatDateShort = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const openReport = () => {
    if (!report) return;
    const url = `${window.location.origin}/report/${report.slug}`;
    window.open(url, '_blank');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'hot': return 'bg-red-100 text-red-800 border-red-300';
      case 'warm': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'cold': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-gray-100 text-gray-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'proposal': return 'bg-purple-100 text-purple-800';
      case 'closed_won': return 'bg-emerald-100 text-emerald-800';
      case 'closed_lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getContactMethodIcon = (method?: string) => {
    switch (method) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'linkedin': return <MessageSquare className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const latestActivity = activities[0];
  const monthlyRevenue = report?.report_data?.monthlyRevenueLost || 0;
  const yearlyRevenue = report?.report_data?.yearlyRevenueLost || 0;
  const missedLeads = report?.report_data?.missedLeads || 0;
  const avgTransactionValue = report?.report_data?.avgTransactionValue || 0;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader className="pb-6">
          <div className="flex items-center gap-3">
            <Building className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <SheetTitle className="text-xl">{report?.domain}</SheetTitle>
              <SheetDescription>
                Prospect profile • Created {report && formatDateShort(report.created_at)}
              </SheetDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(report?.domain || '')}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={openReport}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Details</TabsTrigger>
            <TabsTrigger value="activity">Activity History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Lost</p>
                      <p className="text-xl font-bold text-red-600">{formatCurrency(monthlyRevenue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Yearly Lost</p>
                      <p className="text-xl font-bold">{formatCurrency(yearlyRevenue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Missed Leads</p>
                      <p className="text-xl font-bold">{missedLeads.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Transaction</p>
                      <p className="text-xl font-bold">{formatCurrency(avgTransactionValue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant="secondary" className={getStatusColor(latestActivity?.status || 'new')}>
                      {(latestActivity?.status || 'new').replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <Badge variant="outline" className={getPriorityColor(latestActivity?.priority || 'cold')}>
                      {(latestActivity?.priority || 'cold').toUpperCase()}
                    </Badge>
                  </div>
                  {latestActivity?.next_follow_up && (
                    <div>
                      <p className="text-sm text-muted-foreground">Next Follow-up</p>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-4 w-4" />
                        {formatDateShort(latestActivity.next_follow_up)}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Latest Activity */}
            {latestActivity && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Latest Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getContactMethodIcon(latestActivity.contact_method)}
                      <span className="font-medium">{latestActivity.activity_type}</span>
                      {latestActivity.contact_method && (
                        <span className="text-sm text-muted-foreground">
                          via {latestActivity.contact_method}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(latestActivity.updated_at)}
                    </p>
                    {latestActivity.notes && (
                      <p className="text-sm mt-2 p-2 bg-muted rounded">
                        {latestActivity.notes}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Opportunity Breakdown</CardTitle>
                <CardDescription>
                  Detailed analysis of potential revenue recovery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(monthlyRevenue)}</p>
                    <p className="text-sm text-muted-foreground">Monthly Revenue Lost</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-2xl font-bold">{formatCurrency(yearlyRevenue)}</p>
                    <p className="text-sm text-muted-foreground">Annual Revenue Lost</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Missed Leads (Monthly)</span>
                    <span className="font-medium">{missedLeads.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Transaction Value</span>
                    <span className="font-medium">{formatCurrency(avgTransactionValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Organic Traffic</span>
                    <span className="font-medium">{(report?.report_data?.organicTraffic || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paid Traffic</span>
                    <span className="font-medium">{(report?.report_data?.paidTraffic || 0).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activity Timeline
                  {activities.length > 0 && (
                    <Badge variant="secondary">{activities.length}</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Complete history of interactions with this prospect
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : activities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No activities recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity, index) => (
                      <div key={activity.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="p-2 bg-muted rounded-full">
                            {getContactMethodIcon(activity.contact_method)}
                          </div>
                          {index < activities.length - 1 && (
                            <div className="w-px h-8 bg-border mt-2" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{activity.activity_type}</span>
                            <Badge variant="outline" className={getStatusColor(activity.status)}>
                              {activity.status.replace('_', ' ')}
                            </Badge>
                            {activity.contact_method && (
                              <span className="text-sm text-muted-foreground">
                                via {activity.contact_method}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(activity.created_at)}
                          </p>
                          {activity.notes && (
                            <p className="text-sm p-2 bg-muted rounded">
                              {activity.notes}
                            </p>
                          )}
                          {activity.next_follow_up && (
                            <div className="flex items-center gap-1 text-sm text-blue-600">
                              <Calendar className="h-4 w-4" />
                              Follow-up: {formatDateShort(activity.next_follow_up)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};