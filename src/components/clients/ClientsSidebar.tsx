import { NavLink } from "react-router-dom";
import { Users, UserPlus, UserCheck, AlertTriangle, LifeBuoy } from "lucide-react";
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
import { useClientSidebarCounts } from "@/hooks/useClientAccounts";

export function ClientsSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { data: counts } = useClientSidebarCounts();

  const views = [
    {
      title: "All Clients",
      url: "/admin/clients",
      icon: Users,
      count: counts?.all || 0,
    },
    {
      title: "Onboarding",
      url: "/admin/clients?status=onboarding",
      icon: UserPlus,
      count: counts?.onboarding || 0,
    },
    {
      title: "Active",
      url: "/admin/clients?status=active",
      icon: UserCheck,
      count: counts?.active || 0,
    },
    {
      title: "At Risk",
      url: "/admin/clients?status=at_risk",
      icon: AlertTriangle,
      count: counts?.at_risk || 0,
      variant: "destructive" as const,
    },
    {
      title: "Support Tickets",
      url: "/admin/clients?view=support",
      icon: LifeBuoy,
      count: counts?.open_tickets || 0,
      variant: counts?.urgent_tickets && counts.urgent_tickets > 0 ? "destructive" as const : undefined,
    },
  ];

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Client Views</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {views.map((view) => (
                <SidebarMenuItem key={view.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={view.url}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      }
                    >
                      <view.icon className="mr-2 h-4 w-4" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{view.title}</span>
                          <Badge
                            variant={view.variant || "secondary"}
                            className="ml-auto"
                          >
                            {view.count}
                          </Badge>
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
