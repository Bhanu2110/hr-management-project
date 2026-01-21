import {
  Users,
  Clock,
  DollarSign,
  Calendar,
  BarChart3,
  FileText,
  FolderOpen,
  Bell,
  Home,
  User,
  FileSpreadsheet,
  Briefcase
} from "lucide-react";

import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
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

// ✅ Import Image Logo
import logo from "@/assets/images/sts-logo.jpg";

const navigationItems = [
  { title: "Dashboard", url: "/employee/dashboard", adminUrl: "/admin/dashboard", icon: Home, roles: ['admin', 'employee'] },
  { title: "Employees", url: "/employees", icon: Users, roles: ['admin'] },
  { title: "Attendance", url: "/attendance", icon: Clock, roles: ['admin', 'employee'] },
  { title: "Salary", url: "/salary", adminUrl: "/salary", icon: DollarSign, roles: ['admin', 'employee'] },
  { title: "Leave Requests", url: "/leave-requests", icon: Calendar, roles: ['admin', 'employee'] },
  { title: "Reports", url: "/reports", icon: BarChart3, roles: ['admin'] },
  { title: "Form 16", url: "/form-16", icon: FileText, roles: ['admin', 'employee'] },
  {
    title: "Holidays",
    url: "/holidays",
    adminUrl: "/admin/holidays",
    icon: Briefcase,
    roles: ['admin', 'employee']
  },
  { title: "Documents", url: "/documents", icon: FolderOpen, roles: ['admin', 'employee'] },
  { title: "Notifications", url: "/notifications", icon: Bell, roles: ['admin', 'employee'] },
  { title: "Profile", url: "/profile", icon: User, roles: ['admin', 'employee'] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { employee } = useAuth();
  const { themeColor } = useTheme();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const filteredNavItems = navigationItems.filter(item =>
    item.roles.includes(employee?.role || 'employee')
  );

  // Helper function to get the correct URL based on role
  const getUrlForRole = (item: any) => {
    if (item.adminUrl && employee?.role === 'admin') {
      return item.adminUrl;
    }
    return item.url;
  };

  const getDashboardUrl = (role: string | undefined) => {
    if (role === 'admin') return '/admin/dashboard';
    return '/employee/dashboard';
  };

  const isActive = (item: any) => {
    const itemUrl = getUrlForRole(item);
    if (itemUrl === "/") return currentPath === "/";
    return currentPath.startsWith(itemUrl);
  };

  const getNavClassName = (item: any) => {
    const active = isActive(item);
    return `${active
      ? "text-white font-medium shadow-sm"
      : "text-foreground hover:text-[var(--theme-color)]"
      } transition-all duration-200`;
  };

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-background border-r border-border shadow-nav">

        {/* ✅ Logo Only Header — Centered & Full View */}
        <div className="p-4 border-b border-border flex justify-center">
          <NavLink to={getDashboardUrl(employee?.role)}>
            <img
              src={logo}
              alt="Company Logo"
              className={`transition-all duration-200 object-contain ${collapsed ? "w-12 h-12" : "w-36 h-14"}`}
            />
          </NavLink>
        </div>

        <SidebarGroup className="px-2 py-4">
          <SidebarGroupLabel className={collapsed ? "sr-only" : "text-muted-foreground text-xs font-medium mb-2"}>
            Main Navigation
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {filteredNavItems.map((item) => {
                const itemUrl = getUrlForRole(item);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild size="lg">
                      <NavLink
                        to={itemUrl}
                        end={itemUrl === "/"}
                        className={getNavClassName(item)}
                        style={isActive(item) ? { backgroundColor: themeColor } : {}}
                      >
                        <item.icon className={`h-5 w-5 ${collapsed ? "mx-auto" : "mr-3"}`} />
                        {!collapsed && <span className="font-medium">{item.title}</span>}
                      </NavLink>
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
