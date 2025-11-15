"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { User, Mail, Calendar, Shield } from "lucide-react";
import { useAuthUser } from "@/hooks/use-auth-store";
import { useAuthProtection } from "@/components/auth/auth-provider";
import { AppNavigation } from "@/components/app-navigation";
import hackLog from "@/lib/logger";

export default function DashboardPage() {
  const user = useAuthUser();
  const { shouldRender } = useAuthProtection();

  React.useEffect(() => {
    hackLog.componentMount('DashboardPage', {
      hasUser: !!user,
      userId: user?.id,
      isEmailVerified: user?.isEmailVerified
    });
  }, [user]);

  // Don't render if user is not authenticated
  if (!shouldRender || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
          <span className="text-sm text-slate-600 dark:text-slate-400">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* App Navigation */}
      <AppNavigation />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              Welcome back, {user.email?.split('@')[0] || 'User'}
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Your workspace is ready. Search, discover, and collaborate with your team.
            </p>
          </div>

          {/* User Info Card */}
          <div className="mb-8 overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md">
            <div className="border-b border-border bg-gradient-to-r from-primary/5 to-primary/2 px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <User className="h-5 w-5 text-primary" />
                Account Information
              </h2>
            </div>
            
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Email */}
                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Email</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                {/* User ID */}
                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">User ID</p>
                    <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
                  </div>
                </div>

                {/* Created At */}
                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Member Since</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Email Verification Status */}
                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    user.isEmailVerified 
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                      : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                  }`}>
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Email Status</p>
                    <p className={`text-sm font-medium ${
                      user.isEmailVerified 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {user.isEmailVerified ? '✓ Verified' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Last Updated */}
              <div className="mt-6 rounded-lg bg-muted p-4">
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(user.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-3">
            <motion.div 
              whileHover={{ y: -2 }}
              className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
            >
              <h3 className="font-semibold text-foreground">Profile Settings</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Update your account information and preferences.
              </p>
              <button className="mt-4 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                Manage Profile →
              </button>
            </motion.div>

            <motion.div 
              whileHover={{ y: -2 }}
              className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
            >
              <h3 className="font-semibold text-foreground">Security</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Change your password and manage security settings.
              </p>
              <button className="mt-4 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                Security Settings →
              </button>
            </motion.div>

            <motion.div 
              whileHover={{ y: -2 }}
              className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
            >
              <h3 className="font-semibold text-foreground">Help & Support</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get help with your account or contact support.
              </p>
              <button className="mt-4 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                Get Help →
              </button>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
