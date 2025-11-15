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
    <div className="relative min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 antialiased transition-colors duration-300 dark:from-[#0B1020] dark:to-[#0A0F1D] dark:text-slate-100 overflow-hidden">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-gradient-to-tr from-primary/10 to-primary/5 blur-3xl" />
      </div>

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
        <motion.div 
          variants={item} 
          className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary"
        >
          <Sparkles className="h-3 w-3" />
          AI-powered knowledge discovery
        </motion.div>
        <motion.h1 variants={item} className="mt-8 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-7xl text-foreground">
          Search, discover,<br className="hidden md:inline" /> 
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">master</span>
        </motion.h1>
        <motion.p variants={item} className="mt-6 max-w-md text-lg text-muted-foreground md:text-lg">
          Enterprise-grade search platform for teams. Find any document in milliseconds with faceted search and AI-powered insights.
        </motion.p>
        <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-4">
          <PrimaryLink href={ROUTES.AUTH.SIGNUP} className="gap-2 h-11 px-6 text-base">
            Start free trial
            <ArrowRight className="h-5 w-5" />
          </PrimaryLink>
          <GhostLink href={ROUTES.AUTH.LOGIN} className="gap-2 h-11 px-6 text-base">
            <PlayCircle className="h-5 w-5" />
            Watch demo
          </GhostLink>
        </motion.div>
        <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-8 text-sm">
          <div className="flex items-center gap-2 text-foreground/80">
            <ShieldCheck className="h-5 w-5 text-primary" />
            SOC 2 compliant
          </div>
          <div className="flex items-center gap-2 text-foreground/80">
            <Users className="h-5 w-5 text-primary" />
            Team ready
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="group relative will-change-transform"
    >
      {/* Animated gradient border */}
      <div aria-hidden className="pointer-events-none absolute -inset-[1px] rounded-2xl">
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-40"
          style={{
            background:
              "conic-gradient(from 0deg at 50% 50%, rgba(79,70,229,0.3), rgba(79,70,229,0.1), rgba(79,70,229,0.3))",
            filter: "blur(8px)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white/60 shadow-xl ring-1 ring-black/5 backdrop-blur-md transition-all dark:border-white/10 dark:bg-slate-900/50 dark:ring-white/10">
        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: "radial-gradient(300px 300px at var(--x,50%) var(--y,0%), rgba(79,70,229,0.12), transparent 60%)" }}
        />

        <div className="relative z-10 flex flex-col gap-6 p-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Unified search and discovery</h2>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">
              Find any document, insight, or resource instantly with powerful faceted search and AI-powered previews.
            </p>
          </div>

          <div className="grid gap-3">
            <motion.div 
              whileHover={{ x: 6 }}
              className="flex items-start gap-4 rounded-xl border border-black/5 bg-gradient-to-r from-primary/5 to-transparent p-4 transition-all dark:border-white/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">Smart filtering</div>
                <div className="text-xs text-muted-foreground mt-1">Filter by category, date, teams, and custom tags</div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ x: 6 }}
              className="flex items-start gap-4 rounded-xl border border-black/5 bg-gradient-to-r from-primary/5 to-transparent p-4 transition-all dark:border-white/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">Instant previews</div>
                <div className="text-xs text-muted-foreground mt-1">See snippets, metadata, and search highlights instantly</div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ x: 6 }}
              className="flex items-start gap-4 rounded-xl border border-black/5 bg-gradient-to-r from-primary/5 to-transparent p-4 transition-all dark:border-white/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Rocket className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">Lightning fast</div>
                <div className="text-xs text-muted-foreground mt-1">Sub-millisecond searches across millions of documents</div>
              </div>
            </motion.div>
          </div>

          <div className="pt-4 border-t border-border/30">
            <div className="text-xs text-muted-foreground font-medium">
              ✓ 10+ file types  •  ✓ 99.9% uptime  •  ✓ Real-time indexing
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
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="mx-auto mb-16 max-w-3xl text-center md:mb-20"
      >
        <h2 className="text-4xl font-bold tracking-tight md:text-5xl text-foreground">
          Built for enterprise teams
        </h2>
        <p className="mt-6 text-lg text-muted-foreground">
          Powerful features to search smarter, collaborate faster, and scale with confidence.
        </p>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f, idx) => (
          <motion.div 
            key={f.title as string}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ y: -6 }}
          >
            <div className="group h-full overflow-hidden rounded-xl border border-black/10 bg-white/60 shadow-sm transition-all hover:shadow-xl hover:border-primary/30 dark:border-white/10 dark:bg-slate-900/40 dark:hover:bg-slate-900/60">
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: "linear-gradient(135deg, rgba(79,70,229,0.05), transparent)" }}
              />
              <div className="relative p-8">
                <div className="flex items-start gap-4 mb-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary group-hover:bg-primary/20 transition-colors">
                    {f.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold leading-tight text-foreground">{f.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {f.points.map((p) => (
                    <li key={p} className="flex items-center gap-3 text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" /> 
                      <span className="font-medium">{p}</span>
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
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl border border-black/10 bg-white/60 p-12 shadow-xl dark:border-white/10 dark:bg-slate-900/40"
      >
        {/* Gradient accent */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "radial-gradient(800px 200px at 50% 0%, rgba(79,70,229,0.1), transparent)" }}
        />
        
        <div className="relative grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Documents indexed", value: "500M+", icon: "📊" },
            { label: "Active teams", value: "10k+", icon: "👥" },
            { label: "Search accuracy", value: "99.8%", icon: "🎯" },
            { label: "Response time", value: "<45ms", icon: "⚡" },
          ].map((s, idx) => (
            <motion.div 
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="text-center md:text-left group"
            >
              <div className="text-4xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">{s.value}</div>
              <div className="mt-3 text-sm font-medium text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function CTA() {
  return (
    <section id="pricing" className="relative mx-auto max-w-6xl py-12 md:py-16 lg:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6 }}
        className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white/60 p-10 shadow-xl transition-all hover:shadow-2xl dark:border-white/10 dark:bg-slate-900/40"
      >
        {/* Animated gradient background */}
        <div aria-hidden className="absolute inset-0 opacity-50">
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(79,70,229,0.1), transparent 40%)",
            }}
            animate={{ x: [-1000, 1000] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="relative z-10 grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h3 className="text-3xl font-bold tracking-tight text-foreground">Ready to transform your search — it’s free to try</h3>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              Join thousands of teams discovering VaultScout. Start searching your knowledge base instantly with no credit card required.
            </p>
            <div className="mt-6 flex items-start gap-4 text-sm">
              <div className="flex items-center gap-2 text-foreground">
                <span className="text-lg">✓</span>
                <span>10GB free storage</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <span className="text-lg">✓</span>
                <span>Unlimited documents</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start gap-4 md:items-end">
            <PrimaryLink href={ROUTES.AUTH.SIGNUP} className="gap-2 h-12 px-8 text-base">
              Start free trial now
              <ArrowRight className="h-5 w-5" />
            </PrimaryLink>
            <GhostLink href={ROUTES.AUTH.LOGIN}>Already have an account</GhostLink>
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
