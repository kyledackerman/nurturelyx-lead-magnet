import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Check, X, Clock, Eye, Loader2 } from "lucide-react";

interface Application {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  sales_experience: string | null;
  why_join: string;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
}

export const AmbassadorApplicationsManager = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchApplications();
    
    // Real-time updates
    const channel = supabase
      .channel('ambassador-applications-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ambassador_applications' },
        () => {
          fetchApplications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('ambassador_applications')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (application: Application) => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('approve-ambassador-application', {
        body: {
          application_id: application.id,
          action: 'approve'
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success(`Approved ${application.full_name}'s application`);
      setSelectedApp(null);
      fetchApplications();
    } catch (error: any) {
      console.error('Error approving application:', error);
      toast.error(error.message || 'Failed to approve application');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('approve-ambassador-application', {
        body: {
          application_id: selectedApp.id,
          action: 'reject',
          rejection_reason: rejectionReason
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success(`Rejected ${selectedApp.full_name}'s application`);
      setShowRejectDialog(false);
      setRejectionReason("");
      setSelectedApp(null);
      fetchApplications();
    } catch (error: any) {
      console.error('Error rejecting application:', error);
      toast.error(error.message || 'Failed to reject application');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20"><Check className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20"><X className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = applications.filter(app => app.status === 'pending').length;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ambassador Applications</CardTitle>
              <CardDescription>
                Review and approve ambassador applications
              </CardDescription>
            </div>
            {pendingCount > 0 && (
              <Badge variant="destructive" className="text-lg px-4 py-2">
                {pendingCount} Pending
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No applications yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.full_name}</TableCell>
                    <TableCell>{app.email}</TableCell>
                    <TableCell>{app.location || '-'}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell>{new Date(app.submitted_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedApp(app)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {app.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleApprove(app)}
                              disabled={processing}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => {
                                setSelectedApp(app);
                                setShowRejectDialog(true);
                              }}
                              disabled={processing}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Application Details Dialog */}
      <Dialog open={selectedApp !== null && !showRejectDialog} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Review {selectedApp?.full_name}'s application
            </DialogDescription>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-sm">{selectedApp.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{selectedApp.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-sm">{selectedApp.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p className="text-sm">{selectedApp.location || '-'}</p>
                </div>
              </div>
              
              {selectedApp.linkedin_url && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">LinkedIn</p>
                  <a href={selectedApp.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    {selectedApp.linkedin_url}
                  </a>
                </div>
              )}

              {selectedApp.sales_experience && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sales Experience</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedApp.sales_experience}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground">Why They Want to Join</p>
                <p className="text-sm whitespace-pre-wrap">{selectedApp.why_join}</p>
              </div>

              {selectedApp.status === 'rejected' && selectedApp.rejection_reason && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground text-red-600">Rejection Reason</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedApp.rejection_reason}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status: {getStatusBadge(selectedApp.status)}</p>
                </div>
                {selectedApp.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => setShowRejectDialog(true)}
                      disabled={processing}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(selectedApp)}
                      disabled={processing}
                    >
                      {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={() => {
        setShowRejectDialog(false);
        setRejectionReason("");
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedApp?.full_name}'s application
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
            >
              {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <X className="w-4 h-4 mr-2" />}
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
