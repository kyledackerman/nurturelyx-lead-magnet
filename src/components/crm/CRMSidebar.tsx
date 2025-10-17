import { Flame, AlertCircle, Sparkles, Loader2, Target, Heart, LayoutDashboard, CheckCircle } from "lucide-react";
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
  selectedView: "new-prospects" | "enriching-now" | "warm-inbound" | "needs-attention" | "ready-outreach" | "active-pipeline" | "interested" | "closed";
  onViewChange: (view: "new-prospects" | "enriching-now" | "warm-inbound" | "needs-attention" | "ready-outreach" | "active-pipeline" | "interested" | "closed") => void;
}

const navItems = [
  { title: "New Prospects", view: "new-prospects" as const, icon: Sparkles },
  { title: "Warm Inbound", view: "warm-inbound" as const, icon: Flame },
  { title: "Enriching Now", view: "enriching-now" as const, icon: Loader2 },
  { title: "Needs Attention", view: "needs-attention" as const, icon: AlertCircle },
  { title: "Ready for Outreach", view: "ready-outreach" as const, icon: Target },
  { title: "Active Pipeline", view: "active-pipeline" as const, icon: LayoutDashboard },
  { title: "Interested", view: "interested" as const, icon: Heart },
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
                            item.view === 'warm-inbound' || item.view === 'needs-attention' 
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
