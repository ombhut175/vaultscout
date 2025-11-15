import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import LoggerInit from "@/components/logger-init";
import { Toaster } from "sonner";
import hackLog from "@/lib/logger";
import "./globals.css";

// Initialize logger on app start
if (typeof window === 'undefined') {
  hackLog.info('Application starting - Server Side', { 
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}

export const metadata: Metadata = {
  title: "Quodo - Learning Platform",
  description: "Accelerate your learning journey with personalized courses and expert mentorship",
  generator: "v0.app"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased overflow-x-hidden ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange storageKey="quodo-theme">
          <AuthProvider>
            <LoggerInit />
            {children}
            <Toaster 
              richColors 
              position="top-right"
              toastOptions={{
                duration: 4000,
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>;
}