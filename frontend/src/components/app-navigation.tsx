"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ROUTES, NAV_ITEMS, ADMIN_NAV_ITEMS } from "@/constants/routes";
import { ThemeToggle } from "./theme-toggle";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useUser } from "@/hooks/useUser";
import { Button } from "./ui/button";
import { LogOut, Shield, Sparkles } from "lucide-react";
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
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      className="sticky top-0 z-50 w-full"
    >
      {/* Glass morphism background with gradient border */}
      <div className="relative">
        {/* Top gradient accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        
        {/* Main nav container */}
        <div className="border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
          
          <div className="container relative flex h-16 items-center">
            {/* Logo with premium styling and animation */}
            <motion.div 
              className="mr-8 flex"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Link href={ROUTES.HOME} className="group flex items-center gap-3">
                {/* Animated logo container */}
                <div className="relative">
                  <motion.div
                    className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary via-primary/80 to-primary opacity-75 blur-sm group-hover:opacity-100 transition-opacity"
                    animate={{ 
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-primary shadow-lg ring-1 ring-primary/30 transition-transform duration-200 group-hover:scale-105">
                    <Shield className="h-5 w-5 text-primary-foreground drop-shadow-lg" />
                  </div>
                </div>
                
                <div className="flex flex-col leading-tight">
                  <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    VaultScout
                  </span>
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5" />
                    Search Platform
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Main Navigation with premium hover effects */}
            <nav className="flex items-center gap-1 text-sm font-medium">
              {NAV_ITEMS.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Link
                    href={item.href as any}
                    className={cn(
                      "relative px-4 py-2.5 rounded-lg transition-all duration-200 group",
                      pathname === item.href 
                        ? "text-foreground font-semibold" 
                        : "text-foreground/60 hover:text-foreground"
                    )}
                    onClick={() => {
                      if (pathname !== item.href) {
                        hackLog.routeChange(pathname, item.href);
                      }
                    }}
                  >
                    {/* Background glow on hover */}
                    <span className={cn(
                      "absolute inset-0 rounded-lg transition-all duration-200",
                      pathname === item.href
                        ? "bg-secondary shadow-sm"
                        : "bg-transparent group-hover:bg-secondary/50"
                    )} />
                    
                    {/* Text */}
                    <span className="relative">{item.title}</span>
                    
                    {/* Active indicator */}
                    {pathname === item.href && (
                      <motion.span 
                        layoutId="activeNav"
                        className="absolute inset-x-4 -bottom-px h-0.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full shadow-sm shadow-primary/50"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
              
              {/* Admin-only navigation items with special styling */}
              {isAdmin && ADMIN_NAV_ITEMS.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (NAV_ITEMS.length + index) * 0.05, duration: 0.3 }}
                >
                  <Link
                    href={item.href as any}
                    className={cn(
                      "relative px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 group",
                      pathname === item.href 
                        ? "text-foreground font-semibold" 
                        : "text-foreground/60 hover:text-foreground"
                    )}
                    onClick={() => {
                      if (pathname !== item.href) {
                        hackLog.routeChange(pathname, item.href);
                      }
                    }}
                  >
                    {/* Special admin glow */}
                    <span className={cn(
                      "absolute inset-0 rounded-lg transition-all duration-200",
                      pathname === item.href
                        ? "bg-gradient-to-r from-primary/10 to-primary/5 shadow-sm border border-primary/20"
                        : "bg-transparent group-hover:bg-gradient-to-r group-hover:from-primary/5 group-hover:to-transparent"
                    )} />
                    
                    {item.title === 'Admin Dashboard' && (
                      <Shield className="relative h-3.5 w-3.5 text-primary" />
                    )}
                    <span className="relative">{item.title}</span>
                    
                    {pathname === item.href && (
                      <motion.span 
                        layoutId="activeNav"
                        className="absolute inset-x-4 -bottom-px h-0.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full shadow-sm shadow-primary/50"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Right side actions with enhanced styling */}
            <div className="flex flex-1 items-center justify-end gap-3">
              <ThemeToggle />
              
              {user ? (
                <div className="flex items-center gap-3">
                  {/* User welcome with premium styling */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50"
                  >
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-foreground">
                      {user.email?.split('@')[0] || 'User'}
                    </span>
                  </motion.div>
                  
                  {/* Premium logout button */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleLogout}
                      className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all shadow-sm"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="hidden sm:inline">Logout</span>
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href={ROUTES.AUTH.LOGIN}>
                    <Button variant="ghost" size="sm" className="hover:bg-secondary">
                      Sign in
                    </Button>
                  </Link>
                  <Link href={ROUTES.AUTH.SIGNUP}>
                    <Button size="sm" className="btn-super shadow-md">
                      Sign up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom gradient accent line */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
      </div>
    </motion.header>
  );
}