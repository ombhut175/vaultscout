"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import AuthCard, { Field, Input, PasswordInput, SubmitButton, MutedLink } from "../_components/auth-card";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useGuestProtection } from "@/components/auth/auth-provider";
import { ROUTES } from "@/constants/routes";
import hackLog from "@/lib/logger";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoginLoading, loginError, clearErrors } = useAuthStore();
  const { shouldRender } = useGuestProtection();
  const [formErrors, setFormErrors] = React.useState<{ email?: string; password?: string } | null>(null);

  React.useEffect(() => {
    hackLog.componentMount('LoginPage', {
      hasLoginError: !!loginError,
      isLoading: isLoginLoading
    });

    // Clear any previous errors when component mounts
    clearErrors();
  }, [clearErrors]);

  React.useEffect(() => {
    if (loginError) {
      toast.error(loginError);
    }
  }, [loginError]);

  function validate(form: FormData) {
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const nextErrors: { email?: string; password?: string } = {};
    
    if (!email) nextErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Enter a valid email";
    if (!password) nextErrors.password = "Password is required";
    
    return { email, password, nextErrors };
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const { email, password, nextErrors } = validate(form);
    
    hackLog.formSubmit('login', {
      email,
      passwordLength: password.length,
      hasValidationErrors: Object.keys(nextErrors).length > 0,
      component: 'LoginPage'
    });

    // Clear previous errors
    setFormErrors(null);
    clearErrors();

    // Check for validation errors
    if (Object.keys(nextErrors).length) {
      setFormErrors(nextErrors);
      hackLog.formValidation('login', nextErrors);
      return;
    }

    try {
      const success = await login({ email, password });
      
      if (success) {
        hackLog.storeAction('loginRedirect', {
          email,
          redirectTo: ROUTES.DASHBOARD,
          component: 'LoginPage'
        });
        
        toast.success('Welcome back! Login successful.');
        router.push(ROUTES.DASHBOARD);
      }
      // If login failed, error is already in loginError from store
    } catch (error: any) {
      hackLog.error('Login submission failed', {
        error: error.message,
        email,
        component: 'LoginPage'
      });
    }
  }

  // Don't render if user is already authenticated
  if (!shouldRender) {
    return null;
  }

  // Display either form validation errors or API errors
  const displayErrors = formErrors || (loginError ? { password: loginError } : null);

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 md:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="order-2 md:order-1"
      >
        <AuthCard
          title="Welcome back"
          subtitle="Access your knowledge base and search platform"
          footer={
            <div className="space-x-1">
              <span>New to Quodo?</span>
              <MutedLink href={ROUTES.AUTH.SIGNUP}>Create an account</MutedLink>
            </div>
          }
        >
          <form className="grid gap-4" onSubmit={onSubmit}>
            <Field label="Email" error={displayErrors?.email}>
              <Input name="email" type="email" inputMode="email" placeholder="you@school.edu" autoComplete="email" required />
            </Field>

            <Field label="Password" error={displayErrors?.password}>
              <PasswordInput name="password" placeholder="••••••••" autoComplete="current-password" required />
            </Field>

            <div className="flex items-center justify-between">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <input type="checkbox" name="remember" className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <span>Remember me</span>
              </label>
              <MutedLink href={ROUTES.AUTH.FORGOT_PASSWORD}>Forgot password?</MutedLink>
            </div>

            <SubmitButton type="submit" loading={isLoginLoading}>
              Continue
            </SubmitButton>

            <div className="text-center text-xs text-slate-500 dark:text-slate-400">
              By continuing, you agree to our
              <Link href="#" className="mx-1 underline underline-offset-2 hover:text-slate-700 dark:hover:text-white">Terms</Link>
              and
              <Link href="#" className="ml-1 underline underline-offset-2 hover:text-slate-700 dark:hover:text-white">Privacy Policy</Link>.
            </div>
          </form>
        </AuthCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.05 }}
        className="order-1 md:order-2"
      >
        <HeroAside />
      </motion.div>
    </div>
  );
}

function HeroAside() {
  return (
    <div className="relative mx-auto max-w-md md:max-w-none">
      <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-indigo-500/5 p-6 shadow-2xl backdrop-blur-sm dark:border-white/10 dark:from-indigo-500/10 dark:to-indigo-500/5">
        <div className="mb-5">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-3xl">Secure access to your data</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Enterprise-grade search platform with instant document retrieval and team collaboration.
          </p>
        </div>
        <ul className="grid gap-3 text-sm">
          <li className="rounded-xl border border-black/10 bg-white/50 p-3 shadow-sm transition-colors dark:border-white/10 dark:bg-slate-900/40">
            Lightning-fast full-text search
          </li>
          <li className="rounded-xl border border-black/10 bg-white/50 p-3 shadow-sm transition-colors dark:border-white/10 dark:bg-slate-900/40">
            Advanced document preview
          </li>
          <li className="rounded-xl border border-black/10 bg-white/50 p-3 shadow-sm transition-colors dark:border-white/10 dark:bg-slate-900/40">
            Team sharing and permissions
          </li>
        </ul>
      </div>
    </div>
  );
}
