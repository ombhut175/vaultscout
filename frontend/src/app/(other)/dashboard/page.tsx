"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { User, Mail, Calendar, Shield, Settings, Lock, HelpCircle, FileText, Search, Users, Building2, UsersRound } from "lucide-react";
import { useAuthUser } from "@/hooks/use-auth-store";
import { useAuthProtection } from "@/components/auth/auth-provider";
import { AppNavigation } from "@/components/app-navigation";
import { useUser } from "@/hooks/useUser";
import hackLog from "@/lib/logger";

function useInteractiveCard() {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const rx = useSpring(useTransform(my, [0, 1], [4, -4]), { stiffness: 150, damping: 16 });
  const ry = useSpring(useTransform(mx, [0, 1], [-4, 4]), { stiffness: 150, damping: 16 });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    mx.set(x);
    my.set(y);
    el.style.setProperty("--x", `${x * 100}%`);
    el.style.setProperty("--y", `${y * 100}%`);
  }

  function onMouseLeave() {
    mx.set(0.5);
    my.set(0.5);
  }

  return { ref, rx, ry, onMouseMove, onMouseLeave } as const;
}

export default function DashboardPage() {
  const user = useAuthUser();
  const { shouldRender } = useAuthProtection();
  
  // Get user details with organizations to check admin role
  const { user: userDetails } = useUser(user?.id || null);
  
  // Check if user is admin in any organization
  const isAdmin = React.useMemo(() => {
    if (!userDetails?.organizations) return false;
    return userDetails.organizations.some(org => org.role === 'admin');
  }, [userDetails]);

  React.useEffect(() => {
    hackLog.componentMount('DashboardPage', {
      hasUser: !!user,
      userId: user?.id,
      isEmailVerified: user?.isEmailVerified,
      isAdmin
    });
  }, [user, isAdmin]);

  if (!shouldRender || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 antialiased transition-colors duration-300 dark:from-[#0B1020] dark:to-[#0A0F1D] dark:text-slate-100 overflow-hidden">
      {/* Premium background with grid and gradient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-primary/10 to-primary/5 blur-3xl" />
        
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--color-border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--color-border)) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            backgroundPosition: "-1px -1px",
          }}
        />
        
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <AppNavigation />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div variants={itemVariants}>
            <div className="flex flex-col gap-3">
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
                Welcome back, <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">{user.email?.split('@')[0] || 'User'}</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Manage your account, explore features, and stay connected.
              </p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <PremiumCard user={user} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <div>
              <h3 className="text-2xl font-semibold tracking-tight mb-6">Quick Links</h3>
              <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
                <QuickLinkCard href="/documents" icon={FileText} title="Documents" description="View and manage your documents" />
                <QuickLinkCard href="/search" icon={Search} title="Search" description="Search across all documents" />
                {isAdmin && (
                  <>
                    <QuickLinkCard href="/users" icon={Users} title="Users" description="Manage users" />
                    <QuickLinkCard href="/organizations" icon={Building2} title="Organizations" description="Manage organizations" />
                    <QuickLinkCard href="/groups" icon={UsersRound} title="Groups" description="Manage groups" />
                  </>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div>
              <h3 className="text-2xl font-semibold tracking-tight mb-6">Quick Actions</h3>
              <div className="grid gap-6 md:grid-cols-3">
                <ActionCard icon={Settings} title="Profile Settings" description="Update your account information and preferences." />
                <ActionCard icon={Lock} title="Security" description="Change your password and manage security settings." />
                <ActionCard icon={HelpCircle} title="Help & Support" description="Get help with your account or contact support." />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

function PremiumCard({ user }: { user: any }) {
  const { ref, rx, ry, onMouseMove, onMouseLeave } = useInteractiveCard();

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="group relative will-change-transform"
    >
      {/* Animated gradient frame */}
      <div aria-hidden className="pointer-events-none absolute -inset-[1.5px] rounded-[24px]">
        <motion.div
          className="absolute inset-0 rounded-[24px] opacity-40"
          style={{
            background:
              "conic-gradient(from 0deg at 50% 50%, rgba(99,102,241,0.25), rgba(99,102,241,0.15), rgba(99,102,241,0.25))",
            filter: "blur(12px)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Card */}
      <div className="relative overflow-hidden rounded-[22px] border border-black/8 bg-white/50 p-8 shadow-xl ring-1 ring-black/5 backdrop-blur-2xl transition-all dark:border-white/10 dark:bg-slate-900/40 dark:ring-white/10">
        {/* Reactive glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-4 rounded-[22px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(280px 280px at var(--x,50%) var(--y,50%), rgba(99,102,241,0.15), transparent 65%)",
          }}
        />

        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-4 pb-4 border-b border-black/5 dark:border-white/5">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Account Information</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Your profile details and security status</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <InfoItem icon={Mail} label="Email" value={user.email} />
            <InfoItem icon={User} label="User ID" value={user.id.slice(0, 12) + "..."} />
            <InfoItem 
              icon={Calendar} 
              label="Member Since" 
              value={new Date(user.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })} 
            />
            <VerificationItem user={user} />
          </div>

          <div className="rounded-lg border border-black/5 bg-black/[0.02] p-4 dark:border-white/5 dark:bg-white/[0.02]">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-white">Last updated</span> • {new Date(user.updated_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>
    </motion.div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ComponentType<any>; label: string; value: string }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group flex items-center gap-4 rounded-lg border border-black/5 bg-white/40 p-4 transition-all hover:bg-white/60 hover:shadow-md dark:border-white/5 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/12 text-primary group-hover:bg-primary/20 transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider dark:text-slate-400">
          {label}
        </p>
        <p className="text-sm font-medium text-slate-900 truncate dark:text-white">{value}</p>
      </div>
    </motion.div>
  );
}

function VerificationItem({ user }: { user: any }) {
  const isVerified = user.isEmailVerified;
  
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`group flex items-center gap-4 rounded-lg border p-4 transition-all ${
        isVerified
          ? 'border-green-500/20 bg-green-500/[0.04] hover:bg-green-500/[0.08]'
          : 'border-yellow-500/20 bg-yellow-500/[0.04] hover:bg-yellow-500/[0.08]'
      }`}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
        isVerified
          ? 'bg-green-500/20 text-green-600 dark:text-green-400'
          : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
      }`}>
        <Shield className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider dark:text-slate-400">
          Email Status
        </p>
        <p className={`text-sm font-medium ${
          isVerified
            ? 'text-green-600 dark:text-green-400'
            : 'text-yellow-600 dark:text-yellow-400'
        }`}>
          {isVerified ? '✓ Verified' : '◐ Pending'}
        </p>
      </div>
    </motion.div>
  );
}

function QuickLinkCard({ 
  href,
  icon: Icon, 
  title, 
  description 
}: { 
  href: string;
  icon: React.ComponentType<any>; 
  title: string; 
  description: string; 
}) {
  const { ref, rx, ry, onMouseMove, onMouseLeave } = useInteractiveCard();

  return (
    <Link href={href as any}>
      <motion.div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="group relative will-change-transform cursor-pointer"
      >
        {/* Subtle gradient frame */}
        <div aria-hidden className="pointer-events-none absolute -inset-[1px] rounded-[18px]">
          <motion.div
            className="absolute inset-0 rounded-[18px] opacity-20"
            style={{
              background:
                "conic-gradient(from 0deg at 50% 50%, rgba(99,102,241,0.15), rgba(99,102,241,0.08), rgba(99,102,241,0.15))",
              filter: "blur(10px)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Card */}
        <div className="relative overflow-hidden rounded-[16px] border border-black/5 bg-white/40 p-6 shadow-lg ring-1 ring-black/5 backdrop-blur-xl transition-all hover:shadow-xl hover:border-primary/20 dark:border-white/10 dark:bg-slate-900/30 dark:ring-white/10">
          {/* Hover glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-2 rounded-[16px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(180px 180px at var(--x,50%) var(--y,50%), rgba(99,102,241,0.12), transparent 60%)",
            }}
          />

          <div className="relative z-10 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary transition-all group-hover:bg-primary/25">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-semibold tracking-tight">{title}</h4>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{description}</p>
            </div>
          </div>

          {/* Bottom accent */}
          <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </div>
      </motion.div>
    </Link>
  );
}

function ActionCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ComponentType<any>; 
  title: string; 
  description: string; 
}) {
  const { ref, rx, ry, onMouseMove, onMouseLeave } = useInteractiveCard();

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="group relative will-change-transform"
    >
      {/* Subtle gradient frame */}
      <div aria-hidden className="pointer-events-none absolute -inset-[1px] rounded-[18px]">
        <motion.div
          className="absolute inset-0 rounded-[18px] opacity-20"
          style={{
            background:
              "conic-gradient(from 0deg at 50% 50%, rgba(99,102,241,0.15), rgba(99,102,241,0.08), rgba(99,102,241,0.15))",
            filter: "blur(10px)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Card */}
      <div className="relative overflow-hidden rounded-[16px] border border-black/5 bg-white/40 p-6 shadow-lg ring-1 ring-black/5 backdrop-blur-xl transition-all hover:shadow-xl hover:border-primary/20 dark:border-white/10 dark:bg-slate-900/30 dark:ring-white/10">
        {/* Hover glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-2 rounded-[16px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(180px 180px at var(--x,50%) var(--y,50%), rgba(99,102,241,0.12), transparent 60%)",
          }}
        />

        <div className="relative z-10 space-y-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary transition-all group-hover:bg-primary/25">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-lg font-semibold tracking-tight">{title}</h4>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>
          </div>
          <motion.button
            whileHover={{ x: 4 }}
            className="inline-flex text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Learn more <span className="ml-2">→</span>
          </motion.button>
        </div>

        {/* Bottom accent */}
        <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>
    </motion.div>
  );
}
