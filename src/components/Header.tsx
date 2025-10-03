

import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { User, LogOut, BarChart3, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

const Header = () => {
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const { data, error } = await supabase.rpc('is_admin');
          if (error) throw error;
          setIsAdmin(data || false);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-black border-b border-border sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/b1566634-1aeb-472d-8856-f526a0aa2392.png" 
            alt="NurturelyX Logo" 
            className="h-8 mr-2" 
          />
          <p className="text-xs text-gray-400">Lead Estimation Report</p>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/learn">
            <Button variant="ghost" size="sm" className="text-foreground">
              Learn More
            </Button>
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {user.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    My Reports
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
