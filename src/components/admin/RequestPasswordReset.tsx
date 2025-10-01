import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export const RequestPasswordReset = () => {
  const { requestPasswordReset, user } = useAuth();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    setLoading(true);
    const { error } = await requestPasswordReset(user.id, reason);
    setLoading(false);

    if (error) {
      toast.error("Failed to submit password reset request");
      console.error(error);
    } else {
      toast.success("Password reset request submitted. A super admin will review it.");
      setReason("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Password Reset</CardTitle>
        <CardDescription>
          Submit a password reset request to be approved by a super admin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you need to reset your password..."
              rows={3}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
