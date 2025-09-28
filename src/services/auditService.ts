import { supabase } from "@/integrations/supabase/client";

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action_type: string;
  field_name?: string | null;
  old_value?: string | null;
  new_value?: string | null;
  changed_by?: string | null;
  changed_at: string;
  ip_address?: string | null;
  user_agent?: string | null;
  session_id?: string | null;
  business_context?: string | null;
  created_at: string;
}

export const auditService = {
  // Log business context with client-side information
  async logBusinessContext(
    tableName: string, 
    recordId: string, 
    context: string
  ): Promise<void> {
    try {
      // Get client information
      const userAgent = navigator.userAgent;
      const sessionId = sessionStorage.getItem('session_id') || crypto.randomUUID();
      
      // Store session ID for future use
      if (!sessionStorage.getItem('session_id')) {
        sessionStorage.setItem('session_id', sessionId);
      }

      const { error } = await supabase.rpc('log_business_context', {
        p_table_name: tableName,
        p_record_id: recordId,
        p_context: context,
        p_user_agent: userAgent,
        p_session_id: sessionId
      });

      if (error) {
        console.error('Error logging business context:', error);
      }
    } catch (error) {
      console.error('Failed to log business context:', error);
    }
  },

  // Get audit logs for a specific record
  async getAuditLogs(
    tableName?: string,
    recordId?: string,
    limit: number = 100
  ): Promise<AuditLog[]> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(limit);

      if (tableName) {
        query = query.eq('table_name', tableName);
      }

      if (recordId) {
        query = query.eq('record_id', recordId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching audit logs:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }
  },

  // Get audit summary for a prospect (activities related to a report)
  async getProspectAuditSummary(reportId: string): Promise<AuditLog[]> {
    try {
      // Get audit logs for both the report and any activities related to it
      const { data: reportLogs, error: reportError } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('table_name', 'reports')
        .eq('record_id', reportId)
        .order('changed_at', { ascending: false });

      const { data: activityLogs, error: activityError } = await supabase
        .from('audit_logs')
        .select(`
          *,
          prospect_activities!record_id (
            report_id
          )
        `)
        .eq('table_name', 'prospect_activities')
        .order('changed_at', { ascending: false });

      if (reportError) throw reportError;
      if (activityError) throw activityError;

      // Filter activity logs to only those related to this report
      const filteredActivityLogs = (activityLogs || []).filter(log => {
        const activity = (log as any).prospect_activities;
        return activity && activity.report_id === reportId;
      });

      // Combine and sort all logs
      const allLogs = [...(reportLogs || []), ...filteredActivityLogs];
      return allLogs.sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());
    } catch (error) {
      console.error('Failed to fetch prospect audit summary:', error);
      return [];
    }
  },

  // Format field names for display
  formatFieldName(fieldName: string): string {
    const fieldMap: Record<string, string> = {
      'status': 'Status',
      'priority': 'Priority',
      'contact_method': 'Contact Method',
      'notes': 'Notes',
      'next_follow_up': 'Next Follow-up',
      'activity_type': 'Activity Type',
      'domain': 'Domain',
      'is_public': 'Visibility',
      'report_data': 'Report Data'
    };

    return fieldMap[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  },

  // Generate business-friendly descriptions for common changes
  generateBusinessContext(
    fieldName: string, 
    oldValue: string | null, 
    newValue: string | null
  ): string {
    const formattedField = this.formatFieldName(fieldName);
    
    if (oldValue === null && newValue !== null) {
      return `${formattedField} set to "${newValue}"`;
    }
    
    if (oldValue !== null && newValue === null) {
      return `${formattedField} cleared (was "${oldValue}")`;
    }
    
    if (oldValue !== newValue) {
      return `${formattedField} changed from "${oldValue}" to "${newValue}"`;
    }
    
    return `${formattedField} updated`;
  }
};