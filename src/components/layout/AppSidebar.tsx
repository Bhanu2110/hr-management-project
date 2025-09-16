import { 
  Users, 
  Clock, 
  DollarSign, 
  Calendar, 
  BarChart3, 
  FileText, 
  Receipt, 
  FolderOpen, 
  Bell,
  Home,
  Building2
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Home, roles: ['admin', 'employee'] },
  { title: "Employees", url: "/employees", icon: Users, roles: ['admin'] },
  { title: "Attendance", url: "/attendance", icon: Clock, roles: ['admin', 'employee'] },
  { title: "Salary", url: "/salary", icon: DollarSign, roles: ['admin'] },
  { title: "Leave Requests", url: "/leave-requests", icon: Calendar, roles: ['admin', 'employee'] },
  { title: "Reports", url: "/reports", icon: BarChart3, roles: ['admin'] },
  { title: "Salary Slips", url: "/salary-slips", icon: Receipt, roles: ['admin', 'employee'] },
  { title: "Form 16", url: "/form-16", icon: FileText, roles: ['admin', 'employee'] },
  { title: "Documents", url: "/documents", icon: FolderOpen, roles: ['admin', 'employee'] },
  { title: "Notifications", url: "/notifications", icon: Bell, roles: ['admin', 'employee'] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { employee } = useAuth();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const filteredNavItems = navigationItems.filter(item => 
    item.roles.includes(employee?.role || 'employee')
  );

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    const active = isActive(path);
    return `${
      active 
      ? "bg-[#E15B55] text-white font-medium shadow-sm" 
: "text-foreground hover:bg-[#E15B55]/10 hover:text-[#E15B55]"

    
    } transition-all duration-200`;
  };

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-background border-r border-border shadow-nav">
        {/* Logo/Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-bold text-lg text-foreground">HR System</h1>
                <p className="text-xs text-muted-foreground">Management Portal</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup className="px-2 py-4">
          <SidebarGroupLabel className={collapsed ? "sr-only" : "text-muted-foreground text-xs font-medium mb-2"}>
            Main Navigation
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild size="lg">
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className={getNavClassName(item.url)}
                    >
                      <item.icon className={`h-5 w-5 ${collapsed ? "mx-auto" : "mr-3"}`} />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
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