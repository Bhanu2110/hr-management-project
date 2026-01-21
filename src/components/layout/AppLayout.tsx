import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, User, Search, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RealTimeNotificationBell } from "@/components/notifications/RealTimeNotificationBell";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { useTheme } from "@/context/ThemeContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { employee, signOut, isAdmin } = useAuth();
  const { themeColor } = useTheme();

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-dashboard-bg">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6 shadow-nav">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-muted rounded-md p-2 transition-colors" />
              <div className="hidden md:flex items-center gap-2 max-w-md">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees, documents..."
                  className="border-0 bg-muted/50 focus-visible:ring-1"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <ThemeSwitcher />
              <RealTimeNotificationBell />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback style={{ backgroundColor: themeColor }} className="text-white">
                        {getInitials(employee?.first_name, employee?.last_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>

                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {employee?.first_name} {employee?.last_name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {employee?.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {isAdmin ? 'Administrator' : 'Employee'} • {employee?.department}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}