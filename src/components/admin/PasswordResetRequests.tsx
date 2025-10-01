import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";

interface PasswordResetRequest {
  id: string;
  user_id: string;
  requested_by: string;
  status: string;
  reason: string | null;
  created_at: string;
  requester_email?: string;
  user_email?: string;
}

export const PasswordResetRequests = () => {
  const [requests, setRequests] = useState<PasswordResetRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('password_reset_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Failed to load reset requests");
      console.error(error);
    } else {
      // Fetch user emails for better display
      const requestsWithEmails = await Promise.all(
        (data || []).map(async (req) => {
          const { data: userData } = await supabase.auth.admin.getUserById(req.user_id);
          const { data: requesterData } = await supabase.auth.admin.getUserById(req.requested_by);
          return {
            ...req,
            user_email: userData?.user?.email,
            requester_email: requesterData?.user?.email,
          };
        })
      );
      setRequests(requestsWithEmails);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (requestId: string) => {
    const { error } = await supabase
      .from('password_reset_requests')
      .update({
        status: 'approved',
        approved_by: (await supabase.auth.getUser()).data.user?.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) {
      toast.error("Failed to approve request");
    } else {
      toast.success("Password reset request approved");
      fetchRequests();
    }
  };

  const handleReject = async (requestId: string) => {
    const { error } = await supabase
      .from('password_reset_requests')
      .update({
        status: 'rejected',
        approved_by: (await supabase.auth.getUser()).data.user?.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) {
      toast.error("Failed to reject request");
    } else {
      toast.success("Password reset request rejected");
      fetchRequests();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Password Reset Requests</CardTitle>
          <CardDescription>No pending password reset requests</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password Reset Requests</CardTitle>
        <CardDescription>Review and approve password reset requests from admins</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Requested For</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.user_email || request.user_id}</TableCell>
                <TableCell>{request.requester_email || request.requested_by}</TableCell>
                <TableCell>{request.reason || "No reason provided"}</TableCell>
                <TableCell>{format(new Date(request.created_at), 'MMM d, yyyy')}</TableCell>
                <TableCell className="space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(request.id)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(request.id)}
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
