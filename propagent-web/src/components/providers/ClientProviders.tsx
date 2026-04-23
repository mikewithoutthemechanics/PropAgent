"use client";

import { AuthProvider } from "@/lib/auth";
import { LenisProvider } from "@/components/shared/Motion";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LenisProvider>{children}</LenisProvider>
    </AuthProvider>
  );
}