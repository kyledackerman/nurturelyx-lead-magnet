import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, UserCheck, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Admin {
  user_id: string;
  role: string;
  email?: string;
  display_name?: string;
}

interface AssignmentDropdownProps {
  currentAssignedTo?: string;
  reportId: string;
  onAssignmentChange: () => void;
  disabled?: boolean;
}

export const AssignmentDropdown = ({ 
  currentAssignedTo, 
  reportId, 
  onAssignmentChange, 
  disabled 
}: AssignmentDropdownProps) => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchAdmins();
    checkSuperAdminStatus();
  }, [user]);

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

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-admins');
      
      if (error) throw error;

      // Map the response to our Admin interface
      const adminList: Admin[] = (data.admins || []).map((admin: any) => ({
        user_id: admin.id,
        role: admin.role,
        email: admin.email,
        display_name: admin.email?.split('@')[0]
      }));

      setAdmins(adminList);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to load admin list');
    }
  };

  const handleAssignment = async (assignedTo: string) => {
    if (!reportId) return;
    
    setLoading(true);
    try {
      // Get existing activity
      const { data: existingActivity } = await supabase
        .from('prospect_activities')
        .select('*')
        .eq('report_id', reportId)
        .single();

      const assignmentData = {
        assigned_to: assignedTo === 'unassigned' ? null : assignedTo,
        assigned_by: user?.id,
        assigned_at: assignedTo === 'unassigned' ? null : new Date().toISOString()
      };

      if (existingActivity) {
        // Update existing activity
        const { error } = await supabase
          .from('prospect_activities')
          .update({
            ...assignmentData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingActivity.id);

        if (error) throw error;
      } else {
        // Create new activity with assignment
        const { error } = await supabase
          .from('prospect_activities')
          .insert({
            report_id: reportId,
            activity_type: 'assignment',
            status: 'new',
            priority: 'cold',
            ...assignmentData
          });

        if (error) throw error;
      }

      // Log assignment change
      const assignedAdmin = admins.find(a => a.user_id === assignedTo);
      const businessContext = assignedTo === 'unassigned' 
        ? 'Prospect unassigned from all admins'
        : `Prospect assigned to ${assignedAdmin?.display_name || assignedAdmin?.email || 'Unknown Admin'}`;

      const { auditService } = await import('@/services/auditService');
      await auditService.logBusinessContext(
        'prospect_activities',
        existingActivity?.id || reportId,
        businessContext
      );

      toast.success(assignedTo === 'unassigned' ? 'Prospect unassigned' : 'Prospect assigned successfully');
      onAssignmentChange();
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error('Failed to update assignment');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentAssignedAdmin = () => {
    return admins.find(admin => admin.user_id === currentAssignedTo);
  };

  const canAssign = isSuperAdmin || !currentAssignedTo || currentAssignedTo === user?.id;

  if (!canAssign && currentAssignedTo) {
    const assignedAdmin = getCurrentAssignedAdmin();
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <UserCheck className="h-3 w-3 mr-1" />
          Assigned to {assignedAdmin?.display_name || assignedAdmin?.email || 'Unknown'}
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentAssignedTo || 'unassigned'}
        onValueChange={handleAssignment}
        disabled={disabled || loading}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Assign to admin..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Unassigned
            </div>
          </SelectItem>
          {admins.map((admin) => (
            <SelectItem key={admin.user_id} value={admin.user_id}>
              <div className="flex items-center gap-2">
                {admin.role === 'super_admin' ? (
                  <Shield className="h-4 w-4 text-amber-500" />
                ) : (
                  <UserCheck className="h-4 w-4 text-blue-500" />
                )}
                {admin.display_name || admin.email}
                {admin.user_id === user?.id && (
                  <Badge variant="secondary" className="text-xs">You</Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};