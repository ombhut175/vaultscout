"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES, NAV_ITEMS, ADMIN_NAV_ITEMS } from "@/constants/routes";
import { ThemeToggle } from "./theme-toggle";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useUser } from "@/hooks/useUser";
import { Button } from "./ui/button";
import { GraduationCap, LogOut, Shield } from "lucide-react";
import hackLog from "@/lib/logger";

export function AppNavigation() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  
  // Get user details with organizations to check admin role
  const { user: userDetails } = useUser(user?.id || null);
  
  // Check if user is admin in any organization
  const isAdmin = React.useMemo(() => {
    if (!userDetails?.organizations) return false;
    return userDetails.organizations.some(org => org.role === 'admin');
  }, [userDetails]);

  React.useEffect(() => {
    hackLog.componentMount('AppNavigation', {
      currentPath: pathname,
      isAuthenticated: !!user,
      isAdmin,
    });
  }, [pathname, user, isAdmin]);

  const handleLogout = async () => {
    hackLog.authLogout(user?.id);
    await logout();
    hackLog.routeChange(pathname, ROUTES.HOME);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        
        {/* Logo */}
        <div className="mr-4 flex">
          <Link href={ROUTES.HOME} className="mr-6 flex items-center space-x-2">
            <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-tr from-indigo-500 via-violet-500 to-fuchsia-500 ring-1 ring-border">
              <GraduationCap className="h-4 w-4 text-white" />
            </span>
            <span className="font-bold">Quodo</span>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex items-center space-x-6 text-sm font-medium">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href as any}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === item.href ? "text-foreground font-semibold" : "text-foreground/60"
              )}
              onClick={() => {
                if (pathname !== item.href) {
                  hackLog.routeChange(pathname, item.href);
                }
              }}
            >
              {item.title}
            </Link>
          ))}
          
          {/* Admin-only navigation items */}
          {isAdmin && ADMIN_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href as any}
              className={cn(
                "transition-colors hover:text-foreground/80 flex items-center gap-1",
                pathname === item.href ? "text-foreground font-semibold" : "text-foreground/60"
              )}
              onClick={() => {
                if (pathname !== item.href) {
                  hackLog.routeChange(pathname, item.href);
                }
              }}
            >
              {item.title === 'Admin Dashboard' && <Shield className="h-3 w-3" />}
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggle />
          
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user.email?.split('@')[0] || 'User'}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href={ROUTES.AUTH.LOGIN}>
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href={ROUTES.AUTH.SIGNUP}>
                <Button size="sm">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
