import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";

export const metadata: Metadata = {
  title: "PropAgent - Property Management",
  description: "Premium property management platform for South Africa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-screen text-slate-100 bg-slate-950">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}