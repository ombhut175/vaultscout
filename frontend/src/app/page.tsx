"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { ROUTES } from "@/constants/routes";
import hackLog from "@/lib/logger";
import {
  GraduationCap,
  Rocket,
  BrainCircuit,
  BookOpenCheck,
  ShieldCheck,
  Users,
  Sparkles,
  ArrowRight,
  PlayCircle,
} from "lucide-react";

// Motion variants
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] as const } },
};

type Feature = {
  title: string;
  desc: string;
  icon: React.ReactNode;
  points: string[];
};

export default function LandingPage() {
  React.useEffect(() => {
    hackLog.componentMount('LandingPage', {
      timestamp: new Date().toISOString(),
      route: '/',
    });
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 antialiased transition-colors duration-300 dark:from-[#0B1020] dark:to-[#0A0F1D] dark:text-slate-100">
      <Header />

      <main className="relative px-4 md:px-6">
        <Hero />
        <Highlights />
        <Stats />
        <CTA />
        <Footer />
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-black/5 bg-white/70 backdrop-blur-md transition-colors dark:border-white/10 dark:bg-slate-900/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="font-semibold text-sm text-foreground">VaultScout</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex text-sm">
          <HeaderLink href="#features">Features</HeaderLink>
          <HeaderLink href="#how-it-works">How it works</HeaderLink>
          <HeaderLink href="#pricing">Pricing</HeaderLink>
        </nav>

        <div className="flex items-center gap-2">
          <GhostLink href={ROUTES.AUTH.LOGIN} className="hidden sm:inline-flex text-sm">Login</GhostLink>
          <PrimaryLink href={ROUTES.AUTH.SIGNUP} className="text-sm px-3 py-1.5 h-auto">Get started</PrimaryLink>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function HeaderLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href as any}
      className="text-foreground/70 transition-colors hover:text-foreground"
    >
      {children}
    </Link>
  );
}

function Hero() {
  return (
    <section className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 py-16 md:grid-cols-2 md:py-24 lg:py-32">
      <motion.div variants={container} initial="hidden" animate="show" className="order-2 md:order-1">
        <motion.div variants={item} className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground/80">
          <Sparkles className="h-3 w-3 text-primary" />
          AI-powered knowledge discovery
        </motion.div>
        <motion.h1 variants={item} className="mt-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl text-foreground">
          Search, discover, master
        </motion.h1>
        <motion.p variants={item} className="mt-4 max-w-md text-base text-muted-foreground md:text-lg">
          VaultScout helps teams find and organize knowledge with faceted search. Discover insights, track documents, and collaborate seamlessly.
        </motion.p>
        <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
          <PrimaryLink href={ROUTES.AUTH.SIGNUP} className="gap-2">
            Start free
            <ArrowRight className="h-4 w-4" />
          </PrimaryLink>
          <GhostLink href={ROUTES.AUTH.LOGIN} className="gap-2">
            <PlayCircle className="h-4 w-4" />
            Demo
          </GhostLink>
        </motion.div>
        <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-8 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Enterprise-grade security
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4 text-primary" />
            Team collaboration
          </div>
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }} className="order-1 md:order-2">
        <HeroVisual />
      </motion.div>
    </section>
  );
}

function useTilt() {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 150, damping: 16 });
  const ry = useSpring(useTransform(mx, [0, 1], [-8, 8]), { stiffness: 150, damping: 16 });

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
  function onMouseLeave() { mx.set(0.5); my.set(0.5); }
  return { ref, rx, ry, onMouseMove, onMouseLeave } as const;
}

