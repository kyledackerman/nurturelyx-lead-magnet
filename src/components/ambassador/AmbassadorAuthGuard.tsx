import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AmbassadorAuthGuardProps {
  children: React.ReactNode;
}

export const AmbassadorAuthGuard = ({ children }: AmbassadorAuthGuardProps) => {
  const [isAmbassador, setIsAmbassador] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [verificationError, setVerificationError] = useState(false);
  const { user, signOut, checkIsAmbassador, checkIsAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkAmbassadorStatus();
  }, [user]);

  const checkAmbassadorStatus = async () => {
    if (!user) {
      setIsAmbassador(false);
      setIsAdmin(false);
      setLoading(false);
      setVerificationError(false);
      return;
    }

    try {
      setLoading(true);
      setVerificationError(false);
      
      const [isAmbassadorStatus, isAdminStatus] = await Promise.all([
        checkIsAmbassador(),
        checkIsAdmin()
      ]);
      
      setIsAmbassador(isAmbassadorStatus);
      setIsAdmin(isAdminStatus);
    } catch (error) {
      console.error('Error verifying ambassador status:', error);
      setVerificationError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleLogin = () => {
    navigate('/auth?redirect=/ambassador');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-2">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">Ambassador Access Required</CardTitle>
            <CardDescription className="text-center">
              Please sign in to access the ambassador program
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLogin} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-warning/10 mx-auto mb-2">
              <Award className="h-6 w-6 text-warning" />
            </div>
            <CardTitle className="text-2xl text-center">Verification Failed</CardTitle>
            <CardDescription className="text-center">
              Could not verify ambassador status. This may be a temporary network issue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={checkAmbassadorStatus} className="w-full">
              Retry Verification
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              Return to Home
            </Button>
            <Button onClick={handleLogout} variant="ghost" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAmbassador && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-2">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">Ambassador Application Required</CardTitle>
            <CardDescription className="text-center">
              You need to be an approved ambassador to access this area
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate('/ambassador/apply')} className="w-full">
              Apply to Become an Ambassador
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};