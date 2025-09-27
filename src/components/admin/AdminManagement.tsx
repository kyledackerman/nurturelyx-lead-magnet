import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus, UserMinus, Shield, Mail, Clock } from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  role: string;
}

export const AdminManagement = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      // Get all admin user_roles with user emails
      const { data: adminRoles, error } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at')
        .eq('role', 'admin');

      if (error) throw error;

      // Get user details for each admin
      const adminPromises = adminRoles.map(async (role) => {
        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(role.user_id);
        if (userError) {
          console.error('Error fetching user:', userError);
          return null;
        }
        return {
          id: role.user_id,
          email: user?.email || 'Unknown',
          created_at: role.created_at,
          role: role.role
        };
      });

      const adminUsers = await Promise.all(adminPromises);
      setAdmins(adminUsers.filter(Boolean) as AdminUser[]);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to fetch admin list');
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
                    <Badge variant="secondary">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(admin.created_at).toLocaleDateString()}
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <UserMinus className="h-3 w-3 mr-1" />
                          Revoke
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
      </CardContent>
    </Card>
  );
};