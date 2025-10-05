import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface Prospect {
  id: string;
  domain: string;
  monthlyRevenue: number;
  priority: string;
  status: string;
  assignedTo: string | null;
  nextFollowUp: string | null;
  reportId: string;
}

interface CRMKanbanViewProps {
  onSelectProspect: (id: string) => void;
}

const STATUS_COLUMNS = [
  { id: "new", label: "New", color: "bg-brand-purple/20", borderColor: "border-brand-purple" },
  { id: "contacted", label: "Contacted", color: "bg-accent/20", borderColor: "border-accent" },
  { id: "proposal", label: "Proposal", color: "bg-blue-100", borderColor: "border-blue-300" },
  { id: "closed_won", label: "Won", color: "bg-green-100", borderColor: "border-green-300" },
  { id: "closed_lost", label: "Lost", color: "bg-muted", borderColor: "border-border" },
  { id: "not_viable", label: "Not Viable", color: "bg-gray-200", borderColor: "border-gray-400" },
];

export default function CRMKanbanView({ onSelectProspect }: CRMKanbanViewProps) {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProspects();
  }, []);

  const fetchProspects = async () => {
    try {
      const { data, error } = await supabase
        .from("prospect_activities")
        .select(`
          id,
          report_id,
          status,
          priority,
          next_follow_up,
          assigned_to,
          reports!inner(
            domain,
            report_data
          )
        `);

      if (error) throw error;

      const mapped = data?.map((p: any) => ({
        id: p.id,
        reportId: p.report_id,
        domain: p.reports.domain,
        monthlyRevenue: p.reports.report_data?.monthlyRevenueLost || 0,
        priority: p.priority,
        status: p.status,
        assignedTo: p.assigned_to,
        nextFollowUp: p.next_follow_up,
      })) || [];

      setProspects(mapped);
    } catch (error) {
      console.error("Error fetching prospects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId;
    
    try {
      const { error } = await supabase
        .from("prospect_activities")
        .update({ status: newStatus })
        .eq("id", draggableId);

      if (error) throw error;

      setProspects((prev) =>
        prev.map((p) => (p.id === draggableId ? { ...p, status: newStatus } : p))
      );

      toast({
        title: "Status updated",
        description: `Moved to ${STATUS_COLUMNS.find(c => c.id === newStatus)?.label}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const isOverdue = (date: string | null): boolean => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const getProspectsByStatus = (status: string) => {
    return prospects.filter((p) => p.status === status);
  };

  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      hot: "border-orange-600 bg-orange-600/10",
      warm: "border-accent bg-accent/10",
      cold: "border-gray-600 bg-gray-600/10",
      not_viable: "border-gray-700 bg-gray-700/10",
    };
    return colors[priority] || "border-muted bg-muted/30";
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUS_COLUMNS.map((column) => {
          const columnProspects = getProspectsByStatus(column.id);
          const totalRevenue = columnProspects.reduce((sum, p) => sum + p.monthlyRevenue, 0);

          return (
            <div key={column.id} className="flex-shrink-0 w-80">
              <Card>
                <CardHeader className={`pb-3 border-l-4 ${column.borderColor} ${column.color}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm font-medium">
                        {column.label}
                      </CardTitle>
                    </div>
                    <Badge variant="secondary">{columnProspects.length}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ${(totalRevenue / 1000).toFixed(1)}K value
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "space-y-2 min-h-[200px] p-2 rounded-lg transition-colors",
                          snapshot.isDraggingOver && "bg-muted"
                        )}
                      >
                        {columnProspects.map((prospect, index) => (
                          <Draggable
                            key={prospect.id}
                            draggableId={prospect.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => onSelectProspect(prospect.id)}
                                className={cn(
                                  "p-3 bg-card border-l-4 rounded-lg cursor-pointer transition-all shadow-sm hover:shadow-md",
                                  snapshot.isDragging && "shadow-lg",
                                  getPriorityColor(prospect.priority),
                                  isOverdue(prospect.nextFollowUp) && "ring-2 ring-orange-600"
                                )}
                              >
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="font-medium text-sm truncate flex-1">
                                      {prospect.domain}
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-xs",
                                        prospect.priority === "hot" 
                                          ? "bg-orange-600 text-white border-orange-400"
                                          : prospect.priority === "warm"
                                          ? "bg-accent text-black border-accent"
                                          : prospect.priority === "cold"
                                          ? "bg-gray-600 text-white border-gray-400"
                                          : "bg-gray-700 text-gray-300 border-gray-500"
                                      )}
                                    >
                                      {prospect.priority}
                                    </Badge>
                                  </div>
                                  
                                   <p className={`text-sm font-semibold ${
                                     prospect.monthlyRevenue > 5000 ? "text-orange-900" : ""
                                   }`}>
                                     ${(prospect.monthlyRevenue / 1000).toFixed(1)}K/mo
                                   </p>

                                   {prospect.nextFollowUp && (
                                     <div
                                       className={cn(
                                         "text-xs",
                                         isOverdue(prospect.nextFollowUp)
                                           ? "text-orange-900 font-bold"
                                           : "text-muted-foreground"
                                       )}
                                     >
                                       {isOverdue(prospect.nextFollowUp) && "⚠️ OVERDUE: "}
                                       {format(new Date(prospect.nextFollowUp), "MMM d")}
                                     </div>
                                   )}

                                  {prospect.assignedTo && (
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs">
                                          {prospect.assignedTo.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {columnProspects.length === 0 && (
                          <p className="text-center text-sm text-muted-foreground py-8">
                            No prospects
                          </p>
                        )}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
