import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SupportTicket {
  id: string;
  client_account_id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting_client' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submitted_by: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  client_accounts?: {
    company_name: string;
    domain: string;
  };
}

export interface SupportTicketMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_internal_note: boolean;
  created_at: string;
}

interface TicketFilters {
  status?: string;
  priority?: string;
  clientId?: string;
  assignedTo?: string;
}

export const useSupportTickets = (filters?: TicketFilters) => {
  return useQuery({
    queryKey: ['support-tickets', filters],
    queryFn: async () => {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          client_accounts(company_name, domain)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status as 'open' | 'in_progress' | 'waiting_client' | 'resolved' | 'closed');
      }
      if (filters?.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority as 'low' | 'medium' | 'high' | 'urgent');
      }
      if (filters?.clientId) {
        query = query.eq('client_account_id', filters.clientId);
      }
      if (filters?.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as SupportTicket[];
    },
  });
};

export const useSupportTicket = (ticketId: string | null) => {
  return useQuery({
    queryKey: ['support-ticket', ticketId],
    queryFn: async () => {
      if (!ticketId) return null;

      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          client_accounts(company_name, domain, id, assigned_csm)
        `)
        .eq('id', ticketId)
        .single();

      if (error) throw error;
      return data as SupportTicket;
    },
    enabled: !!ticketId,
  });
};

export const useSupportTicketMessages = (ticketId: string | null) => {
  return useQuery({
    queryKey: ['support-ticket-messages', ticketId],
    queryFn: async () => {
      if (!ticketId) return [];

      const { data, error } = await supabase
        .from('support_ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as SupportTicketMessage[];
    },
    enabled: !!ticketId,
  });
};

export const useCreateTicket = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticket: {
      client_account_id: string;
      subject: string;
      description: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      assigned_to?: string | null;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          ...ticket,
          submitted_by: user.id,
          priority: ticket.priority || 'medium',
        })
        .select()
        .single();

      if (error) throw error;

      // Create initial message with description
      await supabase
        .from('support_ticket_messages')
        .insert({
          ticket_id: data.id,
          user_id: user.id,
          message: ticket.description,
          is_internal_note: false,
        });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast({
        title: "Ticket created",
        description: "Support ticket has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create ticket: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateTicket = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      updates,
    }: {
      ticketId: string;
      updates: {
        status?: 'open' | 'in_progress' | 'waiting_client' | 'resolved' | 'closed';
        priority?: 'low' | 'medium' | 'high' | 'urgent';
        assigned_to?: string | null;
      };
    }) => {
      const updateData: any = { ...updates };
      
      // Auto-set resolved_at when status changes to resolved
      if (updates.status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['support-ticket', variables.ticketId] });
      toast({
        title: "Ticket updated",
        description: "Support ticket has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update ticket: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useAddTicketMessage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      message,
      isInternalNote = false,
    }: {
      ticketId: string;
      message: string;
      isInternalNote?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('support_ticket_messages')
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          message,
          is_internal_note: isInternalNote,
        })
        .select()
        .single();

      if (error) throw error;

      // Update ticket's updated_at timestamp
      await supabase
        .from('support_tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['support-ticket-messages', variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['support-ticket', variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast({
        title: "Message sent",
        description: "Your message has been added to the ticket.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to send message: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useSupportTicketCounts = () => {
  return useQuery({
    queryKey: ['support-ticket-counts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('support_tickets')
        .select('status, priority, assigned_to');

      if (error) throw error;

      const counts = {
        all: data.length,
        open: data.filter(t => t.status === 'open').length,
        in_progress: data.filter(t => t.status === 'in_progress').length,
        urgent: data.filter(t => t.priority === 'urgent').length,
        my_tickets: user ? data.filter(t => t.assigned_to === user.id).length : 0,
      };

      return counts;
    },
  });
};
