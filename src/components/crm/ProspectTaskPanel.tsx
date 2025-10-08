import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, ChevronUp, Plus, CheckCircle2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  status: string;
}

interface ProspectTaskPanelProps {
  tasks: Task[];
  newTaskTitle: string;
  newTaskDescription: string;
  newTaskDueDate: Date | undefined;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDueDateChange: (date: Date | undefined) => void;
  onCreateTask: () => void;
  onCompleteTask: (taskId: string) => void;
  isCreatingTask: boolean;
}

export function ProspectTaskPanel({
  tasks,
  newTaskTitle,
  newTaskDescription,
  newTaskDueDate,
  onTitleChange,
  onDescriptionChange,
  onDueDateChange,
  onCreateTask,
  onCompleteTask,
  isCreatingTask,
}: ProspectTaskPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pendingTasks = tasks.filter(t => t.status === 'pending');

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="p-3 bg-muted/30 rounded-lg border border-border/40">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between h-auto p-0 hover:bg-transparent">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Tasks</span>
              {pendingTasks.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {pendingTasks.length} pending
                </Badge>
              )}
            </div>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>

        {!isOpen && pendingTasks.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {pendingTasks.map((task) => (
              <Badge key={task.id} variant="outline" className="text-xs">
                {task.title}
              </Badge>
            ))}
          </div>
        )}

        <CollapsibleContent className="space-y-3 mt-3">
          <div className="space-y-2">
            <Input
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              className="h-9 text-sm"
            />
            
            <Textarea
              placeholder="Task description (optional)"
              value={newTaskDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="min-h-[80px] text-sm resize-none"
            />
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full justify-start text-left font-normal h-9",
                    !newTaskDueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newTaskDueDate ? format(newTaskDueDate, "PPP") : "Pick a due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newTaskDueDate}
                  onSelect={onDueDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button
              onClick={onCreateTask}
              disabled={!newTaskTitle || !newTaskDueDate || isCreatingTask}
              size="sm"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>

          {pendingTasks.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/40">
              <p className="text-xs font-medium text-muted-foreground">Pending Tasks</p>
              {pendingTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-2 p-2 bg-background rounded border border-border/40">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCompleteTask(task.id)}
                    className="h-6 w-6 p-0 shrink-0"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Due: {format(new Date(task.due_date), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
