import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Clock, User, Filter, Search, RefreshCw } from "lucide-react";
import { auditService, AuditLog } from "@/services/auditService";
import { formatDistance, parseISO } from "date-fns";

interface AuditTrailViewerProps {
  recordId?: string;
  tableName?: string;
  title?: string;
  maxHeight?: string;
}

export const AuditTrailViewer: React.FC<AuditTrailViewerProps> = ({
  recordId,
  tableName,
  title = "Audit Trail",
  maxHeight = "400px"
}) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      let logs: AuditLog[];
      
      if (recordId && tableName === 'reports') {
        // For reports, get comprehensive prospect audit summary
        logs = await auditService.getProspectAuditSummary(recordId);
      } else {
        // For other cases, get specific audit logs
        logs = await auditService.getAuditLogs(tableName, recordId);
      }
      
      setAuditLogs(logs);
      setFilteredLogs(logs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [recordId, tableName]);

  useEffect(() => {
    let filtered = auditLogs;

    // Filter by action type
    if (actionFilter !== "all") {
      filtered = filtered.filter(log => log.action_type === actionFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.business_context?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.field_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.old_value?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.new_value?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [auditLogs, actionFilter, searchTerm]);

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'INSERT':
        return 'default';
      case 'UPDATE':
        return 'secondary';
      case 'DELETE':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatLogDescription = (log: AuditLog) => {
    if (log.business_context) {
      return log.business_context;
    }
    
    if (log.field_name) {
      return auditService.generateBusinessContext(log.field_name, log.old_value, log.new_value);
    }
    
    return `${log.action_type} operation on ${log.table_name}`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {title}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAuditLogs}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search audit logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="INSERT">Created</SelectItem>
              <SelectItem value="UPDATE">Updated</SelectItem>
              <SelectItem value="DELETE">Deleted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea style={{ height: maxHeight }}>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading audit trail...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {auditLogs.length === 0 ? 'No audit trail available' : 'No logs match your filters'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log, index) => (
                <div key={log.id} className="relative">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Badge variant={getActionBadgeVariant(log.action_type)}>
                        {log.action_type}
                      </Badge>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">
                        {formatLogDescription(log)}
                      </div>
                      
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistance(parseISO(log.changed_at), new Date(), { addSuffix: true })}
                        </div>
                        
                        {log.changed_by && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            User ID: {log.changed_by.slice(0, 8)}...
                          </div>
                        )}
                        
                        {log.table_name !== tableName && (
                          <Badge variant="outline" className="text-xs">
                            {auditService.formatFieldName(log.table_name)}
                          </Badge>
                        )}
                      </div>
                      
                      {log.field_name && !log.business_context && (
                        <div className="mt-2 text-xs space-y-1">
                          <div className="font-medium text-muted-foreground">
                            {auditService.formatFieldName(log.field_name)}
                          </div>
                          <div className="flex gap-4">
                            {log.old_value && (
                              <div>
                                <span className="text-destructive">Before:</span> {log.old_value}
                              </div>
                            )}
                            {log.new_value && (
                              <div>
                                <span className="text-green-600">After:</span> {log.new_value}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {index < filteredLogs.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};