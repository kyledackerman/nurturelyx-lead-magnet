import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { RequestPasswordReset } from "./RequestPasswordReset";
import { PasswordResetRequests } from "./PasswordResetRequests";

export const PasswordManagement = () => {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSuperAdmin = async () => {
      const { data, error } = await supabase.rpc('is_super_admin');
      if (!error && data) {
        setIsSuperAdmin(true);
      }
      setLoading(false);
    };

    checkSuperAdmin();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <ChangePasswordForm />
      
      {!isSuperAdmin && <RequestPasswordReset />}
      
      {isSuperAdmin && <PasswordResetRequests />}
    </div>
  );
};
