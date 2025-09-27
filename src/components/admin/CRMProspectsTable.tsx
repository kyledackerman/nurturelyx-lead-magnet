import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Phone, Mail, MessageSquare, Eye, Copy, TrendingUp, Flame, Thermometer, Snowflake, Calendar, Plus } from "lucide-react";
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

interface CRMProspectsTableProps {
  reports: ReportData[];
  loading: boolean;
}

type StatusFilter = 'all' | 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed_won' | 'closed_lost';
type PriorityFilter = 'all' | 'hot' | 'warm' | 'cold';

export const CRMProspectsTable = ({ reports, loading }: CRMProspectsTableProps) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [activities, setActivities] = useState<Record<string, ProspectActivity>>({});
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [notes, setNotes] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [nextFollowUp, setNextFollowUp] = useState("");

  // Define getPriority function before using it
  const getPriority = (report: ReportData | null): 'hot' | 'warm' | 'cold' => {
    if (!report || !report.report_data) {
      return 'cold';
    }
    
    const monthlyRevenue = report.report_data.monthlyRevenueLost || 0;
    const activity = activities[report.id];
    
    if (activity?.priority) return activity.priority as 'hot' | 'warm' | 'cold';
    
    if (monthlyRevenue >= 5000) return 'hot';
    if (monthlyRevenue >= 2000) return 'warm';
    return 'cold';
  };

  // Filter reports to only show those with revenue lost
  const prospects = reports.filter(report => 
    (report.report_data?.monthlyRevenueLost || 0) > 0 || 
    (report.report_data?.yearlyRevenueLost || 0) > 0
  );

  // Apply filters
  const filteredProspects = prospects.filter(report => {
    const activity = activities[report.id];
    const status = activity?.status || 'new';
    const priority = getPriority(report);
    
    const statusMatch = statusFilter === 'all' || status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || priority === priorityFilter;
    
    return statusMatch && priorityMatch;
  });

  useEffect(() => {
    fetchActivities();
  }, [prospects]);

  const fetchActivities = async () => {
    if (prospects.length === 0) return;
    
    try {
      const reportIds = prospects.map(p => p.id);
      const { data, error } = await supabase
        .from('prospect_activities')
        .select('*')
        .in('report_id', reportIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get latest activity for each report
      const latestActivities: Record<string, ProspectActivity> = {};
      data?.forEach(activity => {
        if (!latestActivities[activity.report_id]) {
          latestActivities[activity.report_id] = activity;
        }
      });

      setActivities(latestActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'hot': return <Flame className="h-4 w-4 text-red-500" />;
      case 'warm': return <Thermometer className="h-4 w-4 text-orange-500" />;
      case 'cold': return <Snowflake className="h-4 w-4 text-blue-500" />;
      default: return <Thermometer className="h-4 w-4 text-gray-500" />;
    }
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const updateActivity = async (reportId: string, updates: Partial<ProspectActivity>) => {
    try {
      const existingActivity = activities[reportId];
      
      if (existingActivity) {
        const { error } = await supabase
          .from('prospect_activities')
          .update(updates)
          .eq('id', existingActivity.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('prospect_activities')
          .insert({
            report_id: reportId,
            activity_type: 'note',
            ...updates,
          });
        
        if (error) throw error;
      }
      
      toast.success('Activity updated successfully');
      fetchActivities();
    } catch (error) {
      console.error('Error updating activity:', error);
      toast.error('Failed to update activity');
    }
  };

  const handleAddActivity = async () => {
    if (!selectedReport) return;
    
    try {
      await updateActivity(selectedReport.id, {
        notes,
        contact_method: contactMethod,
        next_follow_up: nextFollowUp ? new Date(nextFollowUp).toISOString() : undefined,
        activity_type: 'note',
      });
      
      setNotes("");
      setContactMethod("");
      setNextFollowUp("");
      setSelectedReport(null);
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const openReport = (slug: string) => {
    const url = `${window.location.origin}/report/${slug}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading CRM prospects...</p>
        </div>
      </div>
    );
  }

  if (prospects.length === 0) {
    return (
      <div className="text-center p-8">
        <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No high-value prospects found</p>
        <p className="text-sm text-muted-foreground mt-2">Prospects appear here when they have monthly revenue lost &gt; $0</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="proposal">Proposal</SelectItem>
            <SelectItem value="closed_won">Closed Won</SelectItem>
            <SelectItem value="closed_lost">Closed Lost</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(value: PriorityFilter) => setPriorityFilter(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="hot">🔥 Hot ($5K+ monthly)</SelectItem>
            <SelectItem value="warm">🌡️ Warm ($2K+ monthly)</SelectItem>
            <SelectItem value="cold">❄️ Cold (Under $2K)</SelectItem>
          </SelectContent>
        </Select>

        <div className="text-sm text-muted-foreground">
          Showing {filteredProspects.length} of {prospects.length} prospects
        </div>
      </div>

      {/* CRM Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain & Priority</TableHead>
              <TableHead>Revenue Opportunity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Next Follow-up</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProspects.map((report) => {
              const activity = activities[report.id];
              const priority = getPriority(report);
              const status = activity?.status || 'new';
              const monthlyRevenue = report.report_data?.monthlyRevenueLost || 0;
              const yearlyRevenue = report.report_data?.yearlyRevenueLost || 0;
              
              return (
                <TableRow key={report.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(priority)}
                      <div>
                        <div className="font-semibold">{report.domain}</div>
                        <Badge variant="outline" className={`text-xs mt-1 ${getPriorityColor(priority)}`}>
                          {priority.toUpperCase()} PRIORITY
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-red-600">
                      {formatCurrency(monthlyRevenue)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(status)}>
                      {status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {activity ? (
                      <div className="text-sm">
                        <div className="font-medium">{activity.activity_type}</div>
                        <div className="text-muted-foreground">{formatDate(activity.updated_at)}</div>
                        {activity.contact_method && (
                          <div className="text-xs text-blue-600 mt-1">
                            via {activity.contact_method}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No activity</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {activity?.next_follow_up ? (
                      <div className="text-sm">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        {formatDate(activity.next_follow_up)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Not scheduled</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openReport(report.slug)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedReport(report);
                              const existingActivity = activities[report.id];
                              if (existingActivity) {
                                setNotes(existingActivity.notes || "");
                                setContactMethod(existingActivity.contact_method || "");
                                setNextFollowUp(existingActivity.next_follow_up?.split('T')[0] || "");
                              }
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Activity
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update CRM Activity - {selectedReport?.domain}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Status</label>
                              <Select 
                                value={activities[selectedReport?.id || '']?.status || 'new'} 
                                onValueChange={(value) => {
                                  if (selectedReport) {
                                    updateActivity(selectedReport.id, { status: value });
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">New</SelectItem>
                                  <SelectItem value="contacted">Contacted</SelectItem>
                                  <SelectItem value="qualified">Qualified</SelectItem>
                                  <SelectItem value="proposal">Proposal</SelectItem>
                                  <SelectItem value="closed_won">Closed Won</SelectItem>
                                  <SelectItem value="closed_lost">Closed Lost</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Priority</label>
                              <Select 
                                value={activities[selectedReport?.id || '']?.priority || (selectedReport ? getPriority(selectedReport) : 'cold')} 
                                onValueChange={(value) => {
                                  if (selectedReport) {
                                    updateActivity(selectedReport.id, { priority: value });
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="hot">🔥 Hot</SelectItem>
                                  <SelectItem value="warm">🌡️ Warm</SelectItem>
                                  <SelectItem value="cold">❄️ Cold</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="text-sm font-medium">Contact Method</label>
                              <Select value={contactMethod} onValueChange={setContactMethod}>
                                <SelectTrigger>
                                  <SelectValue placeholder="How did you contact them?" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="email">Email</SelectItem>
                                  <SelectItem value="phone">Phone</SelectItem>
                                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="text-sm font-medium">Notes</label>
                              <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add notes about this prospect..."
                                rows={3}
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium">Next Follow-up Date</label>
                              <input
                                type="date"
                                value={nextFollowUp}
                                onChange={(e) => setNextFollowUp(e.target.value)}
                                className="w-full p-2 border rounded-md"
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button onClick={handleAddActivity} className="flex-1">
                                Save Activity
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => copyToClipboard(selectedReport?.domain || '')}
                              >
                                <Copy className="h-4 w-4 mr-1" />
                                Copy Domain
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};