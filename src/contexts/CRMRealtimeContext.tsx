import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

// Phase 1.3: Global real-time subscription manager

interface CRMRealtimeContextType {
  prospects: Map<string, any>;
  contacts: Map<string, any>;
  tasks: Map<string, any>;
  refreshProspects: () => void;
  refreshContacts: () => void;
  refreshTasks: () => void;
}

const CRMRealtimeContext = createContext<CRMRealtimeContextType | undefined>(undefined);

export function CRMRealtimeProvider({ children }: { children: ReactNode }) {
  const [prospects, setProspects] = useState(new Map());
  const [contacts, setContacts] = useState(new Map());
  const [tasks, setTasks] = useState(new Map());
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Single global subscription for prospect_activities
    const prospectChannel = supabase
      .channel('global-prospects')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prospect_activities' },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('Prospect change:', payload);
          setRefreshTrigger(prev => prev + 1);
        }
      )
      .subscribe();

    // Single global subscription for prospect_contacts
    const contactsChannel = supabase
      .channel('global-contacts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prospect_contacts' },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('Contact change:', payload);
          setRefreshTrigger(prev => prev + 1);
        }
      )
      .subscribe();

    // Single global subscription for prospect_tasks
    const tasksChannel = supabase
      .channel('global-tasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prospect_tasks' },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('Task change:', payload);
          setRefreshTrigger(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(prospectChannel);
      supabase.removeChannel(contactsChannel);
      supabase.removeChannel(tasksChannel);
    };
  }, []);

  const refreshProspects = () => setRefreshTrigger(prev => prev + 1);
  const refreshContacts = () => setRefreshTrigger(prev => prev + 1);
  const refreshTasks = () => setRefreshTrigger(prev => prev + 1);

  return (
    <CRMRealtimeContext.Provider 
      value={{ 
        prospects, 
        contacts, 
        tasks, 
        refreshProspects, 
        refreshContacts, 
        refreshTasks 
      }}
    >
      {children}
    </CRMRealtimeContext.Provider>
  );
}

export function useCRMRealtime() {
  const context = useContext(CRMRealtimeContext);
  if (context === undefined) {
    throw new Error('useCRMRealtime must be used within a CRMRealtimeProvider');
  }
  return context;
}