function HeroVisual() {
  const { ref, rx, ry, onMouseMove, onMouseLeave } = useTilt();
  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      className="group relative will-change-transform"
    >
      <div className="relative overflow-hidden rounded-lg border border-border bg-card shadow-lg">
        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: "radial-gradient(280px 280px at var(--x,50%) var(--y,0%), rgba(79,70,229,0.08), transparent 60%)" }}
        />

        <div className="relative z-10 flex flex-col gap-6 p-6 md:p-8">
          <div>
            <h2 className="text-2xl font-semibold text-foreground md:text-3xl">Unified search and discovery</h2>
            <p className="mt-2 text-base text-muted-foreground leading-relaxed">
              Find any document, insight, or resource with powerful faceted search and instant previews.
            </p>
          </div>

          <div className="grid gap-3">
            <motion.div 
              whileHover={{ x: 4 }}
              className="flex items-start gap-3 rounded-md border border-border/50 bg-secondary/60 p-3.5 card-interactive transition-all"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">Smart filtering</div>
                <div className="text-xs text-muted-foreground mt-0.5">Narrow results by category, team, date, and more</div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ x: 4 }}
              className="flex items-start gap-3 rounded-md border border-border/50 bg-secondary/60 p-3.5 card-interactive transition-all"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <BrainCircuit className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">Instant previews</div>
                <div className="text-xs text-muted-foreground mt-0.5">See content snippets and metadata at a glance</div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ x: 4 }}
              className="flex items-start gap-3 rounded-md border border-border/50 bg-secondary/60 p-3.5 card-interactive transition-all"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Rocket className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">Lightning fast</div>
                <div className="text-xs text-muted-foreground mt-0.5">Get results in milliseconds, not seconds</div>
              </div>
            </motion.div>
          </div>

          <div className="pt-2 border-t border-border/50">
            <div className="text-xs text-muted-foreground">
              ✓ Works across 10+ document types  •  ✓ 99.9% uptime SLA
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Highlights() {
  return (
    <section id="features" className="mx-auto max-w-7xl py-16 md:py-24 lg:py-32">
      <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground">Enterprise-grade search built for teams</h2>
        <p className="mt-4 text-base text-muted-foreground">Powerful features designed for knowledge workers and organizations.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <motion.div key={f.title as string} whileHover={{ y: -2 }} whileTap={{ scale: 0.995 }} className="h-full">
            <div className="group h-full overflow-hidden rounded-lg border border-border bg-card shadow-sm card-interactive transition-all hover:shadow-md">
              <div className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    {f.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold leading-tight text-foreground">{f.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {f.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="h-1 w-1 rounded-full bg-primary shrink-0" /> <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

const features: Feature[] = [
  {
    title: "Faceted Search",
    desc: "Refine results with multiple dimensions like team, type, date, and tags.",
    icon: <BrainCircuit className="h-5 w-5" />,
    points: ["Multi-select filters", "Real-time count updates", "Smart suggestions"],
  },
  {
    title: "Document Preview",
    desc: "See snippets and highlights instantly without opening files.",
    icon: <BookOpenCheck className="h-5 w-5" />,
    points: ["Content snippets", "Metadata display", "Quick copy link"],
  },
  {
    title: "Team Collaboration",
    desc: "Share findings, organize documents, and manage access together.",
    icon: <Rocket className="h-5 w-5" />,
    points: ["Permission control", "Activity tracking", "Shared collections"],
  },
];

function Stats() {
  return (
    <section className="mx-auto max-w-7xl py-16 md:py-24 lg:py-32">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
        className="grid gap-6 rounded-lg border border-border bg-card p-8 shadow-sm md:grid-cols-4"
      >
        {[
          { label: "Documents searched", value: "500M+" },
          { label: "Active teams", value: "5k+" },
          { label: "Search accuracy", value: "99.8%" },
          { label: "Avg response time", value: "45ms" },
        ].map((s) => (
          <div key={s.label} className="text-center md:text-left">
            <div className="text-3xl font-bold tracking-tight text-foreground">{s.value}</div>
            <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

function CTA() {
  return (
    <section id="pricing" className="relative mx-auto max-w-6xl py-12 md:py-16 lg:py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-lg border border-border bg-card p-8 shadow-md md:p-12"
      >
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h3 className="text-3xl font-bold tracking-tight text-foreground">Ready to transform your search — it’s free to try</h3>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Join thousands of teams using VaultScout to search smarter. Start free today — no credit card required.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Includes 10GB storage, team collaboration, and full-text search across unlimited documents.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <PrimaryLink href={ROUTES.AUTH.SIGNUP} className="gap-2">
              Start free trial
              <ArrowRight className="h-4 w-4" />
            </PrimaryLink>
            <GhostLink href={ROUTES.AUTH.LOGIN}>Already using VaultScout?</GhostLink>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto mt-16 max-w-7xl border-t border-border py-8 text-sm text-muted-foreground">
      <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-3 text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="font-semibold">VaultScout</span>
          <span className="text-xs text-muted-foreground">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href={ROUTES.AUTH.LOGIN} className="link-underline-anim text-sm">Login</Link>
          <Link href={ROUTES.AUTH.SIGNUP} className="link-underline-anim text-sm">Sign up</Link>
        </div>
      </div>
    </footer>
  );
}



// Styled anchor buttons (no invalid nested button inside Link)
function PrimaryLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <Link
      href={href as any}
      className={[
        "group relative inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold",
        "bg-primary text-primary-foreground shadow-sm transition-all",
        "hover:shadow-md hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        "btn-super",
        className,
      ].filter(Boolean).join(" ")}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
          backgroundSize: "200% 100%",
          mixBlendMode: "overlay",
        }}
      />
    </Link>
  );
}

function GhostLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <Link
      href={href as any}
      className={[
        "relative inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold",
        "border border-border bg-transparent text-primary hover:bg-secondary",
        "transition-all shadow-sm hover:shadow-md",
        className,
      ].filter(Boolean).join(" ")}
    >
      {children}
    </Link>
  );
}
