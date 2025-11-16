import type React from "react";
import { AppNavigation } from "@/components/app-navigation";

export default function OtherLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <AppNavigation />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
