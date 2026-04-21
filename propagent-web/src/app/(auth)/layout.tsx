import { ClientProviders } from "@/components/providers/ClientProviders";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AgentPing - Authentication",
  description: "Sign in or create your account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientProviders>
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        {children}
      </div>
    </ClientProviders>
  );
}