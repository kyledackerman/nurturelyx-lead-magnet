import { supabase } from "@/integrations/supabase/client";

export const updateProspectStatus = async (
  prospectActivityId: string,
  newStatus: string
) => {
  const { data, error } = await supabase.functions.invoke('update-prospect-status', {
    body: {
      prospect_activity_id: prospectActivityId,
      new_status: newStatus
    }
  });

  if (error) {
    console.error('Error updating prospect status:', error);
    throw error;
  }

  return data;
};
