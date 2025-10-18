import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const ticketSchema = z.object({
  client_account_id: z.string().uuid("Please select a client account"),
  subject: z.string()
    .min(10, "Subject must be at least 10 characters")
    .max(200, "Subject must be less than 200 characters"),
  description: z.string()
    .min(50, "Description must be at least 50 characters")
    .max(2000, "Description must be less than 2000 characters"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

type TicketFormData = z.infer<typeof ticketSchema>;

export default function SubmitSupportTicket() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketCreated, setTicketCreated] = useState<string | null>(null);

  // Fetch client accounts for the dropdown
  const { data: clientAccounts, isLoading: loadingAccounts } = useQuery({
    queryKey: ['client-accounts-for-ticket'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_accounts')
        .select('id, company_name, domain')
        .eq('status', 'active')
        .order('company_name');
      
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      priority: "medium",
    },
  });

  const onSubmit = async (data: TicketFormData) => {
    setIsSubmitting(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('submit-ticket', {
        body: data,
      });

      if (error) throw error;

      setTicketCreated(result.ticket.id);
      toast({
        title: "Ticket submitted",
        description: `Your support ticket #${result.ticket.id.slice(0, 8)} has been created.`,
      });

      // Reset form
      form.reset();
    } catch (error: any) {
      console.error('Error submitting ticket:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (ticketCreated) {
    return (
      <div className="container max-w-2xl mx-auto py-12 px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <CardTitle>Ticket Submitted Successfully</CardTitle>
            <CardDescription>
              Your support ticket has been created and our team will respond shortly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Ticket ID</p>
              <p className="font-mono font-semibold">#{ticketCreated.slice(0, 8)}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setTicketCreated(null)} variant="outline" className="flex-1">
                Submit Another Ticket
              </Button>
              <Button onClick={() => navigate('/admin/clients?view=support')} className="flex-1">
                View All Tickets
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Submit Support Ticket</CardTitle>
          <CardDescription>
            Need help? Submit a support ticket and our team will get back to you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="client_account_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Account</FormLabel>
                    <Select
                      disabled={loadingAccounts || isSubmitting}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clientAccounts?.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.company_name} ({account.domain})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the client account this ticket is for
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Brief description of your issue"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0}/200 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide detailed information about your issue..."
                        className="min-h-[200px] resize-none"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0}/2000 characters (minimum 50)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      disabled={isSubmitting}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low - General question</SelectItem>
                        <SelectItem value="medium">Medium - Issue affecting work</SelectItem>
                        <SelectItem value="high">High - Blocking issue</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the urgency level for this ticket
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || loadingAccounts}
                  className="flex-1"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Ticket
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
