import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, DollarSign, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuditTrailViewer } from "@/components/admin/AuditTrailViewer";

interface ProspectDetailPanelProps {
  prospectId: string;
  onClose: () => void;
}

export default function ProspectDetailPanel({ prospectId, onClose }: ProspectDetailPanelProps) {
  const [prospect, setProspect] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProspectDetails();
  }, [prospectId]);

  const fetchProspectDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("prospect_activities")
        .select(`
          *,
          reports!inner(
            id,
            domain,
            slug,
            report_data,
            industry,
            city,
            state
          )
        `)
        .eq("id", prospectId)
        .single();

      if (error) throw error;
      setProspect(data);
    } catch (error) {
      console.error("Error fetching prospect details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Sheet open={true} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Loading...</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  if (!prospect) {
    return null;
  }

  const reportData = prospect.reports.report_data;

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>{prospect.reports.domain}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/report/${prospect.reports.slug}`)}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Report
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Status & Priority */}
          <div className="flex gap-2">
            <Badge variant="outline" className="text-sm">
              Status: {prospect.status.replace("_", " ")}
            </Badge>
            <Badge variant="outline" className="text-sm">
              Priority: {prospect.priority}
            </Badge>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                Monthly Revenue Lost
              </div>
              <p className="text-2xl font-bold">
                ${(reportData?.monthlyRevenueLost / 1000 || 0).toFixed(1)}K
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                Yearly Revenue Lost
              </div>
              <p className="text-2xl font-bold">
                ${(reportData?.yearlyRevenueLost / 1000 || 0).toFixed(1)}K
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                Missed Leads/Month
              </div>
              <p className="text-2xl font-bold">
                {reportData?.missedLeads || 0}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                Organic Traffic
              </div>
              <p className="text-2xl font-bold">
                {(reportData?.organicTraffic || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Company Info */}
          {(prospect.reports.industry || prospect.reports.city) && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Company Information</h3>
                <div className="space-y-1 text-sm">
                  {prospect.reports.industry && (
                    <p>
                      <span className="text-muted-foreground">Industry:</span>{" "}
                      {prospect.reports.industry}
                    </p>
                  )}
                  {prospect.reports.city && (
                    <p>
                      <span className="text-muted-foreground">Location:</span>{" "}
                      {prospect.reports.city}
                      {prospect.reports.state && `, ${prospect.reports.state}`}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Activity Notes */}
          {prospect.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {prospect.notes}
                </p>
              </div>
            </>
          )}

          {/* Audit Trail */}
          <Separator />
          <AuditTrailViewer
            recordId={prospectId}
            tableName="prospect_activities"
            title="Activity Timeline"
            maxHeight="400px"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
