import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Lock, Send, X } from "lucide-react";
import { useSupportTicket, useSupportTicketMessages, useUpdateTicket, useAddTicketMessage } from "@/hooks/useSupportTickets";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface TicketDetailDialogProps {
  ticketId: string | null;
  open: boolean;
  onClose: () => void;
}

const statusColors = {
  open: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  in_progress: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  waiting_client: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  resolved: "bg-green-500/10 text-green-500 border-green-500/20",
  closed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const priorityColors = {
  low: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  medium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  urgent: "bg-red-500/10 text-red-500 border-red-500/20",
};

export const TicketDetailDialog = ({ ticketId, open, onClose }: TicketDetailDialogProps) => {
  const { data: ticket, isLoading: ticketLoading } = useSupportTicket(ticketId);
  const { data: messages, isLoading: messagesLoading } = useSupportTicketMessages(ticketId);
  const { user } = useAuth();
  const updateTicket = useUpdateTicket();
  const addMessage = useAddTicketMessage();

  const [replyMessage, setReplyMessage] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);

  const handleStatusChange = (newStatus: string) => {
    if (!ticketId) return;
    updateTicket.mutate({
      ticketId,
      updates: { status: newStatus as any },
    });
  };

  const handlePriorityChange = (newPriority: string) => {
    if (!ticketId) return;
    updateTicket.mutate({
      ticketId,
      updates: { priority: newPriority as any },
    });
  };

  const handleSendReply = () => {
    if (!ticketId || !replyMessage.trim()) return;

    addMessage.mutate(
      {
        ticketId,
        message: replyMessage.trim(),
        isInternalNote,
      },
      {
        onSuccess: () => {
          setReplyMessage("");
          setIsInternalNote(false);
        },
      }
    );
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <DialogTitle>
                {ticketLoading ? (
                  <Skeleton className="h-6 w-48" />
                ) : (
                  `Ticket #${ticket?.id.slice(0, 8)}`
                )}
              </DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex h-full overflow-hidden">
          {/* Left Column - Main Content */}
          <div className="flex-1 flex flex-col px-6">
            {ticketLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : ticket ? (
              <>
                {/* Ticket Header */}
                <div className="space-y-4 py-4">
                  <div>
                    <h2 className="text-xl font-semibold">{ticket.subject}</h2>
                  </div>
                  <div className="flex gap-2">
                    <Select value={ticket.status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="waiting_client">Waiting Client</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={ticket.priority} onValueChange={handlePriorityChange}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Message Thread */}
                <ScrollArea className="flex-1 py-4">
                  <div className="space-y-4">
                    {messagesLoading ? (
                      [...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))
                    ) : messages && messages.length > 0 ? (
                      messages.map((message) => (
                        <Card key={message.id} className={message.is_internal_note ? "border-orange-500/50" : ""}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="font-medium">
                                  {message.user_id === ticket.submitted_by ? "Client" : "Admin"}
                                </div>
                                {message.is_internal_note && (
                                  <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                                    <Lock className="h-3 w-3 mr-1" />
                                    Internal Note
                                  </Badge>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        No messages yet. Start the conversation...
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Reply Box */}
                <div className="border-t pt-4 pb-4 space-y-3">
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="min-h-24 resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="internal-note"
                        checked={isInternalNote}
                        onCheckedChange={(checked) => setIsInternalNote(checked as boolean)}
                      />
                      <Label htmlFor="internal-note" className="text-sm cursor-pointer">
                        <Lock className="h-3 w-3 inline mr-1" />
                        Internal Note
                      </Label>
                    </div>
                    <Button
                      onClick={handleSendReply}
                      disabled={!replyMessage.trim() || addMessage.isPending}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Reply
                    </Button>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Right Column - Client Context */}
          <div className="w-96 border-l px-6 py-4 space-y-4 overflow-y-auto">
            {ticketLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : ticket ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Client Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">Company</div>
                      <div className="font-medium">{ticket.client_accounts?.company_name}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Domain</div>
                      <div className="font-medium">{ticket.client_accounts?.domain}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Ticket Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">Created</div>
                      <div>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Last Updated</div>
                      <div>{formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}</div>
                    </div>
                    {ticket.resolved_at && (
                      <div>
                        <div className="text-muted-foreground">Resolved</div>
                        <div>{formatDistanceToNow(new Date(ticket.resolved_at), { addSuffix: true })}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
