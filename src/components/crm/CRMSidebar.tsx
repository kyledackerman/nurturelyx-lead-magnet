import { Flame, AlertCircle, Sparkles, Search, Target, Heart, LayoutDashboard, CheckCircle, Mail } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useCRMSidebarCounts } from "@/hooks/useCRMSidebarCounts";

interface CRMSidebarProps {
  selectedView: "warm-inbound" | "new-prospects" | "needs-enrichment" | "ready-outreach" | "dashboard" | "closed" | "needs-review" | "interested" | "missing-emails";
  onViewChange: (view: "warm-inbound" | "new-prospects" | "needs-enrichment" | "ready-outreach" | "dashboard" | "closed" | "needs-review" | "interested" | "missing-emails") => void;
}

const navItems = [
  { title: "Warm Inbound", view: "warm-inbound" as const, icon: Flame },
  { title: "Needs Review", view: "needs-review" as const, icon: AlertCircle },
  { title: "Missing Emails Only", view: "missing-emails" as const, icon: Mail },
  { title: "New Prospects", view: "new-prospects" as const, icon: Sparkles },
  { title: "Needs Enrichment", view: "needs-enrichment" as const, icon: Search },
  { title: "Ready for Outreach", view: "ready-outreach" as const, icon: Target },
  { title: "Interested", view: "interested" as const, icon: Heart },
  { title: "Active Pipeline", view: "dashboard" as const, icon: LayoutDashboard },
  { title: "Closed Deals", view: "closed" as const, icon: CheckCircle },
];

export function CRMSidebar({ selectedView, onViewChange }: CRMSidebarProps) {
  const { state } = useSidebar();
  const { counts, loading } = useCRMSidebarCounts();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>CRM Views</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = selectedView === item.view;
                return (
                  <SidebarMenuItem key={item.view}>
                    <SidebarMenuButton
                      onClick={() => onViewChange(item.view)}
                      isActive={isActive}
                      tooltip={item.title}
                      className={isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {!loading && state === "expanded" && counts[item.view] !== undefined && (
                        <Badge 
                          variant={
                            item.view === 'warm-inbound' || item.view === 'needs-review' 
                              ? 'default' 
                              : 'secondary'
                          }
                          className="ml-auto"
                        >
                          {counts[item.view]}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
