

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
import { User, LogOut, BarChart3, Shield, Users, Award, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import MobileNav from '@/components/MobileNav';

const Header = () => {
  const { user, signOut, checkIsAdmin, checkIsAmbassador } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAmbassador, setIsAmbassador] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const checkAdminStatus = async () => {
      if (!user) {
        if (mounted) setIsAdmin(false);
        sessionStorage.removeItem('isAdmin');
        return;
      }
      
      // Try cache first for instant render
      const cachedAdmin = sessionStorage.getItem('isAdmin');
      if (cachedAdmin !== null) {
        if (mounted) setIsAdmin(cachedAdmin === 'true');
      }
      
      try {
        const adminStatus = await checkIsAdmin();
        sessionStorage.setItem('isAdmin', String(adminStatus));
        if (mounted) setIsAdmin(adminStatus);
      } catch (error) {
        console.warn('Admin check failed in Header, keeping previous state:', error);
        // Don't demote admin status on errors
      }
    };

    const checkAmbassadorStatus = async () => {
      if (!user) {
        if (mounted) setIsAmbassador(false);
        sessionStorage.removeItem('isAmbassador');
        return;
      }
      
      // Try cache first for instant render
      const cachedAmbassador = sessionStorage.getItem('isAmbassador');
      if (cachedAmbassador !== null) {
        if (mounted) setIsAmbassador(cachedAmbassador === 'true');
      }
      
      try {
        const ambassadorStatus = await checkIsAmbassador();
        sessionStorage.setItem('isAmbassador', String(ambassadorStatus));
        if (mounted) setIsAmbassador(ambassadorStatus);
      } catch (error) {
        console.warn('Ambassador check failed in Header:', error);
      }
    };

    checkAdminStatus();
    checkAmbassadorStatus();
    
    return () => {
      mounted = false;
    };
  }, [user, checkIsAdmin, checkIsAmbassador]);

  const handleSignOut = async () => {
    // Clear cached auth status
    sessionStorage.removeItem('isAdmin');
    sessionStorage.removeItem('isAmbassador');
    await signOut();
  };

  return (
    <header className="bg-black border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center min-w-0 flex-shrink">
          <img 
            src="/lovable-uploads/b1566634-1aeb-472d-8856-f526a0aa2392.png" 
            alt="NurturelyX - Visitor Identification and Lead Generation Platform Logo" 
            className="h-6 md:h-8 mr-2 flex-shrink-0"
            width="120"
            height="32"
            loading="lazy"
          />
          <p className="text-xs text-gray-400 hidden lg:block">Turn anonymous website visitors into qualified leads</p>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-foreground h-10">
                Industries
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background z-50">
              <DropdownMenuItem asChild>
                <Link to="/industries/hvac">HVAC</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/industries/legal">Legal Services</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/industries/real-estate">Real Estate</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/industries/home-services">Home Services</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/industries/automotive">Automotive</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/industries/healthcare">Healthcare</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/how-it-works">
            <Button variant="ghost" size="sm" className="text-foreground h-10">
              How It Works
            </Button>
          </Link>
          <Link to="/learn">
            <Button variant="ghost" size="sm" className="text-foreground h-10">
              Learn
            </Button>
          </Link>
          <Link to="/resources">
            <Button variant="ghost" size="sm" className="text-foreground h-10">
              Resources
            </Button>
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 h-10">
                  <User className="h-4 w-4" />
                  <span className="hidden lg:inline">{user.email}</span>
                  <span className="lg:hidden">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background z-50">
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/crm" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Prospecting CRM
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/clients" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Client Management
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {(isAdmin || isAmbassador) && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/ambassador" className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Ambassador Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/ambassador/marketplace" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Lead Marketplace
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/ambassador/domains" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        My Clients
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/ambassador/resources" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Sales Resources
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
                <DropdownMenuItem asChild>
                  <Link to="/buy-credits" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Buy Credits
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
            <Button asChild variant="outline" size="sm" className="h-10">
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>

        {/* Mobile Navigation */}
        <MobileNav 
          user={user} 
          isAdmin={isAdmin} 
          isAmbassador={isAmbassador} 
          onSignOut={handleSignOut} 
        />
      </div>
    </header>
  );
};

export default Header;
