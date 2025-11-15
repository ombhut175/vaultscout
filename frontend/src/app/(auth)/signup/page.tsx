"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AuthCard, { Field, Input, PasswordInput, SubmitButton, MutedLink } from "../_components/auth-card";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useGuestProtection } from "@/components/auth/auth-provider";
import { ROUTES } from "@/constants/routes";
import hackLog from "@/lib/logger";

export default function SignupPage() {
  const router = useRouter();
  const { signup, isSignupLoading, signupError, clearErrors } = useAuthStore();
  const { shouldRender } = useGuestProtection();
  const [formErrors, setFormErrors] = React.useState<{ name?: string; email?: string; password?: string; confirm?: string } | null>(null);

  React.useEffect(() => {
    hackLog.componentMount('SignupPage', {
      hasSignupError: !!signupError,
      isLoading: isSignupLoading
    });

    // Clear any previous errors when component mounts
    clearErrors();
  }, [clearErrors]);

  function validate(form: FormData) {
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");
    const nextErrors: { name?: string; email?: string; password?: string; confirm?: string } = {};
    
    if (!name) nextErrors.name = "Your name is required";
    if (!email) nextErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Enter a valid email";
    if (!password) nextErrors.password = "Password is required";
    else if (password.length < 8) nextErrors.password = "At least 8 characters";
    if (confirm !== password) nextErrors.confirm = "Passwords do not match";
    
    return { name, email, password, confirm, nextErrors };
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const { name, email, password, nextErrors } = validate(form);
    
    hackLog.formSubmit('signup', {
      name,
      email,
      passwordLength: password.length,
      hasValidationErrors: Object.keys(nextErrors).length > 0,
      component: 'SignupPage'
    });

    // Clear previous errors
    setFormErrors(null);
    clearErrors();

    // Check for validation errors
    if (Object.keys(nextErrors).length) {
      setFormErrors(nextErrors);
      hackLog.formValidation('signup', nextErrors);
      return;
    }

    try {
      // Backend signup only needs email and password (name is not in the DTO)
      const success = await signup({ email, password });
      
      if (success) {
        hackLog.storeAction('signupRedirect', {
          email,
          redirectTo: ROUTES.AUTH.LOGIN,
          component: 'SignupPage'
        });
        
        toast.success('Account created successfully! Please log in.');
        router.push(ROUTES.AUTH.LOGIN);
      }
      // If signup failed, error is already in signupError from store
    } catch (error: any) {
      hackLog.error('Signup submission failed', {
        error: error.message,
        email,
        component: 'SignupPage'
      });
    }
  }

  // Display either form validation errors or API errors
  const displayErrors = formErrors || (signupError ? { email: signupError } : null);

  // Don't render if user is already authenticated
  if (!shouldRender) {
    return null;
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 md:grid-cols-2">
      <div className="order-2 md:order-1">
        <AuthCard
          title="Create your account"
          subtitle="Join enterprises using VaultScout for intelligent search"
          footer={
            <div className="space-x-1">
              <span>Already have an account?</span>
              <MutedLink href={ROUTES.AUTH.LOGIN}>Sign in</MutedLink>
            </div>
          }
        >
          <form className="grid gap-4" onSubmit={onSubmit}>
            <Field label="Full name" error={displayErrors?.name}>
              <Input name="name" placeholder="Alex Johnson" autoComplete="name" required />
            </Field>

            <Field label="Email" error={displayErrors?.email}>
              <Input name="email" type="email" inputMode="email" placeholder="you@school.edu" autoComplete="email" required />
            </Field>

            <Field label="Password" hint="Use at least 8 characters." error={displayErrors?.password}>
              <PasswordInput name="password" placeholder="••••••••" autoComplete="new-password" required />
            </Field>

            <Field label="Confirm password" error={displayErrors?.confirm}>
              <PasswordInput name="confirm" placeholder="••••••••" autoComplete="new-password" required />
            </Field>

            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <input type="checkbox" name="tos" required className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <span>I agree to the Terms and Privacy Policy</span>
            </label>

            <SubmitButton type="submit" loading={isSignupLoading}>
              Create account
            </SubmitButton>
          </form>
        </AuthCard>
      </div>

      <div className="order-1 md:order-2">
        <SignupAside />
      </div>
    </div>
  );
}

function SignupAside() {
  return (
    <div className="relative mx-auto max-w-md md:max-w-none">
      <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-indigo-500/5 p-6 shadow-2xl backdrop-blur-sm dark:border-white/10 dark:from-indigo-500/10 dark:to-indigo-500/5">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-3xl">Get started with VaultScout</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Powerful search and document management for modern teams.
        </p>
        <div className="mt-4 grid gap-3 text-sm">
          <div className="rounded-xl border border-black/10 bg-white/50 p-3 shadow-sm transition-colors dark:border-white/10 dark:bg-slate-900/40">
            Advanced full-text search
          </div>
          <div className="rounded-xl border border-black/10 bg-white/50 p-3 shadow-sm transition-colors dark:border-white/10 dark:bg-slate-900/40">
            Document collaboration tools
          </div>
          <div className="rounded-xl border border-black/10 bg-white/50 p-3 shadow-sm transition-colors dark:border-white/10 dark:bg-slate-900/40">
            Enterprise-grade security
          </div>
        </div>
      </div>
    </div>
  );
}
