import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";

export const metadata: Metadata = {
  title: "AgentPing — AI Real Estate Platform",
  description: "South Africa's AI real estate platform. Match properties with buyers, price listings intelligently, and close deals faster.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-screen text-slate-100 bg-slate-950">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-lime-400 focus:text-charcoal-900 focus:rounded-lg focus:font-medium">
          Skip to main content
        </a>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}