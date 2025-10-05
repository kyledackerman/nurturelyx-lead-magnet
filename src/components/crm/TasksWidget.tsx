import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, AlertCircle, Plus } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  report_id: string;
  prospect_activity_id: string | null;
  domain?: string;
}

interface ProspectOption {
  id: string;
  report_id: string;
  domain: string;
}

const TASK_TEMPLATES = [
  "Follow-up call",
  "Send proposal",
  "Check-in email",
  "Demo scheduled",
  "Contract review",
];

export default function TasksWidget() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [selectedProspectId, setSelectedProspectId] = useState("");
  const [availableProspects, setAvailableProspects] = useState<ProspectOption[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
    fetchAvailableProspects();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("prospect_tasks")
        .select(`
          *,
          reports!inner(domain)
        `)
        .eq("status", "pending")
        .order("due_date", { ascending: true });

      if (error) throw error;

      const mapped = data?.map((t: any) => ({
        ...t,
        domain: t.reports?.domain,
      })) || [];

      setTasks(mapped);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableProspects = async () => {
    try {
      const { data, error } = await supabase
        .from("prospect_activities")
        .select(`
          id,
          report_id,
          reports!inner(domain)
        `)
        .in("status", ["new", "contacted", "proposal"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped = data?.map((p: any) => ({
        id: p.id,
        report_id: p.report_id,
        domain: p.reports.domain,
      })) || [];

      setAvailableProspects(mapped);
    } catch (error) {
      console.error("Error fetching prospects:", error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("prospect_tasks")
        .update({ 
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", taskId);

      if (error) throw error;

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast({
        title: "Task completed",
        description: "Great job staying on top of your pipeline!",
      });
    } catch (error) {
      console.error("Error completing task:", error);
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive",
      });
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle || !newTaskDueDate || !selectedProspectId) {
      toast({
        title: "Missing information",
        description: "Please select a prospect and fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const selectedProspect = availableProspects.find(p => p.id === selectedProspectId);
    if (!selectedProspect) {
      toast({
        title: "Error",
        description: "Selected prospect not found",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("prospect_tasks")
        .insert({
          title: newTaskTitle,
          description: newTaskDescription,
          due_date: newTaskDueDate,
          report_id: selectedProspect.report_id,
          prospect_activity_id: selectedProspectId,
          status: "pending",
        });

      if (error) throw error;

      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskDueDate("");
      setSelectedProspectId("");
      setDialogOpen(false);
      fetchTasks();
      
      toast({
        title: "Task created",
        description: "New task added to your list",
      });
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const isOverdue = (date: string): boolean => {
    return new Date(date) < new Date();
  };

  const isDueToday = (date: string): boolean => {
    const today = new Date();
    const dueDate = new Date(date);
    return (
      dueDate.getDate() === today.getDate() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear()
    );
  };

  const isDueTomorrow = (date: string): boolean => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDate = new Date(date);
    return (
      dueDate.getDate() === tomorrow.getDate() &&
      dueDate.getMonth() === tomorrow.getMonth() &&
      dueDate.getFullYear() === tomorrow.getFullYear()
    );
  };

  const overdueTasks = tasks.filter((t) => isOverdue(t.due_date));
  const dueTodayTasks = tasks.filter((t) => isDueToday(t.due_date));
  const dueTomorrowTasks = tasks.filter((t) => isDueTomorrow(t.due_date));

  if (loading) {
    return (
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle className="text-lg">Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Tasks</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="prospect-select">Select Prospect *</Label>
                  <Select value={selectedProspectId} onValueChange={setSelectedProspectId}>
                    <SelectTrigger id="prospect-select">
                      <SelectValue placeholder="Choose a prospect" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProspects.map((prospect) => (
                        <SelectItem key={prospect.id} value={prospect.id}>
                          {prospect.domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quick Templates</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {TASK_TEMPLATES.map((template) => (
                      <Button
                        key={template}
                        variant="outline"
                        size="sm"
                        onClick={() => setNewTaskTitle(template)}
                      >
                        {template}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="task-title">Title *</Label>
                  <Input
                    id="task-title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Task title"
                  />
                </div>
                <div>
                  <Label htmlFor="task-description">Description</Label>
                  <Textarea
                    id="task-description"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Task description"
                  />
                </div>
                <div>
                  <Label htmlFor="task-due-date">Due Date *</Label>
                  <Input
                    id="task-due-date"
                    type="datetime-local"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateTask} className="w-full">
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overdue" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overdue" className="relative">
              Overdue
              {overdueTasks.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  {overdueTasks.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="today" className="relative">
              Today
              {dueTodayTasks.length > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-yellow-500">
                  {dueTodayTasks.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="tomorrow">
              Tomorrow
              {dueTomorrowTasks.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  {dueTomorrowTasks.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overdue" className="space-y-2 mt-4 max-h-[500px] overflow-y-auto">
            {overdueTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 border-l-4 border-l-orange-600 rounded-lg bg-orange-100 border border-orange-300"
              >
                <div className="flex items-start gap-2">
                  <Checkbox
                    onCheckedChange={() => handleCompleteTask(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{task.title}</p>
                    {task.domain && (
                      <p className="text-xs text-gray-700 truncate">
                        {task.domain}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-1 text-xs text-orange-900 font-bold">
                      <AlertCircle className="h-3 w-3" />
                      {format(new Date(task.due_date), "MMM d, h:mm a")}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {overdueTasks.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                No overdue tasks
              </p>
            )}
          </TabsContent>

          <TabsContent value="today" className="space-y-2 mt-4 max-h-[500px] overflow-y-auto">
            {dueTodayTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 border-l-4 border-l-accent rounded-lg bg-accent/5 border border-accent/30"
              >
                <div className="flex items-start gap-2">
                  <Checkbox
                    onCheckedChange={() => handleCompleteTask(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{task.title}</p>
                    {task.domain && (
                      <p className="text-xs text-muted-foreground truncate">
                        {task.domain}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-1 text-xs font-medium">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(task.due_date), "h:mm a")}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {dueTodayTasks.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                No tasks due today
              </p>
            )}
          </TabsContent>

          <TabsContent value="tomorrow" className="space-y-2 mt-4 max-h-[500px] overflow-y-auto">
            {dueTomorrowTasks.map((task) => (
              <div key={task.id} className="p-4 border rounded-lg">
                <div className="flex items-start gap-2">
                  <Checkbox
                    onCheckedChange={() => handleCompleteTask(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{task.title}</p>
                    {task.domain && (
                      <p className="text-xs text-muted-foreground truncate">
                        {task.domain}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(task.due_date), "h:mm a")}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {dueTomorrowTasks.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                No tasks due tomorrow
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
