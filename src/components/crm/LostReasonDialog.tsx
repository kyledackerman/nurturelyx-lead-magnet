import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const LOST_REASONS = [
  "Budget Constraints",
  "Timing Not Right",
  "Using Competitor",
  "No Decision Maker Access",
  "Not Interested",
  "No Response",
  "Technical Limitations",
  "Wrong Fit",
  "Other",
] as const;

interface LostReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string, notes: string) => void;
  domain: string;
}

export function LostReasonDialog({
  open,
  onOpenChange,
  onConfirm,
  domain,
}: LostReasonDialogProps) {
  const [lostReason, setLostReason] = useState<string>("");
  const [lostNotes, setLostNotes] = useState("");

  const handleConfirm = () => {
    if (!lostReason) return;
    onConfirm(lostReason, lostNotes);
    setLostReason("");
    setLostNotes("");
  };

  const handleCancel = () => {
    setLostReason("");
    setLostNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Mark as Closed Lost</DialogTitle>
          <DialogDescription>
            Please provide a reason why {domain} was marked as lost. This helps track patterns and improve future outreach.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="lost-reason">Lost Reason *</Label>
            <Select value={lostReason} onValueChange={setLostReason}>
              <SelectTrigger id="lost-reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {LOST_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lost-notes">Additional Notes (Optional)</Label>
            <Textarea
              id="lost-notes"
              placeholder="Add any additional context or details..."
              value={lostNotes}
              onChange={(e) => setLostNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!lostReason}
          >
            Confirm & Close Lost
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
