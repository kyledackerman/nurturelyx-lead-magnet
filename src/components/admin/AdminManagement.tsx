import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus, UserMinus, Shield, Mail, Clock, KeyRound, Zap } from "lucide-react";
import { DirectPasswordReset } from "./DirectPasswordReset";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  role: 'admin' | 'super_admin';
}

export const AdminManagement = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [settingUpSuperAdmin, setSettingUpSuperAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [resetPasswordUserEmail, setResetPasswordUserEmail] = useState<string>("");
  const [triggeringAutoEnrich, setTriggeringAutoEnrich] = useState(false);

  useEffect(() => {
    checkSuperAdmin();
    fetchAdmins();
    setupSuperAdmin();
  }, []);

  const checkSuperAdmin = async () => {
    const { data, error } = await supabase.rpc('is_super_admin');
    if (!error && data) {
      setIsSuperAdmin(true);
    }
  };

  const setupSuperAdmin = async () => {
    try {
      setSettingUpSuperAdmin(true);
      const { data, error } = await supabase.functions.invoke('grant-super-admin');
      if (error) {
        console.error('Error setting up super admin:', error);
      } else {
        console.log('Super admin setup:', data);
      }
    } catch (error) {
      console.error('Error setting up super admin:', error);
    } finally {
      setSettingUpSuperAdmin(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-admins');

      if (error) {
        console.error('Error fetching admins:', error);
        throw error;
      }

      setAdmins(data.admins || []);
    } catch (error: any) {
      console.error('Error fetching admins:', error);
      toast.error(error.message || 'Failed to fetch admin list');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteAdmin = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setInviting(true);
    try {
      const { data, error } = await supabase.functions.invoke('make-admin', {
        body: { email: inviteEmail.trim() }
      });

      if (error) throw error;

      toast.success(`Successfully granted admin access to ${inviteEmail}`);
      setInviteEmail("");
      fetchAdmins(); // Refresh the list
    } catch (error: any) {
      console.error('Error inviting admin:', error);
      toast.error(error.message || 'Failed to invite admin');
    } finally {
      setInviting(false);
    }
  };

  const handleRevokeAdmin = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('revoke-admin', {
        body: { user_id: userId }
      });

      if (error) throw error;

      toast.success(`Successfully revoked admin access from ${email}`);
      fetchAdmins(); // Refresh the list
    } catch (error: any) {
      console.error('Error revoking admin:', error);
      toast.error(error.message || 'Failed to revoke admin access');
    }
  };

  const handleTriggerAutoEnrich = async () => {
    setTriggeringAutoEnrich(true);
    try {
      const { data, error } = await supabase.functions.invoke('auto-enrich-needs-enrichment');

      if (error) throw error;

      const result = data as { queued: number; skipped: number; message: string };
      toast.success(result.message || `Started enriching ${result.queued} prospects`);
    } catch (error: any) {
      console.error('Error triggering auto-enrichment:', error);
      toast.error(error.message || 'Failed to trigger auto-enrichment');
    } finally {
      setTriggeringAutoEnrich(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Admin Management</CardTitle>
        </div>
        <CardDescription>
          Manage admin users and permissions. Only admins can invite other admins.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auto-Enrichment Trigger */}
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Auto-Enrichment
          </h4>
          <p className="text-sm text-muted-foreground">
            Manually trigger background enrichment for prospects in "Needs Enrichment". 
            Runs automatically every 10 minutes via scheduled job.
          </p>
          <Button 
            onClick={handleTriggerAutoEnrich} 
            disabled={triggeringAutoEnrich}
            variant="outline"
          >
            <Zap className="h-4 w-4 mr-2" />
            {triggeringAutoEnrich ? 'Starting...' : 'Run Auto-Enrichment Now'}
          </Button>
        </div>

        {/* Invite New Admin */}
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Invite New Admin
          </h4>
          <div className="flex gap-2">
            <Input
              placeholder="Enter email address..."
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInviteAdmin()}
              className="flex-1"
            />
            <Button 
              onClick={handleInviteAdmin} 
              disabled={inviting || !inviteEmail.trim()}
            >
              {inviting ? 'Inviting...' : 'Invite Admin'}
            </Button>
          </div>
        </div>

        {/* Current Admins */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Current Admins ({admins.length})
          </h4>
          
          {loading ? (
            <div className="text-muted-foreground">Loading admins...</div>
          ) : admins.length === 0 ? (
            <div className="text-muted-foreground">No admins found</div>
          ) : (
            <div className="space-y-2">
              {admins.map((admin) => (
                <div 
                  key={admin.id} 
                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{admin.email}</span>
                    </div>
                    <Badge variant={admin.role === 'super_admin' ? 'default' : 'secondary'}>
                      <Shield className="h-3 w-3 mr-1" />
                      {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(admin.created_at).toLocaleDateString()}
                    </div>
                    
                    {isSuperAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setResetPasswordUserId(admin.id);
                          setResetPasswordUserEmail(admin.email);
                        }}
                      >
                        <KeyRound className="h-3 w-3 mr-1" />
                        Reset Password
                      </Button>
                    )}
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          disabled={admin.role === 'super_admin'}
                        >
                          <UserMinus className="h-3 w-3 mr-1" />
                          {admin.role === 'super_admin' ? 'Protected' : 'Revoke'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke Admin Access?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to revoke admin privileges from <strong>{admin.email}</strong>? 
                            This action cannot be undone and they will lose all admin access immediately.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRevokeAdmin(admin.id, admin.email)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Revoke Access
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {resetPasswordUserId && (
          <DirectPasswordReset
            userId={resetPasswordUserId}
            userEmail={resetPasswordUserEmail}
            open={!!resetPasswordUserId}
            onOpenChange={(open) => {
              if (!open) {
                setResetPasswordUserId(null);
                setResetPasswordUserEmail("");
              }
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};