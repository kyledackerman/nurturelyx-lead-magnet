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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  User, 
  DollarSign, 
  Calendar as CalendarIcon, 
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
  Target,
  Edit,
  Save,
  X,
  Plus,
  UserCheck,
  Shield
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuditTrailViewer } from "./AuditTrailViewer";
import { AssignmentDropdown } from "./AssignmentDropdown";
import { OwnershipBadge } from "./OwnershipBadge";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

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
  assigned_to?: string;
  assigned_by?: string;
  assigned_at?: string;
}

interface ProspectProfileProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportData | null;
  onActivityUpdate?: () => void;
}

export const ProspectProfile = ({ isOpen, onClose, report, onActivityUpdate }: ProspectProfileProps) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ProspectActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [assignedAdmin, setAssignedAdmin] = useState<{ email: string; display_name?: string; role: string } | null>(null);
  
  // Editing states
  const [editingDomain, setEditingDomain] = useState(false);
  const [domainValue, setDomainValue] = useState('');
  const [editingTransactionValue, setEditingTransactionValue] = useState(false);
  const [transactionValue, setTransactionValue] = useState(0);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [contactMethod, setContactMethod] = useState('');
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (isOpen && report) {
      fetchAllActivities();
      checkSuperAdminStatus();
      // Initialize editing values
      setDomainValue(report.domain || '');
      setTransactionValue(report.report_data?.avgTransactionValue || 0);
    }
  }, [isOpen, report, user]);

  useEffect(() => {
    if (activities.length > 0) {
      const latest = activities[0];
      setNotesValue(latest.notes || '');
      setContactMethod(latest.contact_method || '');
      setFollowUpDate(latest.next_follow_up ? new Date(latest.next_follow_up) : undefined);
      
      // Fetch assigned admin details
      if (latest.assigned_to) {
        fetchAssignedAdminDetails(latest.assigned_to);
      } else {
        setAssignedAdmin(null);
      }
    }
  }, [activities]);

  const checkSuperAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.rpc('is_super_admin');
      if (error) throw error;
      setIsSuperAdmin(data);
    } catch (error) {
      console.error('Error checking super admin status:', error);
    }
  };

  const fetchAssignedAdminDetails = async (userId: string) => {
    try {
      const { data: userData, error } = await supabase.auth.admin.getUserById(userId);
      if (error) throw error;
      
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (roleError) throw roleError;
      
      setAssignedAdmin({
        email: userData.user?.email || '',
        display_name: userData.user?.user_metadata?.display_name || userData.user?.email?.split('@')[0],
        role: roleData.role
      });
    } catch (error) {
      console.error('Error fetching assigned admin details:', error);
      setAssignedAdmin(null);
    }
  };

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
      case 'not_viable': return 'bg-slate-100 text-slate-800 border-slate-300';
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
      case 'not_viable': return 'bg-slate-100 text-slate-800';
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

  const updateActivity = async (reportId: string, updates: Partial<ProspectActivity>) => {
    if (!reportId) return;
    
    setUpdating(true);
    try {
      // Get existing activity
      const { data: existingActivity } = await supabase
        .from('prospect_activities')
        .select('*')
        .eq('report_id', reportId)
        .single();

      let businessContext = '';

      if (existingActivity) {
        // Generate business context for updates
        if (updates.status && updates.status !== existingActivity.status) {
          businessContext += `Status changed from "${existingActivity.status}" to "${updates.status}". `;
        }
        if (updates.priority && updates.priority !== existingActivity.priority) {
          businessContext += `Priority changed from "${existingActivity.priority}" to "${updates.priority}". `;
        }
        if (updates.contact_method && updates.contact_method !== existingActivity.contact_method) {
          businessContext += `Contact method updated to "${updates.contact_method}". `;
        }
        if (updates.notes && updates.notes !== existingActivity.notes) {
          businessContext += `Notes updated. `;
        }

        // Update existing activity
        const { error } = await supabase
          .from('prospect_activities')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingActivity.id);

        if (error) throw error;

        // Log business context if we have meaningful changes
        if (businessContext.trim()) {
          const { auditService } = await import('@/services/auditService');
          await auditService.logBusinessContext(
            'prospect_activities',
            existingActivity.id,
            businessContext.trim()
          );
        }
      } else {
        // Create new activity
        businessContext = `New prospect created with status "${updates.status || 'new'}" and priority "${updates.priority || 'cold'}".`;

        const { data: newActivity, error } = await supabase
          .from('prospect_activities')
          .insert({
            report_id: reportId,
            activity_type: 'status_update',
            ...updates
          })
          .select()
          .single();

        if (error) throw error;

        // Log business context for new activity
        const { auditService } = await import('@/services/auditService');
        await auditService.logBusinessContext(
          'prospect_activities',
          newActivity.id,
          businessContext
        );
      }

      // Refresh activities
      await fetchAllActivities();
      
      toast.success('Prospect updated successfully');
    } catch (error) {
      console.error('Error updating activity:', error);
      toast.error('Failed to update prospect');
    } finally {
      setUpdating(false);
    }
  };

  const updateDomain = async () => {
    if (!report || !domainValue.trim()) return;
    
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('reports')
        .update({ domain: domainValue.trim() })
        .eq('id', report.id);

      if (error) throw error;
      
      toast.success('Domain updated successfully');
      setEditingDomain(false);
      onActivityUpdate?.();
    } catch (error) {
      console.error('Error updating domain:', error);
      toast.error('Failed to update domain');
    } finally {
      setUpdating(false);
    }
  };

  const updateTransactionValue = async () => {
    if (!report || transactionValue <= 0) return;
    
    setUpdating(true);
    try {
      const updatedReportData = {
        ...report.report_data,
        avgTransactionValue: transactionValue
      };

      const { error } = await supabase
        .from('reports')
        .update({ report_data: updatedReportData })
        .eq('id', report.id);

      if (error) throw error;
      
      toast.success('Transaction value updated successfully');
      setEditingTransactionValue(false);
      onActivityUpdate?.();
    } catch (error) {
      console.error('Error updating transaction value:', error);
      toast.error('Failed to update transaction value');
    } finally {
      setUpdating(false);
    }
  };

  const updateNotes = async () => {
    if (!report) return;
    
    const updates = {
      notes: notesValue.trim(),
      contact_method: contactMethod || null
    };

    await updateActivity(report.id, updates);
    setEditingNotes(false);
  };

  const addNewActivity = async () => {
    if (!report) return;
    
    setUpdating(true);
    try {
      const { data: newActivity, error } = await supabase
        .from('prospect_activities')
        .insert({
          report_id: report.id,
          activity_type: 'manual_entry',
          status: activities[0]?.status || 'new',
          priority: activities[0]?.priority || 'cold',
          notes: '',
          contact_method: null,
          next_follow_up: null
        })
        .select()
        .single();

      if (error) throw error;

      await fetchAllActivities();
      toast.success('New activity added');
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error('Failed to add activity');
    } finally {
      setUpdating(false);
    }
  };

  const latestActivity = activities[0];
  const monthlyRevenue = report?.report_data?.monthlyRevenueLost || 0;
  const yearlyRevenue = report?.report_data?.yearlyRevenueLost || 0;
  const missedLeads = report?.report_data?.missedLeads || 0;
  const avgTransactionValue = report?.report_data?.avgTransactionValue || 0;
  const assignedTo = latestActivity?.assigned_to;
  
  const canEdit = isSuperAdmin || !assignedTo || assignedTo === user?.id;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader className="pb-6">
          <div className="flex items-center gap-3">
            <Building className="h-6 w-6 text-primary" />
            <div className="flex-1">
              {editingDomain ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={domainValue}
                    onChange={(e) => setDomainValue(e.target.value)}
                    className="text-xl font-semibold"
                    placeholder="Enter domain name"
                  />
                  <Button size="sm" onClick={updateDomain} disabled={updating}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setEditingDomain(false);
                    setDomainValue(report?.domain || '');
                  }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-xl">{report?.domain}</SheetTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingDomain(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <SheetDescription>
                Prospect profile • Created {report && formatDateShort(report.created_at)}
              </SheetDescription>
            </div>
            <div className="flex flex-col gap-2">
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
              <OwnershipBadge 
                assignedTo={assignedTo}
                assignedAdminName={assignedAdmin?.display_name || assignedAdmin?.email}
                assignedAdminRole={assignedAdmin?.role}
              />
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assignment">Assignment</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Details</TabsTrigger>
            <TabsTrigger value="activity">Activity History</TabsTrigger>
          </TabsList>

          <TabsContent value="assignment" className="space-y-6">
            {/* Assignment Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Prospect Assignment
                </CardTitle>
                <CardDescription>
                  Manage who is responsible for this high-value prospect
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Currently Assigned To</Label>
                  <OwnershipBadge 
                    assignedTo={assignedTo}
                    assignedAdminName={assignedAdmin?.display_name || assignedAdmin?.email}
                    assignedAdminRole={assignedAdmin?.role}
                  />
                </div>
                
                {assignedTo && latestActivity?.assigned_at && (
                  <div className="text-sm text-muted-foreground">
                    Assigned on {formatDate(latestActivity.assigned_at)}
                    {latestActivity.assigned_by && latestActivity.assigned_by !== assignedTo && (
                      <span> by {latestActivity.assigned_by === user?.id ? 'you' : 'another admin'}</span>
                    )}
                  </div>
                )}
                
                {(isSuperAdmin || (!assignedTo)) && (
                  <div className="space-y-2">
                    <Label>Reassign Prospect</Label>
                    <AssignmentDropdown
                      currentAssignedTo={assignedTo}
                      reportId={report?.id || ''}
                      onAssignmentChange={() => {
                        fetchAllActivities();
                        onActivityUpdate?.();
                      }}
                    />
                  </div>
                )}
                
                {assignedTo && assignedTo !== user?.id && !isSuperAdmin && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">Limited Access</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      This prospect is assigned to another admin. You can view but not edit.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

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
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Avg Transaction</p>
                      {editingTransactionValue ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="number"
                            value={transactionValue}
                            onChange={(e) => setTransactionValue(Number(e.target.value))}
                            className="text-xl font-bold h-8"
                            min="0"
                            step="0.01"
                          />
                          <Button size="xs" onClick={updateTransactionValue} disabled={updating}>
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button size="xs" variant="outline" onClick={() => {
                            setEditingTransactionValue(false);
                            setTransactionValue(report?.report_data?.avgTransactionValue || 0);
                          }}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="text-xl font-bold">{formatCurrency(avgTransactionValue)}</p>
                          {canEdit && (
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => setEditingTransactionValue(true)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={latestActivity?.status || 'new'} 
                      onValueChange={(value) => updateActivity(report.id, { status: value })}
                      disabled={updating || !canEdit}
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
                        <SelectItem value="not_viable">Not Viable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={latestActivity?.priority || 'cold'} 
                      onValueChange={(value) => updateActivity(report.id, { priority: value })}
                      disabled={updating || !canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hot">🔥 Hot</SelectItem>
                        <SelectItem value="warm">🌡️ Warm</SelectItem>
                        <SelectItem value="cold">❄️ Cold</SelectItem>
                        <SelectItem value="not_viable">🚫 Not Viable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Contact Method */}
                <div className="mt-4">
                  <Label htmlFor="contact-method">Contact Method</Label>
                  <Select 
                    value={contactMethod} 
                    onValueChange={setContactMethod}
                    disabled={!canEdit}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes Section */}
                <div className="mt-4">
                  <Label htmlFor="notes">Notes</Label>
                  <div className="mt-1">
                    {editingNotes ? (
                      <div className="space-y-2">
                        <Textarea
                          value={notesValue}
                          onChange={(e) => setNotesValue(e.target.value)}
                          placeholder="Add notes about this prospect..."
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={updateNotes} disabled={updating || !canEdit}>
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            setEditingNotes(false);
                            setNotesValue(latestActivity?.notes || '');
                          }}>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className={`min-h-[80px] p-3 border rounded-md transition-colors ${
                          canEdit 
                            ? 'cursor-pointer hover:bg-muted/50' 
                            : 'cursor-not-allowed opacity-60'
                        }`}
                        onClick={() => canEdit && setEditingNotes(true)}
                      >
                        {notesValue ? (
                          <p className="text-sm">{notesValue}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">Click to add notes...</p>
                        )}
                        <Edit className="h-4 w-4 mt-2 text-muted-foreground" />
                      </div>
                    )}
                  </div>
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
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Activity Timeline
                    {activities.length > 0 && (
                      <Badge variant="secondary">{activities.length}</Badge>
                    )}
                  </CardTitle>
                  <Button onClick={addNewActivity} disabled={updating} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Activity
                  </Button>
                </div>
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
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comprehensive Audit Trail */}
            <AuditTrailViewer
              recordId={report?.id}
              tableName="reports"
              title="Complete Audit Trail"
              maxHeight="400px"
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};