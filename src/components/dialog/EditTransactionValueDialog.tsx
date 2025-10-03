import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Edit } from "lucide-react";
import { formatCurrency, parseToNumber } from "@/lib/utils";
import { toast } from "sonner";

interface EditTransactionValueDialogProps {
  reportId: string;
  currentValue: number;
  domain: string;
  onUpdate: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "xs";
  showIcon?: boolean;
}

export const EditTransactionValueDialog = ({
  reportId,
  currentValue,
  domain,
  onUpdate,
  variant = "outline",
  size = "sm",
  showIcon = true,
}: EditTransactionValueDialogProps) => {
  const [open, setOpen] = useState(false);
  const [newValue, setNewValue] = useState<number>(currentValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numberValue = parseToNumber(e.target.value);
    setNewValue(numberValue);
    setError("");
  };

  const handleSubmit = async () => {
    if (newValue <= 0) {
      setError("Transaction value must be greater than $0");
      return;
    }

    if (newValue === currentValue) {
      setError("New value must be different from current value");
      return;
    }

    setLoading(true);

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      const { error: functionError } = await supabase.functions.invoke(
        'update-report-transaction-value',
        {
          body: { 
            reportId, 
            newTransactionValue: newValue 
          }
        }
      );

      if (functionError) {
        throw new Error(functionError.message);
      }

      toast.success("Transaction value updated successfully");
      setOpen(false);
      onUpdate();
    } catch (err: any) {
      console.error("Error updating transaction value:", err);
      toast.error(err.message || "Failed to update transaction value");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          {showIcon && <Edit className="h-4 w-4 mr-1" />}
          Edit ATV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Average Transaction Value</DialogTitle>
          <DialogDescription>
            Update the average transaction value for {domain}. This will recalculate all revenue metrics.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="current-value">Current Value</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                id="current-value"
                value={formatCurrency(currentValue)}
                disabled
                className="pl-9 bg-muted"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-value">New Value</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                id="new-value"
                type="text"
                value={newValue ? formatCurrency(newValue) : ""}
                onChange={handleValueChange}
                placeholder="0.00"
                className={`pl-9 ${error ? "border-destructive" : ""}`}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <div className="bg-muted p-3 rounded-md text-sm">
            <p className="text-muted-foreground">
              Updating this value will recalculate:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>Estimated sales lost</li>
              <li>Monthly revenue lost</li>
              <li>Yearly revenue lost</li>
              <li>Monthly revenue breakdown</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Updating..." : "Update Value"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
