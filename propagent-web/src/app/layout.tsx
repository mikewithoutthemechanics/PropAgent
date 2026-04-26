import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";

export const metadata: Metadata = {
  title: "Agent Loop — AI Real Estate Platform",
  description: "South Africa's AI real estate platform. Match properties with buyers, price listings intelligently, and close deals faster.",
  themeColor: '#0b0f14',
  openGraph: {
    title: 'Agent Loop — AI Real Estate Platform',
    description:
      "South Africa's AI real estate platform. Match properties with buyers, price listings intelligently, and close deals faster.",
    url: 'https://agentloop.co.za',
    siteName: 'Agent Loop',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Modern property exterior',
      },
    ],
    locale: 'en_ZA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agent Loop — AI Real Estate Platform',
    description:
      "South Africa's AI real estate platform. Match properties with buyers, price listings intelligently, and close deals faster.",
    images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* Preconnect for font performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Distinctive typefaces: Syne for display, Inter for body */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
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