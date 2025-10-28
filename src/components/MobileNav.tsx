import { Link } from 'react-router-dom';
import { Menu, X, User, LogOut, BarChart3, Shield, Users, Award, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';

interface MobileNavProps {
  user: any;
  isAdmin: boolean;
  isAmbassador: boolean;
  onSignOut: () => void;
}

const MobileNav = ({ user, isAdmin, isAmbassador, onSignOut }: MobileNavProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden h-10 w-10">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[350px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col space-y-2">
          {/* Industries Accordion */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="industries" className="border-none">
              <AccordionTrigger className="py-4 hover:no-underline text-base font-medium">
                Industries
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col space-y-1 pl-4">
                  <SheetClose asChild>
                    <Link to="/industries/hvac" className="py-3 text-sm hover:text-accent">
                      HVAC
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/industries/legal" className="py-3 text-sm hover:text-accent">
                      Legal Services
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/industries/real-estate" className="py-3 text-sm hover:text-accent">
                      Real Estate
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/industries/home-services" className="py-3 text-sm hover:text-accent">
                      Home Services
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/industries/automotive" className="py-3 text-sm hover:text-accent">
                      Automotive
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/industries/healthcare" className="py-3 text-sm hover:text-accent">
                      Healthcare
                    </Link>
                  </SheetClose>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <SheetClose asChild>
            <Link to="/how-it-works" className="py-4 text-base font-medium hover:text-accent">
              How It Works
            </Link>
          </SheetClose>

          <SheetClose asChild>
            <Link to="/learn" className="py-4 text-base font-medium hover:text-accent">
              Learn
            </Link>
          </SheetClose>

          <SheetClose asChild>
            <Link to="/resources" className="py-4 text-base font-medium hover:text-accent">
              Resources
            </Link>
          </SheetClose>

          <Separator className="my-4" />

          {/* User Menu */}
          {user ? (
            <>
              <div className="py-2 px-3 bg-muted rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  <span className="text-xs font-medium truncate">{user.email}</span>
                </div>
              </div>

              {isAdmin && (
                <>
                  <SheetClose asChild>
                    <Link to="/admin" className="flex items-center gap-3 py-4 text-sm hover:text-accent">
                      <Shield className="h-5 w-5" />
                      Admin Dashboard
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/admin/crm" className="flex items-center gap-3 py-4 text-sm hover:text-accent">
                      <BarChart3 className="h-5 w-5" />
                      Prospecting CRM
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/admin/clients" className="flex items-center gap-3 py-4 text-sm hover:text-accent">
                      <Users className="h-5 w-5" />
                      Client Management
                    </Link>
                  </SheetClose>
                  <Separator className="my-2" />
                </>
              )}

              {(isAdmin || isAmbassador) && (
                <>
                  <SheetClose asChild>
                    <Link to="/ambassador" className="flex items-center gap-3 py-4 text-sm hover:text-accent">
                      <Award className="h-5 w-5" />
                      Ambassador Dashboard
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/ambassador/marketplace" className="flex items-center gap-3 py-4 text-sm hover:text-accent">
                      <BarChart3 className="h-5 w-5" />
                      Lead Marketplace
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/ambassador/domains" className="flex items-center gap-3 py-4 text-sm hover:text-accent">
                      <Users className="h-5 w-5" />
                      My Clients
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/ambassador/resources" className="flex items-center gap-3 py-4 text-sm hover:text-accent">
                      <BookOpen className="h-5 w-5" />
                      Sales Resources
                    </Link>
                  </SheetClose>
                  <Separator className="my-2" />
                </>
              )}

              <SheetClose asChild>
                <Link to="/dashboard" className="flex items-center gap-3 py-4 text-sm hover:text-accent">
                  <BarChart3 className="h-5 w-5" />
                  My Reports
                </Link>
              </SheetClose>

              <Separator className="my-2" />

              <SheetClose asChild>
                <button
                  onClick={onSignOut}
                  className="flex items-center gap-3 py-4 text-sm hover:text-accent w-full text-left"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </SheetClose>
            </>
          ) : (
            <SheetClose asChild>
              <Link to="/auth" className="w-full">
                <Button variant="outline" className="w-full h-12">
                  Sign In
                </Button>
              </Link>
            </SheetClose>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
