'use client';

import React from 'react';

export default function FooterMinimal() {
  return (
    <footer className="bg-white border-t border-charcoal-100" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          <div>
            <div className="text-xl font-bold tracking-[0.2em] uppercase text-charcoal-900">Agent Loop</div>
            <p className="mt-3 text-sm text-charcoal-500 max-w-md">
              Open 24/7 · The operating system for South African property leaders
            </p>
          </div>

          <div className="flex items-center gap-6" aria-label="Compliance badges">
            <span className="px-3 py-1 text-[10px] tracking-[0.3em] border border-charcoal-200 text-charcoal-700">PPRA</span>
            <span className="px-3 py-1 text-[10px] tracking-[0.3em] border border-charcoal-200 text-charcoal-700">POPIA</span>
            <span className="px-3 py-1 text-[10px] tracking-[0.3em] border border-charcoal-200 text-charcoal-700">FICA</span>
          </div>

          <nav className="flex items-center gap-4" aria-label="Social links">
            <a href="https://www.linkedin.com" aria-label="LinkedIn" className="text-charcoal-600 hover:text-charcoal-900">LinkedIn</a>
            <a href="https://twitter.com" aria-label="Twitter" className="text-charcoal-600 hover:text-charcoal-900">Twitter</a>
            <a href="https://instagram.com" aria-label="Instagram" className="text-charcoal-600 hover:text-charcoal-900">Instagram</a>
            <a href="mailto:hello@example.com" aria-label="Email" className="text-charcoal-600 hover:text-charcoal-900">Email</a>
          </nav>
        </div>

        <div className="mt-12 flex items-center justify-between gap-6 text-xs text-charcoal-500">
          <span>© {new Date().getFullYear()} Agent Loop. All rights reserved.</span>
          <a href="#hero" className="text-charcoal-700 hover:text-charcoal-900" aria-label="Back to top">Back to top ↑</a>
        </div>
      </div>
      <div className="h-1 w-full bg-gradient-to-r from-lime-400 via-sky-400 to-lime-400" aria-hidden="true" />
    </footer>
  );
}
